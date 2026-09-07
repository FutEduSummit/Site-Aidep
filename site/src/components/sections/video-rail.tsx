'use client'

import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { Container, Section, type Surface } from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import { VideoPlayer } from '@/components/ui/video-player'
import type { VideoAsset } from '@/content/types'
import { usePointerFine, useReducedMotionSafe } from '@/hooks/use-media'
import type { Locale } from '@/i18n/routing'
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

/**
 * FILEIRA DE VÍDEOS
 * =================
 * O acervo de vídeo da AIDEP é inteiro vertical, gravado no celular de
 * quem estava lá. A fileira segue esse formato em vez de brigar com ele:
 * cartões 9/16 que correm na horizontal, o filme institucional na frente,
 * maior, e os clipes dos polos em seguida.
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
 * A fileira sangra até a borda direita da tela de propósito: o corte é o
 * que diz que há mais coisa adiante. O primeiro cartão continua alinhado
 * à coluna de texto do site, porque a `<ul>` é o próprio `container-site`.
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

  if (videos.length === 0) return null

  function correr(direcao: -1 | 1) {
    const elemento = trilho.current
    if (!elemento) return
    /* Um cartão e meio por clique: o próximo entra inteiro e o seguinte
       fica aparecendo pela borda, que é o que mantém a leitura. */
    elemento.scrollBy({
      left: direcao * elemento.clientWidth * 0.6,
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
        <div
          ref={trilho}
          className="w-full overflow-x-auto overscroll-x-contain [scrollbar-width:thin]"
        >
          {/* Alinhados pela base: as legendas ficam todas na mesma linha,
              e é o cartão do filme que sobe acima dos outros. */}
          <ul className="container-site flex items-end gap-4">
            {videos.map((video, indice) => {
              const destaque = Boolean(video.featured)

              return (
                <li
                  key={video.src}
                  className={cn(
                    'shrink-0',
                    destaque
                      ? 'w-[min(76vw,21rem)]'
                      : 'w-[min(58vw,15.5rem)]',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setAberto(indice)}
                    onMouseEnter={() => previaLiberada && setEmPrevia(video.src)}
                    onMouseLeave={() => setEmPrevia(null)}
                    className="group/clipe relative block aspect-9/16 w-full cursor-pointer overflow-hidden bg-ink-900 text-left"
                  >
                    <Image
                      src={video.poster}
                      alt=""
                      fill
                      sizes={destaque ? '(max-width: 1024px) 76vw, 336px' : '(max-width: 1024px) 58vw, 248px'}
                      className={cn(
                        'object-cover transition-transform duration-700 ease-brand',
                        'fine:motion-safe:group-hover/clipe:scale-105',
                      )}
                    />

                    {emPrevia === video.src ? (
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
                      {destaque ? (
                        <span className="mb-1 inline-flex w-fit items-center bg-brand-500 px-2 py-1 text-micro font-semibold uppercase tracking-[0.14em] text-white">
                          {t('film')}
                        </span>
                      ) : null}
                      <span className="text-micro uppercase tracking-[0.14em] text-white/75">
                        {video.place}
                      </span>
                      <span
                        className={cn(
                          'font-semibold tracking-[-0.02em] text-balance',
                          destaque ? 'text-h4' : 'text-small leading-snug',
                        )}
                      >
                        {video.title[locale]}
                      </span>
                      <span className="sr-only">{video.description[locale]}</span>
                    </span>
                  </button>
                </li>
              )
            })}

            {/* Respiro no fim da fileira, para o último cartão não encostar
                na borda da tela. */}
            <li aria-hidden="true" className="w-gutter shrink-0" />
          </ul>
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
