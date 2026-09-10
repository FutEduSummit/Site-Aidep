'use client'

import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { Container, Section, type Surface } from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import { VideoPlayer } from '@/components/ui/video-player'
import type { VideoAsset } from '@/content/types'
import { usePointerFine, useReducedMotionSafe } from '@/hooks/use-media'
import type { Locale } from '@/i18n/routing'
import { QUALIDADE_DA_IMAGEM } from '@/lib/image-quality'
import { cn } from '@/lib/utils'

type VideoRailProps = {
  id: string
  videos: VideoAsset[]
  locale: Locale
  surface?: Surface
  eyebrow: string
  title: string
  description?: string
}

/** `1:36`, `0:07` — a duração como aparece em qualquer player. */
function relogio(segundos: number) {
  const minutos = Math.floor(segundos / 60)
  const resto = Math.round(segundos % 60)
  return `${minutos}:${String(resto).padStart(2, '0')}`
}

/** Velocidade da fileira quando ela corre sozinha, em pixels por segundo. */
const VELOCIDADE = 26

/** Quantos pixels o mouse precisa andar para o gesto virar arraste, e não clique. */
const LIMIAR_DE_ARRASTE = 6

/**
 * Traz uma posição qualquer de volta para dentro da primeira metade da
 * fileira — a lista é publicada duas vezes, então metade da largura é
 * exatamente um ciclo. Passar de uma ponta reaparece na outra, e o quadro
 * seguinte é idêntico ao anterior: é o que faz a fileira não ter começo
 * nem fim, tanto no passeio automático quanto no arraste e nas setas.
 */
function enrolar(elemento: HTMLElement, alvo: number) {
  const metade = elemento.scrollWidth / 2
  if (metade <= 0) return alvo
  return ((alvo % metade) + metade) % metade
}

/**
 * A FILEIRA QUE ANDA SOZINHA
 * ==========================
 * A fileira corre para a esquerda por conta própria e para quando alguém
 * se aproxima dela. É a mesma ideia da faixa de parceiros, com uma
 * diferença que decide a implementação: aqui os cartões são clicáveis.
 *
 * Por isso o movimento é feito **empurrando o `scrollLeft`**, e não com
 * uma animação de `transform` como na faixa de logos. Um `transform`
 * moveria os cartões por baixo do dedo — o alvo do clique ficaria num
 * lugar e o desenho em outro durante a transição —, e ainda tiraria da
 * fileira a rolagem nativa, que é como se navega nela no celular e no
 * trackpad. Mexendo no `scrollLeft`, o navegador continua mandando: a
 * rolagem com o dedo, a seta do teclado e os botões de avançar seguem
 * funcionando, e o passeio automático é só mais uma coisa que rola.
 *
 * A fileira para quando:
 *
 * - o ponteiro está sobre ela, ou o foco do teclado está dentro dela —
 *   ninguém consegue clicar num alvo em movimento;
 * - alguém está rolando à mão (o `pointerdown` e a própria rolagem
 *   adiam o retorno por um instante);
 * - a aba sai de vista, a seção sai da tela, ou o sistema pede menos
 *   movimento;
 * - o player de vídeo está aberto.
 *
 * A volta ao começo é instantânea e invisível: a lista é publicada duas
 * vezes (a segunda `aria-hidden`, para o leitor de tela não ouvir tudo em
 * dobro) e, ao passar da metade, o `scrollLeft` recua exatamente uma
 * metade. O quadro seguinte é idêntico ao anterior.
 *
 * O gancho devolve `segurar`, que adia o passeio por um instante. Quem
 * mexe na fileira por fora precisa disso: as setas e o arraste também
 * escrevem `scrollLeft`, e sem a pausa o quadro seguinte deste loop
 * apagaria o movimento — era por isso que as setas não saíam do lugar,
 * já que os botões vivem no cabeçalho e o ponteiro nunca chega ao trilho.
 */
