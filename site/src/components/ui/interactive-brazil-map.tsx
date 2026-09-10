'use client'

import { Minus, Plus, RotateCcw } from 'lucide-react'
import { motion } from 'motion/react'
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as PointerEventoDoReact,
  type ReactNode,
  type Ref,
} from 'react'
import {
  CABECA_Y,
  PINO_ALTURA,
  PINO_PATH,
  PINO_RAIO,
  VB,
} from '@/components/ui/brazil-map'
import { mapaBrasil } from '@/content/mapa-brasil'
import { useReducedMotionSafe } from '@/hooks/use-media'
import type { CidadeNaAtuacao } from '@/lib/mapa'
import { DURATION, STAGGER, VIEWPORT, transition } from '@/lib/motion'
import { cn } from '@/lib/utils'

export type RotulosDoMapa = {
  /** Descrição do mapa inteiro para quem não o vê. */
  mapa: string
  aproximar: string
  afastar: string
  /** Voltar ao Brasil inteiro. */
  reenquadrar: string
}

/**
 * O que a seção pode mandar o mapa fazer sem passar por uma prop.
 *
 * Existe por causa do filtro por projeto. Escolher "Futedu Summit" com o
 * mapa parado em Sergipe deixava uma tela de estado vazio: a única cidade
 * do recorte é Curitiba, mil quilômetros fora do enquadramento. Quem sabe
 * que o recorte mudou é o clique na etiqueta do filtro, lá no painel —
 * então é de lá que o reenquadramento parte, e não de um efeito aqui
 * dentro espiando a prop para adivinhar que houve um clique.
 */
export type ControleDoMapa = {
  /** Enquadra estas cidades. `null` devolve o Brasil inteiro. */
  enquadrar: (cidades: { x: number; y: number }[] | null) => void
}

type InteractiveBrazilMapProps = {
  cidades: CidadeNaAtuacao[]
  /** Cidade escolhida — controlada pela seção, que também desenha a ficha. */
  escolhida: string | null
  onEscolher: (id: string | null) => void
  /** Só estas cidades ficam acesas. `null` acende todas. */
  visiveis: Set<string> | null
  rotulos: RotulosDoMapa
  ref?: Ref<ControleDoMapa>
  className?: string
}

/**
 * Quanto o mapa aproxima. O piso é o Brasil inteiro; o teto vem de
 * Sergipe, que sozinha responde por doze das vinte e nove cidades, num
 * retângulo de menos de 40 por 50 unidades do viewBox — com o alfinete
 * medindo 34 por 46, no Brasil inteiro elas são uma mancha só. Nove vezes
 * é o que afasta os doze o bastante para cada um ter o próprio clique.
 */
const ZOOM = { min: 1, max: 9, naCidade: 4.5 }

/** Quanto cada toque nos botões de mais e menos aproxima. */
const PASSO_DO_BOTAO = 1.8

/** O centro da moldura, em coordenadas do viewBox. */
const CENTRO = { x: VB.x + VB.largura / 2, y: VB.y + VB.altura / 2 }

/**
 * A entrada dos alfinetes, de norte a sul, uma única vez. É a mesma
 * cascata do mapa das páginas de projeto: as duas leituras do mesmo país
 * têm de se comportar igual.
 */
const entradaDoPonto = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: transition(DURATION.fast, i * STAGGER.tight),
  }),
}

type Vista = { k: number; x: number; y: number }

const BRASIL_INTEIRO: Vista = { k: ZOOM.min, x: 0, y: 0 }

function entre(valor: number, minimo: number, maximo: number): number {
  return Math.min(maximo, Math.max(minimo, valor))
}

/**
 * A vista, presa dentro do país.
 *
 * A janela visível, em coordenadas do mapa, é `(viewBox − t) / k`. Mantê-la
 * dentro do viewBox é o que impede o arrasto de empurrar o Brasil para
 * fora da moldura e deixar a tela vazia. Em `k = 1` os dois limites
 * colapsam em zero: no Brasil inteiro não há para onde arrastar.
 */
