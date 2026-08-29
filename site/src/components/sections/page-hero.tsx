'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { MaskedWords } from '@/components/motion/animated-text'
import { SectionBanner } from '@/components/ui/section-banner'
import { getMedia } from '@/content/media'
import { Container, Section } from '@/components/ui/section'
import { symbolMark } from '@/lib/brand'
import { DURATION, EASE } from '@/lib/motion'

type PageHeroProps = {
  eyebrow: string
  title: string
  lead?: string
  children?: ReactNode
  /** Conteúdo alinhado à direita — números, categoria, data. */
  aside?: ReactNode
  /** Faixa de fotografia ao fundo — chave do registro de mídia. */
  mediaKey?: string
}

/**
 * Hero das páginas internas.
 * Mesma linguagem do Hero da Home — fotografia sangrada ao fundo, grafismo
 * em movimento e título revelado por máscara — em escala menor, para não
 * competir com o conteúdo da página. Sem `mediaKey`, a faixa fica no fundo
 * escuro sólido de sempre.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
  aside,
  mediaKey,
}: PageHeroProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const hasBanner = Boolean(mediaKey && getMedia(mediaKey))
  const grafismoY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -40])

  return (
    <Section
      surface="dark"
      space="none"
      className="pb-section-sm pt-18 lg:pt-22"
      ariaLabelledby="page-title"
    >
      {hasBanner && mediaKey ? (
        <SectionBanner mediaKey={mediaKey} tone="dark" strength="strong" priority />
      ) : null}

      <div ref={ref}>
        {hasBanner ? null : (
          <motion.div
            aria-hidden="true"
            data-motion="parallax"
            style={{ y: grafismoY }}
            className="pointer-events-none absolute -right-[24%] -top-[30%] -z-10 w-[90vw] max-w-[900px] opacity-[0.05] lg:-right-[8%] lg:w-[46vw]"
          >
            <Image
              src={symbolMark.white.src}
              alt=""
              width={symbolMark.white.width}
              height={symbolMark.white.height}
              priority
              sizes="(max-width: 1024px) 90vw, 46vw"
              className="h-auto w-full"
            />
          </motion.div>
        )}

        <Container className="pt-section-sm">
          <motion.div
            style={{ y: contentY }}
            className="flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:items-end lg:gap-8"
          >
            <div className="lg:col-span-8">
              <motion.p
                className="eyebrow mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.base, ease: EASE, delay: 0.12 }}
              >
                {eyebrow}
              </motion.p>

              <MaskedWords
                as="h1"
                id="page-title"
                text={title}
                animateOnMount
                delay={0.2}
                className="max-w-[20ch] text-display font-extrabold tracking-[-0.045em]"
              />

              {lead ? (
                <motion.p
                  className="mt-8 max-w-[54ch] text-lead text-(--fg-muted)"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: DURATION.base, ease: EASE, delay: 0.48 }}
                >
                  {lead}
                </motion.p>
              ) : null}

              {children ? (
                <motion.div
                  className="mt-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: DURATION.base, ease: EASE, delay: 0.58 }}
                >
                  {children}
                </motion.div>
              ) : null}
            </div>

            {aside ? (
              <motion.div
                className="lg:col-span-3 lg:col-start-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.base, ease: EASE, delay: 0.62 }}
              >
                {aside}
              </motion.div>
            ) : null}
          </motion.div>
        </Container>
      </div>
    </Section>
  )
}
