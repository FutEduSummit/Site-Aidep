'use client'

import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Reveal } from '@/components/motion/reveal'
import { SpotlightCard } from '@/components/motion/spotlight-card'
import { MediaFrame } from '@/components/ui/media-frame'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'
import { getMedia } from '@/content/media'
import { useReducedMotionSafe } from '@/hooks/use-media'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

type Group = { title: string; text: string }

/**
 * Uma fotografia por público, na ordem em que os públicos aparecem em
 * `messages/*.json`. A primeira chave é a da série toda (`home.audience`),
 * as outras foram acrescentadas com ela em `content/media.ts`.
 */
const AUDIENCE_MEDIA = [
  'home.audience',
  'home.audience.teenagers',
  'home.audience.youth',
  'home.audience.adults',
  'home.audience.communities',
] as const

/**
 * Recuo que alinha o começo do trilho à coluna do site sem fechá-lo à
 * direita: os cartões precisam sangrar até a borda da tela, então o
 * alinhamento não pode vir de um `container-site` em volta.
 */
const CONTAINER_INSET =
  'max(var(--spacing-gutter), calc((100% - var(--container-site)) / 2 + var(--spacing-gutter)))'

/**
 * PÚBLICO ATENDIDO
 *
 * Cada faixa de público é um cartão com a própria fotografia e o que a
 * AIDEP oferece a ela — é isso que diferencia um público do outro na
 * prática, e não o número na etiqueta (por isso não há numeração).
 *
 * No desktop os cartões correm em trilho de largura cheia: a seção prende
 * na tela por uma tela inteira (100svh), o scroll vertical empurra o
 * trilho para o lado e, terminado o percurso, devolve a página.
 *
 * Com movimento reduzido, e em telas pequenas, nada prende: os mesmos
 * cartões viram trilho que se arrasta com o dedo (grade, no desktop).
 */
export function AudienceSection({ locale }: { locale: Locale }) {
  const t = useTranslations('about.audience')
  const groups = t.raw('groups') as Group[]
  const reduced = useReducedMotionSafe()

  return (
    <Section
      id="publico-atendido"
      surface="muted"
      ariaLabelledby="home-audience-title"
    >
      <Container>
        <SectionHeader
          id="home-audience-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />
      </Container>

      {reduced ? null : (
        <PinnedRail groups={groups} locale={locale} className="hidden lg:block" />
      )}

      <Reveal
        className={cn(
          'mt-stack w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:thin] lg:snap-none lg:overflow-visible',
          !reduced && 'lg:hidden',
        )}
        distance={24}
      >
        {/* Mesma largura para todos, então mesma altura: fotografias,
            títulos e parágrafos ficam alinhados sem ajuste nenhum. */}
        <ul className="container-site flex items-stretch gap-4 lg:grid lg:grid-cols-3 lg:gap-6">
          {groups.map((group, index) => (
            <AudienceCard
              key={group.title}
              group={group}
              locale={locale}
              mediaKey={AUDIENCE_MEDIA[index]}
              sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 30vw"
              className="w-[min(80vw,22rem)] shrink-0 snap-start lg:w-auto"
            />
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}

function PinnedRail({
  groups,
  locale,
  className,
}: {
  groups: Group[]
  locale: Locale
  className?: string
}) {
  const wrapper = useRef<HTMLDivElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLUListElement>(null)
  /* Quanto o trilho tem de andar para a esquerda — e, portanto, quanto de
     scroll a seção precisa reservar para si. Medido, nunca estimado: o
     texto muda de tamanho em cada idioma. */
  const [distance, setDistance] = useState(0)

  useEffect(() => {
    const rail = track.current
    const frame = viewport.current
    if (!rail || !frame) return

    const measure = () => {
      const overflow = rail.offsetWidth - frame.clientWidth
      setDistance(Math.max(0, Math.round(overflow)))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(rail)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [groups.length])

  /* A seção mede uma tela mais o trajeto do trilho: o progresso vai de 0 a
     1 exatamente entre o instante em que ela prende e o em que solta. */
  const { scrollYProgress } = useScroll({
    target: wrapper,
    offset: ['start start', 'end end'],
  })

  const smooth = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 34,
    mass: 0.24,
  })

  const x = useTransform(smooth, [0, 1], [0, -distance])
  const progress = useTransform(smooth, [0, 1], [0.015, 1])

  return (
    <div
      ref={wrapper}
      className={cn('relative mt-stack', className)}
      style={{ height: `calc(100svh + ${distance}px)` }}
    >
      <div className="sticky top-0 flex h-svh flex-col gap-5 pb-10 pt-24">
        {/* O corte é a própria tela: o trilho começa alinhado à coluna do
            site (recuo no <ul>) e some pelas duas bordas. */}
        <div ref={viewport} className="min-h-0 flex-1 overflow-hidden">
          <motion.div data-motion="rail" className="h-full" style={{ x }}>
            <ul
              ref={track}
              className="flex h-full w-max items-stretch gap-6"
              style={{ paddingLeft: CONTAINER_INSET }}
            >
              {groups.map((group, index) => (
                <AudienceCard
                  key={group.title}
                  group={group}
                  locale={locale}
                  mediaKey={AUDIENCE_MEDIA[index]}
                  fill
                  sizes="(max-width: 1280px) 32vw, 28vw"
                  className="w-[clamp(18rem,28vw,30rem)] shrink-0"
                />
              ))}
              {/* Respiro final: o último cartão não encosta na borda. */}
              <li aria-hidden="true" className="w-gutter shrink-0" />
            </ul>
          </motion.div>
        </div>

        {/* Onde o leitor está dentro do trilho. */}
        <div
          aria-hidden="true"
          className="pr-gutter"
          style={{ paddingLeft: CONTAINER_INSET }}
        >
          <span className="block h-px w-full bg-(--border)">
            <motion.span
              className="block h-px w-full origin-left bg-(--accent)"
              style={{ scaleX: progress }}
            />
          </span>
        </div>
      </div>
    </div>
  )
}

function AudienceCard({
  group,
  locale,
  mediaKey,
  sizes,
  className,
  fill = false,
}: {
  group: Group
  locale: Locale
  mediaKey: string | undefined
  sizes: string
  className?: string
  /** `fill`: a fotografia toma a altura que o texto não usa (trilho preso). */
  fill?: boolean
}) {
  return (
    <SpotlightCard
      as="li"
      className={cn(
        'group/card flex h-full flex-col overflow-hidden border border-(--border) bg-(--bg-raised) transition-colors duration-300 ease-brand fine:hover:border-(--border-strong)',
        className,
      )}
    >
      <div className={cn('overflow-hidden', fill && 'min-h-0 flex-1')}>
        <MediaFrame
          media={mediaKey ? getMedia(mediaKey) : null}
          locale={locale}
          ratio="4 / 3"
          tone="light"
          sizes={sizes}
          className={cn(
            'transition-transform duration-700 ease-brand fine:motion-safe:group-hover/card:scale-[1.04]',
            fill && 'h-full',
          )}
        />
      </div>

      <div className="flex flex-col gap-3 p-7 xl:p-8">
        {/* Duas linhas reservadas para o título: os títulos curtos e o
            longo ("Comunidades em situação de vulnerabilidade") ocupam a
            mesma altura, e a base das fotografias fica alinhada de um
            cartão para o outro. */}
        <h3 className="min-h-[2.7em] text-h4 font-semibold tracking-[-0.02em]">
          {group.title}
        </h3>
        <p className="text-small leading-relaxed text-(--fg-muted)">
          {group.text}
        </p>
      </div>
    </SpotlightCard>
  )
}