function useFileiraAndando(
  trilho: React.RefObject<HTMLDivElement | null>,
  ativo: boolean,
) {
  /* `pausadoAte` guarda o instante em que o passeio pode voltar depois de
     um gesto — sem ele, soltar o dedo faria a fileira arrancar na hora. */
  const pausado = useRef(false)
  const pausadoAte = useRef(0)

  const segurar = useCallback((ms = 1200) => {
    pausadoAte.current = Math.max(pausadoAte.current, performance.now() + ms)
  }, [])

  useEffect(() => {
    const elemento = trilho.current
    if (!elemento || !ativo) return

    let quadro = 0
    let anterior = performance.now()

    const entrou = () => {
      pausado.current = true
    }
    const saiu = () => {
      pausado.current = false
    }
    const gesto = () => segurar()

    elemento.addEventListener('pointerenter', entrou)
    elemento.addEventListener('pointerleave', saiu)
    elemento.addEventListener('focusin', entrou)
    elemento.addEventListener('focusout', saiu)
    elemento.addEventListener('pointerdown', gesto)
    elemento.addEventListener('wheel', gesto, { passive: true })
    elemento.addEventListener('touchmove', gesto, { passive: true })

    function andar(agora: number) {
      quadro = requestAnimationFrame(andar)

      const passo = Math.min((agora - anterior) / 1000, 0.05)
      anterior = agora

      if (!elemento) return
      if (pausado.current || agora < pausadoAte.current) return
      if (document.hidden) return

      if (elemento.scrollWidth <= 0) return

      elemento.scrollLeft = enrolar(elemento, elemento.scrollLeft + VELOCIDADE * passo)
    }

    quadro = requestAnimationFrame(andar)

    return () => {
      cancelAnimationFrame(quadro)
      elemento.removeEventListener('pointerenter', entrou)
      elemento.removeEventListener('pointerleave', saiu)
      elemento.removeEventListener('focusin', entrou)
      elemento.removeEventListener('focusout', saiu)
      elemento.removeEventListener('pointerdown', gesto)
      elemento.removeEventListener('wheel', gesto)
      elemento.removeEventListener('touchmove', gesto)
    }
  }, [trilho, ativo, segurar])

  return segurar
}

/**
 * ARRASTAR COM O MOUSE
 * ====================
 * No celular e no trackpad a fileira já se arrasta — é rolagem nativa. Com
 * mouse não havia gesto nenhum: só as setas. Este gancho empresta o gesto
 * do dedo para o mouse, escrevendo `scrollLeft` à mão enquanto o botão
 * está pressionado.
 *
 * O que ele precisa resolver é a convivência com o clique, porque cada
 * cartão é um botão que abre o vídeo:
 *
 * - até `LIMIAR_DE_ARRASTE` pixels o gesto ainda é um clique e nada
 *   acontece — cliques trêmulos continuam abrindo o vídeo;
 * - passado o limiar, o trilho captura o ponteiro e o clique seguinte é
 *   engolido na fase de captura, senão soltar o mouse sobre um cartão
 *   abriria um vídeo que ninguém pediu;
 * - `dragstart` é barrado, senão o navegador sairia arrastando a
 *   fotografia da capa como se fosse um arquivo;
 * - a seleção de texto é desligada só durante o arraste, para o rótulo do
 *   cartão não ficar azul de texto selecionado no meio do caminho.
 *
 * A posição passa por `enrolar` no mesmo movimento: arrastar para trás
 * no primeiro cartão não bate na parede, entra pelo fim da fileira.
 */
