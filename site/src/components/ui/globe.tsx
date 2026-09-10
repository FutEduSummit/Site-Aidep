'use client'

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react'
import type { Globo, MarcadorDoGlobo } from '@/lib/globo'
import { useReducedMotionSafe } from '@/hooks/use-media'
import { cn } from '@/lib/utils'

export type CidadeNoGlobo = MarcadorDoGlobo & {
  cidade: string
  uf?: string
  detalhe?: string
  polos: number
  projetos: { slug: string; nome: string; polos: number }[]
}

type GlobeProps = {
  cidades: CidadeNoGlobo[]
  /** Cidade escolhida — controlada pela seção, que também desenha a ficha. */
  escolhida: string | null
  onEscolher: (id: string | null) => void
  /** Só estas cidades ficam acesas. `null` acende todas. */
  visiveis: Set<string> | null
  /** Descrição do globo para quem não o vê. */
  label: string
  /** O que aparece quando o navegador não tem WebGL. */
  semWebgl: ReactNode
  className?: string
}

/** Testa WebGL sem deixar um contexto pendurado. */
function temWebgl(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const contexto =
      canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!contexto) return false
    contexto.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

/** A resposta é a mesma a visita inteira; o teste roda uma vez por aba. */
let suporte: boolean | null = null

/**
 * QUANTO A ETIQUETA SOBE ACIMA DO PONTO PROJETADO
 * -----------------------------------------------
 * A cena devolve a **ponta** do pino — o ponto exato da cidade na
 * superfície — e o desenho do pino sobe daí 34 px de tela
 * (`ALTURA_DO_PINO_EM_PIXELS`, em `lib/globo.ts`). Subir só uma folga curta
 * punha a etiqueta em cima da cabeça do pino: o nome tapava justamente o
 * alfinete que ele nomeia. São os 34 px do pino mais 16 de respiro.
 */
const ETIQUETA_ACIMA_DO_PINO = 50

/**
 * E quanto ela desce quando não cabe em cima.
 *
 * Abaixo da ponta o caminho está livre — o pino só cresce para cima —, e a
 * folga pode ser curta.
 */
const ETIQUETA_ABAIXO_DA_PONTA = 12

const semAssinatura = () => () => {}
const noNavegador = () => (suporte ??= temWebgl())
const noServidor = () => false

/**
 * O navegador desenha WebGL?
 *
 * `useSyncExternalStore` e não `useState` + efeito: o teste precisa do
 * `document`, então no servidor a resposta é sempre `false` — e é isso
 * que faz o HTML sair com o mapa plano dentro, servido a quem tem script
 * bloqueado. Na hidratação a resposta verdadeira chega e o globo assume,
 * sem um segundo ciclo de renderização provocado por um efeito.
 */
function useSuporteAWebgl(): boolean {
  return useSyncExternalStore(semAssinatura, noNavegador, noServidor)
}

/**
 * O GLOBO, DO LADO DO REACT
 * =========================
 * O `<canvas>`, a etiqueta que segue a cidade sob o ponteiro e as três
 * decisões que a cena não deve tomar sozinha: quando existir, quando
 * desenhar e o que fazer quando o navegador não puder desenhá-la.
 *
 * **Quando existir.** O `three` são 600 kB e não entram no pacote da
 * página: o módulo da cena é importado sob demanda, dentro do efeito, e só
 * depois que a seção chega perto da tela. Quem nunca rola até aqui nunca
 * baixa nada disso.
 *
 * **Quando desenhar.** Um laço de `requestAnimationFrame` rodando atrás de
 * dez telas de rolagem é bateria queimada à toa. Um `IntersectionObserver`
 * liga e desliga o laço conforme a seção entra e sai da tela.
 *
 * **Sem WebGL.** Em vez de um retângulo preto, a seção mostra o mapa plano
 * do Brasil — o mesmo das páginas de projeto, servido em HTML pelo
 * servidor. É o `semWebgl`, e ele também é o que aparece antes de o globo
 * terminar de montar.
 *
 * A ETIQUETA
 * ----------
 * A cena devolve, a cada quadro, onde cada marcador caiu na tela. Passar
 * isso por estado do React seriam sessenta renderizações por segundo da
 * seção inteira; a etiqueta é movida por `style.transform` direto no nó, e
 * o React só é avisado quando a *cidade* muda — algumas vezes por minuto.
 */