function presa({ k, x, y }: Vista): Vista {
  const zoom = entre(k, ZOOM.min, ZOOM.max)
  return {
    k: zoom,
    x: entre(x, (VB.x + VB.largura) * (1 - zoom), VB.x * (1 - zoom)),
    y: entre(y, (VB.y + VB.altura) * (1 - zoom), VB.y * (1 - zoom)),
  }
}

/** A vista que põe um ponto do mapa no meio da moldura, no zoom pedido. */
function centralizando(ponto: { x: number; y: number }, k: number): Vista {
  return presa({ k, x: CENTRO.x - ponto.x * k, y: CENTRO.y - ponto.y * k })
}

/**
 * A vista que mostra **estas** cidades, e o mais de perto que der.
 *
 * Serve ao filtro por projeto: o mapa vai atrás do recorte, que é o que a
 * lista ao lado já fez, encurtando-se. Quem a chama é `ControleDoMapa`.
 *
 * A margem é o alfinete mais um respiro: a gota sobe 46 unidades acima da
 * cidade, e sem contá-la a cidade mais ao norte do recorte entraria com a
 * cabeça cortada. E o teto é o mesmo de escolher uma cidade — um recorte
 * de uma cidade só não tem por que aproximar mais do que um clique nela.
 */
function enquadrando(cidades: { x: number; y: number }[]): Vista {
  if (cidades.length === 0) return BRASIL_INTEIRO

  const xs = cidades.map((cidade) => cidade.x)
  const ys = cidades.map((cidade) => cidade.y)
  const margem = PINO_ALTURA + 40

  const largura = Math.max(...xs) - Math.min(...xs) + margem * 2
  const altura = Math.max(...ys) - Math.min(...ys) + margem * 2

  return centralizando(
    {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...ys) + Math.max(...ys)) / 2,
    },
    entre(
      Math.min(VB.largura / largura, VB.altura / altura),
      ZOOM.min,
      ZOOM.naCidade,
    ),
  )
}

/**
 * O MAPA DO BRASIL QUE SE DEIXA EXPLORAR
 * ======================================
 * O mesmo desenho dos 27 estados das páginas de projeto
 * (`content/mapa-brasil.ts`, do dado público do IBGE), agora com zoom,
 * arrasto e uma cidade escolhida — o que a Página inicial precisa para
 * mostrar a atuação inteira da associação em um mapa só.
 *
 * POR QUE NÃO É O `BrazilMap`
 * ---------------------------
 * O mapa das páginas de projeto desenha uma dúzia de cidades de um projeto
 * e não precisa de mais nada: é um retrato. Este é um instrumento — filtra
 * por projeto, conversa com a lista ao lado, guarda uma escolha e
 * aproxima. Enfiar as duas naturezas no mesmo componente daria um arquivo
 * com duas personalidades. O que as duas de fato compartilham — o contorno
 * do país, a gota do alfinete e a moldura — está exportado de
 * `brazil-map.tsx` e é importado aqui: uma fonte de verdade só.
 *
 * A CONTA DO ZOOM
 * ---------------
 * Um ponto do mapa vai parar em `P × k + t` dentro do viewBox: `k` é a
 * aproximação e `t` o deslocamento. Tudo — a roda, o arrasto, o voo até
 * uma cidade e a posição da etiqueta — é essa conta ou a inversa dela.
 *
 * Os alfinetes ficam **fora** dessa escala: cada um recebe `scale(1/k)` de
 * volta, senão aproximar nove vezes daria uma gota de nove vezes o
 * tamanho, tapando o estado que ela aponta. O que cresce é a distância
 * entre eles — que é exatamente o problema que o zoom existe para
 * resolver.
 *
 * A ROLAGEM DA PÁGINA NÃO É NOSSA
 * -------------------------------
 * A seção mede uma tela cheia: um mapa que engolisse toda rolagem passada
 * sobre ele prenderia quem só queria descer a página. Por isso a roda só é
 * tomada quando tem o que fazer — no Brasil inteiro, rolar para baixo
 * segue direto para a próxima seção; no zoom máximo, rolar para cima
 * segue direto para a anterior.
 *
 * A ETIQUETA
 * ----------
 * O nome da cidade é HTML por cima do desenho, e não `<text>` dentro dele:
 * dentro do SVG o texto encolheria junto com o mapa em telas estreitas.
 * A posição sai da mesma conta do zoom, e não de medir o alfinete no DOM —
 * assim ela continua certa no meio do voo até uma cidade, quadro a quadro.
 */