function useArrastarComMouse(
  trilho: React.RefObject<HTMLDivElement | null>,
  segurar: (ms?: number) => void,
) {
  useEffect(() => {
    const elemento = trilho.current
    if (!elemento) return

    let ponteiro: number | null = null
    let xInicial = 0
    let rolagemInicial = 0
    let andou = 0
    let arrastou = false

    function comecar(evento: PointerEvent) {
      if (!elemento) return
      if (evento.pointerType !== 'mouse' || evento.button !== 0) return
      ponteiro = evento.pointerId
      xInicial = evento.clientX
      rolagemInicial = elemento.scrollLeft
      andou = 0
      arrastou = false
    }

    function mover(evento: PointerEvent) {
      if (!elemento || ponteiro === null || evento.pointerId !== ponteiro) return

      const deslocamento = evento.clientX - xInicial
      andou = Math.max(andou, Math.abs(deslocamento))
      if (andou <= LIMIAR_DE_ARRASTE) return

      if (!arrastou) {
        arrastou = true
        elemento.setPointerCapture(ponteiro)
        elemento.style.userSelect = 'none'
      }

      evento.preventDefault()
      segurar()
      elemento.scrollLeft = enrolar(elemento, rolagemInicial - deslocamento)
    }

    function terminar(evento: PointerEvent) {
      if (!elemento || ponteiro === null || evento.pointerId !== ponteiro) return
      if (elemento.hasPointerCapture(ponteiro)) elemento.releasePointerCapture(ponteiro)
      ponteiro = null
      elemento.style.userSelect = ''
      /* `arrastou` fica de pé até o `click` logo abaixo: ele é o próximo
         evento a chegar, e é quem precisa saber que houve arraste. */
      if (arrastou) segurar()
    }

    function engolirClique(evento: MouseEvent) {
      if (!arrastou) return
      arrastou = false
      evento.preventDefault()
      evento.stopPropagation()
    }

    const barrarArraste = (evento: DragEvent) => evento.preventDefault()

    elemento.addEventListener('pointerdown', comecar)
    elemento.addEventListener('pointermove', mover)
    elemento.addEventListener('pointerup', terminar)
    elemento.addEventListener('pointercancel', terminar)
    elemento.addEventListener('click', engolirClique, true)
    elemento.addEventListener('dragstart', barrarArraste)

    return () => {
      elemento.style.userSelect = ''
      elemento.removeEventListener('pointerdown', comecar)
      elemento.removeEventListener('pointermove', mover)
      elemento.removeEventListener('pointerup', terminar)
      elemento.removeEventListener('pointercancel', terminar)
      elemento.removeEventListener('click', engolirClique, true)
      elemento.removeEventListener('dragstart', barrarArraste)
    }
  }, [trilho, segurar])
}

/**
 * FILEIRA DE VÍDEOS
 * =================
 * O acervo de vídeo da AIDEP é inteiro vertical, gravado no celular de
 * quem estava lá. A fileira segue esse formato em vez de brigar com ele:
 * cartões 9/16 de medida única que correm na horizontal, o filme
 * institucional na frente e os clipes dos polos em seguida.
 *
 * Todos os cartões têm a mesma largura de propósito. O filme se destaca
 * pela tarja "Filme" e pela posição — não pelo tamanho: cartão maior no
 * meio de uma fileira quebrava o ritmo da rolagem e desalinhava a grade.
 *
 * Como cada cartão se comporta:
 *
 * - **Parado, é uma fotografia.** A capa é `next/image` — servida no
 *   tamanho em que aparece, e a única coisa que a página baixa de saída.
 * - **No ponteiro, vira prévia.** Com mouse (e sem `prefers-reduced-motion`),
 *   passar por cima monta um `<video>` mudo e em laço, só naquele cartão:
 *   um vídeo por vez, e nenhum byte de vídeo antes do gesto.
 * - **No clique, abre com som.** `VideoPlayer` assume, com controles
 *   nativos e a legenda do que se vê.
 *
 * A fileira ocupa a largura da tela, de borda a borda, e anda sozinha
 * para a esquerda — ver `useFileiraAndando`, acima, que também explica
 * por que a lista aparece duas vezes. Não há barra de rolagem: a fileira
 * já se move, e a barra só somava um traço atravessando a seção.
 *
 * O cartão não se alinha à coluna de texto do site. Alinhar prendia a
 * fileira a uma margem que só existe para o texto, e o que se ganha
 * soltando é o tamanho: em 9/16, cada cartão passa de 340 px de largura
 * por quase 600 de altura — grande o bastante para se ver o que está
 * acontecendo na quadra sem abrir o vídeo.
 */