export function Globe({
  cidades,
  escolhida,
  onEscolher,
  visiveis,
  label,
  semWebgl,
  className,
}: GlobeProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const moldura = useRef<HTMLDivElement>(null)
  const etiqueta = useRef<HTMLDivElement>(null)
  const globo = useRef<Globo | null>(null)

  /* Quem a etiqueta segue neste instante — sem passar pelo React. */
  const seguindo = useRef<string | null>(null)

  /* A altura da etiqueta, guardada. Ela decide se o nome cabe acima do
     pino, e é preciso saber isso a cada quadro — mas medir a cada quadro
     obrigaria o navegador a refazer o layout sessenta vezes por segundo
     para chegar a um número que só muda quando o nome muda. */
  const alturaDaEtiqueta = useRef(0)

  const [sobre, setSobre] = useState<string | null>(null)
  const [pronto, setPronto] = useState(false)

  const suportado = useSuporteAWebgl()
  const semMovimento = useReducedMotionSafe()

  /* Sem esta travessa, trocar de cidade recriaria a cena inteira: o
     efeito de montagem não pode depender das funções que vêm de fora.
     A atualização vai num efeito porque o globo só chama o retorno em
     resposta a um gesto — sempre depois de o efeito ter rodado. */
  const aoEscolher = useRef(onEscolher)
  useEffect(() => {
    aoEscolher.current = onEscolher
  }, [onEscolher])

  useEffect(() => {
    if (!suportado) return
    const tela = canvas.current
    const alvo = moldura.current
    if (!tela || !alvo) return

    let vivo = true
    let instancia: Globo | null = null

    /* Espera a seção chegar perto da tela para baixar a cena. */
    const aproximou = new Promise<void>((resolve) => {
      const observador = new IntersectionObserver(
        (entradas) => {
          if (entradas.some((entrada) => entrada.isIntersecting)) {
            observador.disconnect()
            resolve()
          }
        },
        { rootMargin: '400px' },
      )
      observador.observe(alvo)
    })

    let ligarDesligar: IntersectionObserver | null = null

    void aproximou
      .then(() => import('@/lib/globo'))
      .then(({ criarGlobo }) => {
        if (!vivo) return

        /* As cores saem do tema, lidas da própria seção: mexer na paleta
           em `globals.css` muda o globo junto, sem tocar aqui. */
        const estilo = getComputedStyle(alvo)
        const cor = (nome: string, reserva: string) =>
          estilo.getPropertyValue(nome).trim() || reserva

        instancia = criarGlobo({
          canvas: tela,
          marcadores: cidades.map(({ id, lat, lng }) => ({ id, lat, lng })),
          cores: {
            oceano: cor('--globo-oceano', '#0e1411'),
            terra: cor('--globo-terra', '#4b544f'),
            brasil: cor('--globo-brasil', '#3ac975'),
            pino: cor('--globo-pino', '#ffffff'),
            pinoNucleo: cor('--globo-pino-nucleo', '#10963e'),
            pinoEscolhido: cor('--globo-pino-escolhido', '#ffc200'),
            rota: cor('--globo-rota', '#ffc200'),
            atmosfera: cor('--globo-atmosfera', '#10963e'),
          },
          semMovimento,
          aoPassar: setSobre,
          aoEscolher: (id) => aoEscolher.current(id),
          aoProjetar: (posicoes) => {
            const elemento = etiqueta.current
            const alvoAtual = seguindo.current
            if (!elemento) return

            const posicao = alvoAtual ? posicoes.get(alvoAtual) : undefined
            if (!posicao || !posicao.visivel) {
              elemento.style.opacity = '0'
              return
            }

            /* A posição que a cena devolve é a **ponta** do pino, no chão,
               e o desenho do pino sobe daí. A etiqueta fica acima dele —
               e vira para baixo quando não há espaço em cima, o que
               acontece com as cidades do norte quando o globo está
               aproximado e elas encostam na borda de cima da moldura. */
            const cabeNoTopo =
              posicao.y - ETIQUETA_ACIMA_DO_PINO - alturaDaEtiqueta.current > 0

            elemento.style.opacity = '1'
            elemento.style.transform = cabeNoTopo
              ? `translate3d(${posicao.x}px, ${posicao.y - ETIQUETA_ACIMA_DO_PINO}px, 0) translate(-50%, -100%)`
              : `translate3d(${posicao.x}px, ${posicao.y + ETIQUETA_ABAIXO_DA_PONTA}px, 0) translate(-50%, 0)`
          },
        })

        globo.current = instancia
        setPronto(true)

        ligarDesligar = new IntersectionObserver(
          (entradas) => {
            instancia?.ativo(entradas.some((entrada) => entrada.isIntersecting))
          },
          { rootMargin: '150px' },
        )
        ligarDesligar.observe(alvo)
      })

    return () => {
      vivo = false
      ligarDesligar?.disconnect()
      instancia?.destruir()
      globo.current = null
      setPronto(false)
    }
    /* `cidades` e `semMovimento` são a cena: mudar qualquer um dos dois
       pede uma cena nova. Os dois são estáveis na prática — a lista vem do
       servidor e a preferência de movimento não muda no meio da visita. */
  }, [suportado, cidades, semMovimento])

  /* A cidade escolhida manda no destaque e leva o globo até ela. */
  useEffect(() => {
    if (!pronto) return
    globo.current?.destacar(escolhida)
    if (!escolhida) return

    const cidade = cidades.find((item) => item.id === escolhida)
    if (cidade) globo.current?.irPara(cidade.lat, cidade.lng)
  }, [escolhida, cidades, pronto])

  useEffect(() => {
    if (pronto) globo.current?.filtrar(visiveis)
  }, [visiveis, pronto])

  /* A etiqueta acompanha quem está sob o ponteiro; sem ponteiro, a
     cidade escolhida. */
  useEffect(() => {
    seguindo.current = sobre ?? escolhida
  }, [sobre, escolhida])

  const nomeada = cidades.find((item) => item.id === (sobre ?? escolhida))

  /* Nome novo, etiqueta de outra altura — Aracaju cabe em uma linha, e a
     medida é lida aqui, uma vez, já com o texto novo no lugar. */
  useEffect(() => {
    alturaDaEtiqueta.current = etiqueta.current?.offsetHeight ?? 0
  }, [nomeada?.id])

  return (
    <div
      ref={moldura}
      className={cn('relative isolate aspect-5/4 w-full', className)}
      /* A PALETA DO GLOBO
         -----------------
         O Brasil é verde, e por isso o pino não podia ser: verde sobre
         verde era exatamente o problema — não dava para ver onde as
         cidades estavam.

         O pino sai **branco com o miolo no verde AIDEP**. É o contraste
         mais alto possível contra a esfera escura e contra a mancha do
         país, e continua dentro das três cores principais da marca
         (verde, preto e branco).

         O **âmbar** aparece em duas coisas só, e as duas são o mesmo
         assunto: o pino da cidade escolhida e a rota que liga as
         cidades. Uma cor a mais, usada uma vez só, é o que faz a escolha
         saltar no meio de vinte e nove pinos iguais. */
      style={
        {
          '--globo-oceano': '#0e1411',
          '--globo-terra': '#4b544f',
          '--globo-brasil': '#3ac975',
          '--globo-pino': '#ffffff',
          '--globo-pino-nucleo': '#10963e',
          '--globo-pino-escolhido': '#ffc200',
          '--globo-rota': '#ffc200',
          '--globo-atmosfera': '#10963e',
        } as CSSProperties
      }
    >
      {!suportado ? (
        <div className="flex size-full items-center justify-center">{semWebgl}</div>
      ) : (
        <>
          <canvas
            ref={canvas}
            role="img"
            aria-label={label}
            className={cn(
              'size-full cursor-grab touch-pan-y transition-opacity duration-700 ease-brand',
              pronto ? 'opacity-100' : 'opacity-0',
            )}
          />

          {/* Antes de a cena montar, o mapa plano segura o lugar — e é ele
              que fica no ar para quem tem script bloqueado. */}
          {pronto ? null : (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
              {semWebgl}
            </div>
          )}

          <div
            ref={etiqueta}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-10 whitespace-nowrap border border-(--border-strong) bg-(--bg)/92 px-3 py-2 opacity-0 backdrop-blur-sm transition-opacity duration-200 ease-brand"
          >
            <span className="block text-small font-semibold leading-tight tracking-[-0.01em]">
              {nomeada?.cidade}
            </span>
            {nomeada?.uf ? (
              <span className="block text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
                {nomeada.uf}
              </span>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}