export function InteractiveBrazilMap({
  cidades,
  escolhida,
  onEscolher,
  visiveis,
  rotulos,
  ref,
  className,
}: InteractiveBrazilMapProps) {
  const moldura = useRef<HTMLDivElement>(null)
  const semMovimento = useReducedMotionSafe()

  const [caixa, setCaixa] = useState({ largura: 0, altura: 0 })
  const [vista, setVista] = useState<Vista>(BRASIL_INTEIRO)
  const [sobre, setSobre] = useState<string | null>(null)
  const [arrastando, setArrastando] = useState(false)

  /* A vista de agora, legível de dentro dos ouvintes de evento sem
     precisar recriá-los a cada quadro do arrasto. Toda escrita passa por
     `mudarVista`, e é por isso que a cópia nunca atrasa: o espelho é
     atualizado no mesmo gesto que agenda a renderização, e não numa
     leitura de `vista` no meio do render — que o React proíbe, com razão,
     porque é assim que uma referência começa a mentir. */
  const atual = useRef(vista)

  const mudarVista = useCallback((proxima: Vista) => {
    atual.current = proxima
    setVista(proxima)
  }, [])

  /* O voo até uma cidade. Guardado para poder ser cortado no meio: quem
     agarra o mapa manda mais do que o clique de um segundo atrás. */
  const voo = useRef<number | null>(null)

  const pararVoo = useCallback(() => {
    if (voo.current !== null) cancelAnimationFrame(voo.current)
    voo.current = null
  }, [])

  useEffect(() => pararVoo, [pararVoo])

  /**
   * Leva a vista até `destino`. Sem movimento pedido, o salto é seco; nos
   * outros casos são os 700 ms da curva do projeto, com a mesma saída
   * rápida e chegada longa de `EASE`, em `lib/motion.ts`.
   */
  const irPara = useCallback(
    (destino: Vista) => {
      pararVoo()
      const de = atual.current

      if (semMovimento) {
        mudarVista(destino)
        return
      }

      const inicio = performance.now()
      const duracao = DURATION.base * 1000

      const passo = (agora: number) => {
        const t = Math.min(1, (agora - inicio) / duracao)
        const e = 1 - (1 - t) ** 3

        mudarVista({
          k: de.k + (destino.k - de.k) * e,
          x: de.x + (destino.x - de.x) * e,
          y: de.y + (destino.y - de.y) * e,
        })

        voo.current = t < 1 ? requestAnimationFrame(passo) : null
      }

      voo.current = requestAnimationFrame(passo)
    },
    [mudarVista, pararVoo, semMovimento],
  )

  /* A moldura medida: é dela que saem a escala do desenho e a conversão
     entre pixels da tela e unidades do viewBox. */
  useEffect(() => {
    const alvo = moldura.current
    if (!alvo) return

    const medir = () =>
      setCaixa({ largura: alvo.clientWidth, altura: alvo.clientHeight })

    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(alvo)
    return () => observador.disconnect()
  }, [])

  /**
   * Como o navegador desenha este SVG: escala uniforme e sobra dividida em
   * dois, que é o que `preserveAspectRatio="xMidYMid meet"` quer dizer.
   * Refazer a conta aqui é o que permite converter pixels em coordenadas
   * do mapa nos dois sentidos.
   */
  const desenho = useMemo(() => {
    const escala = Math.min(caixa.largura / VB.largura, caixa.altura / VB.altura)
    return {
      escala,
      folgaX: (caixa.largura - VB.largura * escala) / 2,
      folgaY: (caixa.altura - VB.altura * escala) / 2,
    }
  }, [caixa])

  /* ---------------------------------------------------------------- */
  /* Arrasto                                                          */
  /* ---------------------------------------------------------------- */

  /* De onde o arrasto partiu, e se ele chegou a ser um arrasto: um clique
     que só treme dois pixels continua sendo um clique. */
  const gesto = useRef<{
    ponteiro: number
    x: number
    y: number
    de: Vista
    arrastou: boolean
  } | null>(null)

  function aoDescer(evento: PointerEventoDoReact<HTMLDivElement>) {
    if (evento.button !== 0) return
    pararVoo()
    gesto.current = {
      ponteiro: evento.pointerId,
      x: evento.clientX,
      y: evento.clientY,
      de: atual.current,
      arrastou: false,
    }
    /* Sem capturar o ponteiro aqui. Capturar já na descida redireciona
       para esta moldura **todos** os eventos seguintes do gesto, o clique
       inclusive — e o clique deixa de chegar ao alfinete que estava
       debaixo do dedo. A captura entra quando o gesto vira arrasto, que é
       quando ela serve para alguma coisa: seguir o ponteiro para fora da
       moldura sem largar o mapa. */
  }

  function aoMover(evento: PointerEventoDoReact<HTMLDivElement>) {
    const inicio = gesto.current
    if (!inicio || inicio.ponteiro !== evento.pointerId) return

    const dx = evento.clientX - inicio.x
    const dy = evento.clientY - inicio.y

    if (!inicio.arrastou) {
      /* Um clique que treme dois pixels continua sendo um clique. */
      if (Math.hypot(dx, dy) < 4) return
      inicio.arrastou = true
      setArrastando(true)
      setSobre(null)
      evento.currentTarget.setPointerCapture(evento.pointerId)
    }

    /* Pixels da tela viram unidades do viewBox pela escala do desenho — o
       mapa acompanha o dedo exatamente, em qualquer largura. */
    mudarVista(
      presa({
        k: inicio.de.k,
        x: inicio.de.x + dx / desenho.escala,
        y: inicio.de.y + dy / desenho.escala,
      }),
    )
  }

  /**
   * A escolha da cidade acontece aqui, e só aqui.
   *
   * Podia estar num `onClick` em cada alfinete, mas aí seriam dois donos
   * da mesma decisão: o alfinete escolhendo e a moldura desescolhendo ao
   * soltar no vazio, na ordem em que o navegador quisesse disparar os dois.
   * Com um dono só, a regra cabe em três linhas — caiu num alfinete,
   * escolhe; caiu no vazio, fecha; era arrasto, não é clique nenhum.
   */
  function aoSubir(evento: PointerEventoDoReact<HTMLDivElement>) {
    const inicio = gesto.current
    if (!inicio || inicio.ponteiro !== evento.pointerId) return
    gesto.current = null
    setArrastando(false)
    if (inicio.arrastou) return

    const alvo = evento.target as Element
    const id = alvo.closest?.('[data-cidade]')?.getAttribute('data-cidade') ?? null

    onEscolher(id && id === escolhida ? null : id)
  }

  /**
   * O gesto cancelado não é clique.
   *
   * No celular é o caso comum: `touch-pan-y` entrega a rolagem vertical à
   * página, e o navegador cancela o nosso gesto no meio. Tratar isso como
   * clique faria a ficha abrir sozinha toda vez que alguém descesse a
   * página com o dedo pousado num alfinete.
   */
  function aoCancelar() {
    gesto.current = null
    setArrastando(false)
  }

  /* ---------------------------------------------------------------- */
  /* A cidade escolhida manda no enquadramento                        */
  /* ---------------------------------------------------------------- */

  const cidadePorId = useMemo(
    () => new Map(cidades.map((cidade) => [cidade.id, cidade])),
    [cidades],
  )

  useEffect(() => {
    if (!escolhida || desenho.escala === 0) return
    const cidade = cidadePorId.get(escolhida)
    if (!cidade) return

    /* Quem já estava mais perto que isso não é afastado: escolher uma
       cidade aproxima, nunca recua. */
    irPara(centralizando(cidade, Math.max(atual.current.k, ZOOM.naCidade)))
  }, [escolhida, cidadePorId, desenho.escala, irPara])

  useImperativeHandle(
    ref,
    () => ({
      enquadrar: (alvos) =>
        irPara(alvos && alvos.length > 0 ? enquadrando(alvos) : BRASIL_INTEIRO),
    }),
    [irPara],
  )

  /* ---------------------------------------------------------------- */
  /* Desenho                                                          */
  /* ---------------------------------------------------------------- */

  const aceso = useCallback(
    (id: string) => !visiveis || visiveis.has(id),
    [visiveis],
  )

  /* Os estados acesos são os das cidades **do recorte no ar**: filtrar por
     projeto apaga alfinetes e apaga os estados junto, senão o mapa
     continuaria contando uma atuação que a lista ao lado já não lista. */
  const ufsAcesas = useMemo(() => {
    const ufs = new Set<string>()
    for (const cidade of cidades) {
      if (cidade.uf && aceso(cidade.id)) ufs.add(cidade.uf)
    }
    return ufs
  }, [cidades, aceso])

  /* Em SVG não há z-index: quem manda é a ordem do documento. Doze cidades
     de Sergipe ficam a poucos pixels umas das outras, então o alfinete em
     foco vai para o fim da lista e passa a ser desenhado por cima dos
     vizinhos — senão a etiqueta apontaria para um ponto meio encoberto. */
  const emFoco = sobre ?? escolhida
  const desenhaveis = useMemo(() => {
    const alvo = cidades.find((cidade) => cidade.id === emFoco)
    if (!alvo) return cidades
    return [...cidades.filter((cidade) => cidade.id !== emFoco), alvo]
  }, [cidades, emFoco])

  /* O índice na lista original — a ordem norte-sul — é o atraso da entrada
     de cada alfinete, e não muda quando a de desenho é reordenada. */
  const ordem = useMemo(
    () => new Map(cidades.map((cidade, i) => [cidade.id, i])),
    [cidades],
  )

  const naEtiqueta = emFoco ? (cidadePorId.get(emFoco) ?? null) : null
  const etiqueta =
    naEtiqueta && desenho.escala > 0
      ? {
          left:
            desenho.folgaX +
            (naEtiqueta.x * vista.k + vista.x - VB.x) * desenho.escala,
          top:
            desenho.folgaY +
            ((naEtiqueta.y - PINO_ALTURA) * vista.k + vista.y - VB.y) *
              desenho.escala,
        }
      : null

  const noBrasilInteiro = vista.k <= ZOOM.min + 0.001

  /* Os botões aproximam pelo meio da moldura: é o único ponto que não
     depende de onde o ponteiro está. */
  function aproximar(fator: number) {
    const de = atual.current
    const meio = { x: (CENTRO.x - de.x) / de.k, y: (CENTRO.y - de.y) / de.k }
    irPara(centralizando(meio, entre(de.k * fator, ZOOM.min, ZOOM.max)))
  }

  return (
    <div
      className={cn('relative', className)}
      /* O ÂMBAR
         ------
         Ele aparece numa coisa só: o alfinete da cidade escolhida. Uma cor
         a mais, usada uma vez só, é o que faz a escolha saltar no meio de
         vinte e nove alfinetes iguais — e é o que o globo fazia antes
         daqui, com este mesmo tom.

         Tudo o mais no mapa é o verde da marca. Se o âmbar aparecesse
         em mais alguma coisa, deixaria de significar "é esta".

         Não é o `--color-continent-asia` do manual, que por acaso tem o
         mesmo valor: aquele é de uso restrito à comunicação sobre a Ásia.
         Esta cor é do mapa, e mora no mapa. */
      style={{ '--mapa-escolhido': '#ffc200' } as CSSProperties}
    >
      <div
        ref={moldura}
        onPointerDown={aoDescer}
        onPointerMove={aoMover}
        onPointerUp={aoSubir}
        onPointerCancel={aoCancelar}
        onPointerLeave={() => setSobre(null)}
        /* `touch-pan-y`: no celular a rolagem vertical continua sendo da
           página — arrastar o mapa para o lado é nosso, descer a página é
           dela. É o mesmo acordo que o globo tinha. */
        className={cn(
          'size-full touch-pan-y select-none',
          arrastando ? 'cursor-grabbing' : 'cursor-grab',
        )}
      >
        <motion.svg
          viewBox={`${VB.x} ${VB.y} ${VB.largura} ${VB.altura}`}
          role="img"
          aria-label={rotulos.mapa}
          className="block size-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2, margin: VIEWPORT.margin }}
        >
          <g transform={`translate(${vista.x} ${vista.y}) scale(${vista.k})`}>
            <g strokeLinejoin="round">
              {mapaBrasil.estados.map((estado) => (
                <path
                  key={estado.uf}
                  d={estado.d}
                  /* Estado com projeto no verde da marca; os outros, no
                     cinza do grafismo — o país inteiro aparece, e o recorte
                     da atuação se lê de longe. */
                  className={cn(
                    'transition-colors duration-300 ease-brand',
                    ufsAcesas.has(estado.uf)
                      ? 'fill-(--accent)/14 stroke-(--accent)/45'
                      : 'fill-(--grafismo) stroke-(--border)',
                  )}
                  strokeWidth={1.6}
                  /* Sem isto a borda engordaria junto com o zoom: nove
                     vezes mais perto, nove vezes mais gorda. */
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>

            {desenhaveis.map((cidade) => {
              const escolhido = cidade.id === escolhida

              return (
                /* Quatro camadas, cada uma com uma tarefa: levar o alfinete
                   até a cidade e desfazer o zoom; apagá-lo quando o filtro
                   o exclui; a entrada em cascata; e o realce de quem está
                   sob o ponteiro. Separadas porque as escalas têm de girar
                   todas em torno da ponta — e é `origin-bottom` com
                   `transform-box: fill-box` que põe o eixo exatamente lá. */
                <g
                  key={cidade.id}
                  transform={`translate(${cidade.x} ${cidade.y}) scale(${1 / vista.k})`}
                >
                  <g
                    className={cn(
                      'transition-opacity duration-300 ease-brand',
                      aceso(cidade.id)
                        ? 'opacity-100'
                        : 'pointer-events-none opacity-0',
                    )}
                  >
                    <motion.g
                      variants={entradaDoPonto}
                      custom={ordem.get(cidade.id) ?? 0}
                      className="origin-bottom transform-fill"
                    >
                      <g
                        /* Quem responde ao clique é a moldura, em
                           `aoSubir`; o alfinete só diz quem é. */
                        data-cidade={cidade.id}
                        onPointerEnter={() => setSobre(cidade.id)}
                        onPointerLeave={() =>
                          setSobre((atual) =>
                            atual === cidade.id ? null : atual,
                          )
                        }
                        className={cn(
                          'origin-bottom cursor-pointer transform-fill transition-transform duration-300 ease-brand',
                          cidade.id === emFoco && 'scale-115',
                        )}
                      >
                        {/* A sombra no chão é o que faz o alfinete parecer
                            espetado na cidade, e não boiando acima dela. */}
                        <ellipse
                          cx={0}
                          cy={0}
                          rx={7}
                          ry={2.5}
                          className="fill-black/25"
                        />

                        {/* O anel do pulso, no chão, na cidade escolhida.
                            Depois de o mapa voar até ela, é o que diz qual
                            das gotas é a que está aberta na ficha. Ele não
                            aparece em movimento reduzido: lá o âmbar
                            sozinho já destaca, e um anel piscando é
                            exatamente o que o pedido quer evitar. */}
                        {escolhido && !semMovimento ? (
                          <motion.circle
                            cx={0}
                            cy={0}
                            r={9}
                            fill="none"
                            strokeWidth={2}
                            vectorEffect="non-scaling-stroke"
                            className="origin-center transform-fill stroke-(--mapa-escolhido)"
                            initial={{ scale: 0.5, opacity: 0.8 }}
                            animate={{ scale: 2.6, opacity: 0 }}
                            transition={{
                              duration: 1.9,
                              repeat: Infinity,
                              ease: 'easeOut',
                            }}
                          />
                        ) : null}

                        {/* A escolhida troca de cor e de lado. Entre vinte e
                            nove gotas brancas de miolo verde, o que salta é
                            a de âmbar com o miolo do fundo da seção. */}
                        <path
                          d={PINO_PATH}
                          strokeWidth={3}
                          className={cn(
                            'stroke-(--bg) transition-colors duration-300 ease-brand',
                            escolhido ? 'fill-(--mapa-escolhido)' : 'fill-(--fg)',
                          )}
                        />
                        <circle
                          cx={0}
                          cy={CABECA_Y}
                          r={6.5}
                          className={cn(
                            'transition-colors duration-300 ease-brand',
                            escolhido ? 'fill-(--bg)' : 'fill-(--accent)',
                          )}
                        />

                        {/* Alvo de toque: no celular ninguém acerta uma gota
                            de dezessete unidades, e o dedo precisa de um
                            retângulo. */}
                        <rect
                          x={-PINO_RAIO - 6}
                          y={-PINO_ALTURA - 6}
                          width={(PINO_RAIO + 6) * 2}
                          height={PINO_ALTURA + 12}
                          className="fill-transparent"
                        />
                      </g>
                    </motion.g>
                  </g>
                </g>
              )
            })}
          </g>
        </motion.svg>
      </div>

      {/* ---- A etiqueta --------------------------------------------- */}
      {etiqueta && naEtiqueta && !arrastando ? (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transition(DURATION.fast)}
          style={{ left: etiqueta.left, top: etiqueta.top - 8 }}
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap border border-(--border-strong) bg-(--bg)/92 px-3 py-2 backdrop-blur-sm"
        >
          <span className="block text-small font-semibold leading-tight tracking-[-0.01em]">
            {naEtiqueta.cidade}
          </span>
          {naEtiqueta.uf ? (
            <span className="block text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
              {naEtiqueta.uf}
            </span>
          ) : null}
        </motion.div>
      ) : null}

      {/* ---- Os controles -------------------------------------------
          No canto de cima à direita porque o de baixo é da ficha da
          cidade. São eles que dão zoom a quem navega por teclado: roda e
          arrasto não existem sem ponteiro, e os alfinetes vivem dentro de
          um `role="img"`, fora do alcance do Tab — quem usa teclado chega
          às cidades pela lista ao lado, que é a leitura completa. */}
      <div className="absolute right-0 top-0 z-10 flex flex-col gap-px">
        <BotaoDoMapa
          rotulo={rotulos.aproximar}
          onClick={() => aproximar(PASSO_DO_BOTAO)}
          desligado={vista.k >= ZOOM.max - 0.001}
        >
          <Plus aria-hidden="true" className="size-4" />
        </BotaoDoMapa>
        <BotaoDoMapa
          rotulo={rotulos.afastar}
          onClick={() => aproximar(1 / PASSO_DO_BOTAO)}
          desligado={noBrasilInteiro}
        >
          <Minus aria-hidden="true" className="size-4" />
        </BotaoDoMapa>
        <BotaoDoMapa
          rotulo={rotulos.reenquadrar}
          onClick={() => {
            onEscolher(null)
            irPara(BRASIL_INTEIRO)
          }}
          desligado={noBrasilInteiro && !escolhida}
        >
          <RotateCcw aria-hidden="true" className="size-4" />
        </BotaoDoMapa>
      </div>
    </div>
  )
}

function BotaoDoMapa({
  rotulo,
  onClick,
  desligado,
  children,
}: {
  rotulo: string
  onClick: () => void
  desligado: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desligado}
      className="flex size-10 items-center justify-center border border-(--border) bg-(--bg)/80 text-(--fg-muted) backdrop-blur-sm transition-colors duration-200 ease-brand hover:border-(--fg) hover:text-(--fg) disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
      <span className="sr-only">{rotulo}</span>
    </button>
  )
}