export function VideoRail({
  id,
  videos,
  locale,
  surface = 'dark',
  eyebrow,
  title,
  description,
}: VideoRailProps) {
  const t = useTranslations('videos')
  const trilho = useRef<HTMLDivElement>(null)
  const [aberto, setAberto] = useState<number | null>(null)
  const [emPrevia, setEmPrevia] = useState<string | null>(null)

  const ponteiroPreciso = usePointerFine()
  const menosMovimento = useReducedMotionSafe()
  const previaLiberada = ponteiroPreciso && !menosMovimento

  /* A fileira só anda sozinha quando há mais de um cartão, o sistema não
     pediu menos movimento e nenhum vídeo está aberto por cima dela. */
  const segurar = useFileiraAndando(
    trilho,
    videos.length > 1 && !menosMovimento && aberto === null,
  )

  /* Arrastar com o mouse vale sempre: é o gesto que faltava ao mouse,
     ande a fileira sozinha ou não. */
  useArrastarComMouse(trilho, segurar)

  if (videos.length === 0) return null

  function correr(direcao: -1 | 1) {
    const elemento = trilho.current
    if (!elemento) return

    /* Um cartão e meio por clique: o próximo entra inteiro e o seguinte
       fica aparecendo pela borda, que é o que mantém a leitura. */
    const passo = elemento.clientWidth * 0.6

    /* O passeio automático sai de cena pelo tempo da transição: os dois
       escrevem `scrollLeft`, e sem a pausa o loop desfaz o clique no
       quadro seguinte. */
    segurar(1400)

    /* No começo da fileira não há para onde voltar — `scrollLeft` para em
       zero. Então ela salta um ciclo para a frente antes da transição, o
       que é invisível (as duas metades são idênticas) e dá à seta da
       esquerda o mesmo curso da direita, sempre. */
    if (direcao === -1 && elemento.scrollLeft < passo) {
      elemento.scrollLeft = enrolar(elemento, elemento.scrollLeft) + elemento.scrollWidth / 2
    }

    elemento.scrollBy({
      left: direcao * passo,
      behavior: menosMovimento ? 'auto' : 'smooth',
    })
  }

  const controles = (
    <div className="hidden items-center gap-2 lg:flex">
      <button
        type="button"
        onClick={() => correr(-1)}
        className="inline-flex size-11 items-center justify-center border border-(--border-strong) transition-colors duration-200 ease-brand hover:border-(--fg) hover:bg-(--overlay)"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        <span className="sr-only">{t('previous')}</span>
      </button>
      <button
        type="button"
        onClick={() => correr(1)}
        className="inline-flex size-11 items-center justify-center border border-(--border-strong) transition-colors duration-200 ease-brand hover:border-(--fg) hover:bg-(--overlay)"
      >
        <ChevronRight aria-hidden="true" className="size-4" />
        <span className="sr-only">{t('next')}</span>
      </button>
    </div>
  )

  return (
    <Section surface={surface} id={id} ariaLabelledby={`${id}-title`}>
      <Container>
        <SectionHeader
          id={`${id}-title`}
          eyebrow={eyebrow}
          title={title}
          description={description}
          action={controles}
        />
      </Container>

      <Reveal className="mt-stack">
        {/* Sem barra de rolagem: a fileira anda sozinha e a barra sob os
            cartões só somava um traço cinza atravessando a seção. A
            rolagem continua toda lá — só o desenho dela saiu. */}
        <div
          ref={trilho}
          className="w-full cursor-grab overflow-x-auto overscroll-x-contain active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* A lista sai duas vezes: a fileira anda sozinha, e ao passar
              da metade o `scrollLeft` recua exatamente uma metade — o
              quadro seguinte é idêntico ao anterior e a volta não se vê.
              A segunda cópia é `aria-hidden` para o leitor de tela não
              anunciar o acervo em dobro.

              O recuo à esquerda da primeira alinha o cartão de abertura à
              coluna do site sem fechar a fileira à direita. */}
          <div className="flex w-max gap-3">
            <ul className="flex w-max items-stretch gap-3 pl-3 pr-3">
              {videos.map((video, indice) => (
                <Cartao
                  key={video.src}
                  video={video}
                  locale={locale}
                  legendaDoFilme={t('film')}
                  emPrevia={emPrevia === video.src}
                  onAbrir={() => setAberto(indice)}
                  onEntrar={() => previaLiberada && setEmPrevia(video.src)}
                  onSair={() => setEmPrevia(null)}
                />
              ))}
            </ul>

            <ul aria-hidden="true" className="flex w-max items-stretch gap-3 pr-3">
              {videos.map((video, indice) => (
                <Cartao
                  key={`${video.src}-copia`}
                  video={video}
                  locale={locale}
                  legendaDoFilme={t('film')}
                  emPrevia={false}
                  copia
                  onAbrir={() => setAberto(indice)}
                />
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      <VideoPlayer
        videos={videos}
        index={aberto}
        locale={locale}
        onClose={() => setAberto(null)}
        onNavigate={setAberto}
      />
    </Section>
  )
}

/**
 * A prévia muda que cobre a capa enquanto o ponteiro estiver no cartão.
 * Monta só quando é chamada — é isso que garante que nenhum vídeo seja
 * baixado antes do gesto — e entra por fade quando o primeiro quadro já
 * está na tela, para não piscar preto por cima da fotografia.
 */
function Previa({ src, rotulo }: { src: string; rotulo: string }) {
  const [tocando, setTocando] = useState(false)

  return (
    <video
      src={src}
      muted
      loop
      autoPlay
      playsInline
      preload="auto"
      aria-label={rotulo}
      onPlaying={() => setTocando(true)}
      className={cn(
        'pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-500 ease-brand',
        tocando ? 'opacity-100' : 'opacity-0',
      )}
    />
  )
}

/**
 * Um clipe na fileira.
 *
 * Existe como componente porque a lista é publicada duas vezes — a
 * original e a cópia que fecha o laço. `copia` marca a segunda: ela não
 * monta prévia (um vídeo por vez continua sendo um vídeo por vez) e sai
 * do caminho do teclado, já que o Tab passaria pelos mesmos clipes de
 * novo. Clicar nela abre o mesmo vídeo, porque é o mesmo vídeo.
 */
function Cartao({
  video,
  locale,
  legendaDoFilme,
  emPrevia,
  copia = false,
  onAbrir,
  onEntrar,
  onSair,
}: {
  video: VideoAsset
  locale: Locale
  legendaDoFilme: string
  emPrevia: boolean
  copia?: boolean
  onAbrir: () => void
  onEntrar?: () => void
  onSair?: () => void
}) {
  return (
    <li className="w-[min(72vw,21rem)] shrink-0">
      <button
        type="button"
        onClick={onAbrir}
        onMouseEnter={onEntrar}
        onMouseLeave={onSair}
        tabIndex={copia ? -1 : undefined}
        className="group/clipe relative block aspect-9/16 w-full cursor-pointer overflow-hidden bg-ink-900 text-left"
      >
        <Image
          src={video.poster}
          quality={QUALIDADE_DA_IMAGEM}
          alt=""
          fill
          draggable={false}
          sizes="(max-width: 1024px) 72vw, 336px"
          className={cn(
            'object-cover transition-transform duration-700 ease-brand',
            'fine:motion-safe:group-hover/clipe:scale-105',
          )}
        />

        {emPrevia ? (
          <Previa src={video.src} rotulo={video.description[locale]} />
        ) : null}

        {/* Véu de baixo para cima: é o que segura o texto sobre
            qualquer quadro, claro ou escuro. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-ink-950/90 via-ink-950/25 to-ink-950/10"
        />

        <span
          aria-hidden="true"
          className="absolute right-3 top-3 bg-ink-950/70 px-2 py-1 text-micro uppercase tracking-[0.14em] text-white"
        >
          {relogio(video.duration)}
        </span>

        <span
          aria-hidden="true"
          className="absolute left-3 top-3 flex size-10 items-center justify-center bg-white/95 text-ink-950 transition-transform duration-300 ease-brand fine:motion-safe:group-hover/clipe:scale-110"
        >
          <Play className="size-4 translate-x-px" fill="currentColor" strokeWidth={0} />
        </span>

        <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4 text-white">
          {video.featured ? (
            <span className="mb-1 inline-flex w-fit items-center bg-brand-500 px-2 py-1 text-micro font-semibold uppercase tracking-[0.14em] text-white">
              {legendaDoFilme}
            </span>
          ) : null}
          <span className="text-micro uppercase tracking-[0.14em] text-white/75">
            {video.place}
          </span>
          <span className="text-small font-semibold leading-snug tracking-[-0.02em] text-balance">
            {video.title[locale]}
          </span>
          <span className="sr-only">{video.description[locale]}</span>
        </span>
      </button>
    </li>
  )
}
