'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowDown } from 'lucide-react'
import { ImageReveal } from '@/components/motion/image-reveal'
import { MagneticButton } from '@/components/motion/magnetic'
import { SplitTextReveal } from '@/components/motion/animated-text'
import { ButtonAnchor } from '@/components/ui/anchor-link'
import { ButtonLink } from '@/components/ui/button'
import { MediaFrame } from '@/components/ui/media-frame'
import { Container, Section } from '@/components/ui/section'
import { getMedia } from '@/content/media'
import type { Locale } from '@/i18n/routing'
import { symbolMark } from '@/lib/brand'
import { DURATION, EASE } from '@/lib/motion'
import Image from 'next/image'

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.base, ease: EASE, delay },
})

export function HomeHero({ locale }: { locale: Locale }) {
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
  const mediaY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.06])
  const grafismoY = useTransform(scrollYProgress, [0, 1], [0, 140])

  const lines = t.raw('titleLines') as string[]

  return (
    <Section
      surface="dark"
      space="none"
      className="min-h-[100svh] pb-section-sm pt-18 lg:pt-22"
      ariaLabel="AIDEP"
    >
      <div ref={ref} className="flex min-h-[calc(100svh-4.5rem)] flex-col justify-center">
        {/* Grafismo institucional: símbolo ampliado, sangrando pela borda. */}
        <motion.div
          aria-hidden="true"
          data-motion="parallax"
          style={{ y: grafismoY }}
          className="pointer-events-none absolute -right-[22%] -top-[12%] -z-10 w-[92vw] max-w-[1100px] opacity-[0.05] lg:-right-[10%] lg:w-[58vw]"
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

        <Container className="py-section-sm">
          <div className="flex flex-col gap-14 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
            <motion.div
              style={{ y: textY, opacity: textOpacity }}
              className="flex flex-col lg:col-span-8"
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

              <motion.dl
                className="mt-14 flex flex-wrap items-end gap-x-12 gap-y-6 border-t border-(--border) pt-8"
                {...enter(0.8)}
              >
                <div>
                  <dt className="sr-only">{t('statLabel')}</dt>
                  <dd className="flex items-baseline gap-3">
                    <span className="text-h1 font-extrabold tracking-[-0.045em] text-(--accent)">
                      {t('statValue')}
                    </span>
                    <span className="max-w-[12ch] text-micro uppercase leading-tight tracking-[0.14em] text-(--fg-muted)">
                      {t('statLabel')}
                    </span>
                  </dd>
                </div>
                <div className="max-w-[26ch] text-micro uppercase leading-relaxed tracking-[0.14em] text-(--fg-subtle)">
                  {t('reach')}
                </div>
              </motion.dl>
            </motion.div>

            <motion.div
              style={{ y: mediaY, scale: mediaScale }}
              className="lg:col-span-3 lg:col-start-10"
            >
              <ImageReveal animateOnMount delay={0.3} duration={DURATION.slow}>
                <MediaFrame
                  media={getMedia('home.hero')}
                  locale={locale}
                  ratio="3 / 4"
                  tone="dark"
                  priority
                  sizes="(max-width: 1024px) 100vw, 26vw"
                />
              </ImageReveal>
            </motion.div>
          </div>
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
