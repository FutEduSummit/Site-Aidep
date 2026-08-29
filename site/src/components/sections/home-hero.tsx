'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowDown } from 'lucide-react'
import { MagneticButton } from '@/components/motion/magnetic'
import { SplitTextReveal } from '@/components/motion/animated-text'
import { ButtonAnchor } from '@/components/ui/anchor-link'
import { ButtonLink } from '@/components/ui/button'
import { SectionBanner } from '@/components/ui/section-banner'
import { Container, Section } from '@/components/ui/section'
import { getMedia } from '@/content/media'
import { symbolMark } from '@/lib/brand'
import { DURATION, EASE } from '@/lib/motion'
import Image from 'next/image'

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.base, ease: EASE, delay },
})

/**
 * HERO DA PÁGINA INICIAL
 * ======================
 * Uma fotografia sangrada ocupa a seção inteira, com o título por cima —
 * a abertura é a imagem, não uma moldura ao lado do texto. O véu de
 * `SectionBanner` mantém o contraste do texto sobre qualquer fotografia
 * que esteja cadastrada na chave `home.hero.banner`.
 */
export function HomeHero() {
  const t = useTranslations('home.hero')
  const tActions = useTranslations('actions')
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  /* Movimento sutil da composição conforme o Hero sai de cena. */
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const grafismoY = useTransform(scrollYProgress, [0, 1], [0, 140])

  const hasBanner = Boolean(getMedia('home.hero'))
  const lines = t.raw('titleLines') as string[]

  return (
    <Section
      surface="dark"
      space="none"
      className="min-h-[100svh] pb-section-sm pt-18 lg:pt-22"
      ariaLabel="AIDEP"
    >
      <SectionBanner mediaKey="home.hero" tone="dark" priority />

      <div ref={ref} className="flex min-h-[calc(100svh-4.5rem)] flex-col justify-center">
        {/* Sem fotografia de capa, o grafismo institucional abre a página no
            lugar dela — nunca os dois ao mesmo tempo. */}
        {hasBanner ? null : (
          <motion.div
            aria-hidden="true"
            data-motion="parallax"
            style={{ y: grafismoY }}
            className="pointer-events-none absolute -right-[22%] -top-[12%] -z-10 w-[92vw] max-w-[1100px] opacity-[0.07] lg:-right-[10%] lg:w-[58vw]"
          >
            <Image
              src={symbolMark.white.src}
              alt=""
              width={symbolMark.white.width}
              height={symbolMark.white.height}
              priority
              sizes="(max-width: 1024px) 92vw, 58vw"
              className="h-auto w-full"
            />
          </motion.div>
        )}

        <Container className="py-section-sm">
          <motion.div
            style={{ y: textY, opacity: textOpacity }}
            className="flex max-w-[62rem] flex-col"
          >
            <motion.p className="eyebrow mb-8" {...enter(0.15)}>
              {t('eyebrow')}
            </motion.p>

            <SplitTextReveal
              as="h1"
              lines={lines}
              animateOnMount
              delay={0.25}
              className="text-display-xl font-extrabold tracking-[-0.045em]"
            />

            <motion.p
              className="mt-10 max-w-[52ch] text-lead text-(--fg-muted)"
              {...enter(0.55)}
            >
              {t('lead')}
            </motion.p>

            <motion.div
              className="mt-12 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center"
              {...enter(0.68)}
            >
              <MagneticButton>
                <ButtonAnchor href="#a-aidep" variant="accent" size="lg">
                  {tActions('knowAidep')}
                </ButtonAnchor>
              </MagneticButton>
              <MagneticButton>
                <ButtonLink href="/donate" variant="outline" size="lg">
                  {tActions('supportProjects')}
                </ButtonLink>
              </MagneticButton>
            </motion.div>
          </motion.div>
        </Container>

        <Container>
          <motion.p
            className="relative z-10 mt-6 hidden items-center gap-3 text-micro uppercase tracking-[0.18em] text-(--fg-subtle) lg:flex"
            {...enter(0.95)}
          >
            <ArrowDown aria-hidden="true" className="size-4 motion-safe:animate-bounce" />
            {t('scroll')}
          </motion.p>
        </Container>
      </div>
    </Section>
  )
}
