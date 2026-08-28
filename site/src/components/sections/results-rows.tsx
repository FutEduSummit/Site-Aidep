'use client'

import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { AnimatedCounter } from '@/components/motion/counter'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section, type Surface } from '@/components/ui/section'
import type { Metric } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { DURATION, EASE, STAGGER, VIEWPORT } from '@/lib/motion'

const localeTag: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
}

type ResultsRowsProps = {
  metrics: Metric[]
  locale: Locale
  eyebrow?: string
  title: string
  description?: string
  id?: string
  surface?: Surface
}

/**
 * Resultados em linhas editoriais: cada número ocupa uma faixa própria,
 * com a régua crescendo antes da entrada do conteúdo.
 */
export function ResultsRows({
  metrics,
  locale,
  eyebrow,
  title,
  description,
  id = 'results',
  surface = 'light',
}: ResultsRowsProps) {
  const t = useTranslations('home.results')

  return (
    <Section surface={surface} ariaLabelledby={`${id}-title`}>
      <Container className="flex flex-col gap-stack">
        <SectionHeader
          id={`${id}-title`}
          eyebrow={eyebrow ?? t('eyebrow')}
          title={title}
          description={description}
        />

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: VIEWPORT.margin }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: STAGGER.loose } },
          }}
          className="flex flex-col"
        >
          {metrics.map((metric) => (
            <motion.li
              key={metric.id}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1 } },
              }}
              className="relative py-8 sm:py-10"
            >
              <motion.span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px origin-left bg-(--rule)"
                variants={{
                  hidden: { scaleX: 0 },
                  visible: {
                    scaleX: 1,
                    transition: { duration: DURATION.slow, ease: EASE },
                  },
                }}
              />

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: DURATION.base, ease: EASE },
                  },
                }}
                className="flex flex-col gap-4 sm:grid sm:grid-cols-12 sm:items-baseline sm:gap-8"
              >
                <div className="sm:col-span-4 lg:col-span-3">
                  <AnimatedCounter
                    value={metric.value}
                    locale={localeTag[locale]}
                    prefix={metric.prefix}
                    suffix={metric.suffix?.[locale]}
                    className="text-h1 font-extrabold tracking-[-0.045em]"
                    suffixClassName="text-[0.4em] font-semibold uppercase tracking-[0.06em] text-(--accent-text)"
                  />
                </div>

                <p className="text-h4 font-semibold tracking-[-0.02em] sm:col-span-5 lg:col-span-5">
                  {metric.label[locale]}
                </p>

                {metric.note ? (
                  <p className="text-micro uppercase tracking-[0.14em] text-(--fg-subtle) sm:col-span-3 sm:text-right lg:col-span-4">
                    {metric.note[locale]}
                  </p>
                ) : null}
              </motion.div>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </Section>
  )
}
