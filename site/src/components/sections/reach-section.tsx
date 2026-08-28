'use client'

import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { MaskedWords } from '@/components/motion/animated-text'
import { GrowLine } from '@/components/motion/grow-line'
import { Reveal } from '@/components/motion/reveal'
import { Container, Section } from '@/components/ui/section'
import { continents } from '@/content/impact'
import type { Locale } from '@/i18n/routing'
import { DURATION, EASE, STAGGER, VIEWPORT } from '@/lib/motion'

/**
 * Alcance nacional e internacional.
 *
 * O sistema continental de cores é parte da identidade oficial da AIDEP:
 * o manual da marca define uma cor para cada continente e determina que
 * ela seja usada apenas na comunicação daquele continente. Aqui as cores
 * aparecem exatamente nesse contexto — apresentando o sistema, sem
 * substituir o verde institucional em nenhum outro lugar do site.
 */
export function ReachSection({ locale }: { locale: Locale }) {
  const t = useTranslations('home.reach')
  const paragraphs = t.raw('paragraphs') as string[]

  return (
    <Section surface="dark" ariaLabelledby="home-reach-title">
      <Container className="flex flex-col gap-stack">
        <GrowLine />

        <div className="flex flex-col gap-14 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8">
          <div className="lg:col-span-6">
            <Reveal duration={0.5}>
              <p className="eyebrow mb-8">{t('eyebrow')}</p>
            </Reveal>

            <MaskedWords
              id="home-reach-title"
              text={t('title')}
              className="max-w-[16ch] text-h1 font-bold tracking-[-0.04em]"
            />

            <div className="mt-10 flex max-w-[54ch] flex-col gap-6">
              {paragraphs.map((paragraph, index) => (
                <Reveal key={index} delay={0.08 * index} distance={24}>
                  <p className="text-body text-(--fg-muted)">{paragraph}</p>
                </Reveal>
              ))}
            </div>

            <dl className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
              <Reveal as="div" distance={24}>
                <dt className="text-micro font-semibold uppercase tracking-[0.16em] text-(--fg-subtle)">
                  {t('nationalLabel')}
                </dt>
                <dd className="mt-3 text-h4 font-semibold tracking-[-0.02em]">
                  {t('nationalValue')}
                </dd>
              </Reveal>
              <Reveal as="div" distance={24} delay={0.08}>
                <dt className="text-micro font-semibold uppercase tracking-[0.16em] text-(--fg-subtle)">
                  {t('internationalLabel')}
                </dt>
                <dd className="mt-3 text-h4 font-semibold tracking-[-0.02em]">
                  {t('internationalValue')}
                </dd>
              </Reveal>
            </dl>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <p className="mb-8 text-micro font-semibold uppercase tracking-[0.16em] text-(--fg-subtle)">
              {t('continentsLabel')}
            </p>

            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3, margin: VIEWPORT.margin }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: STAGGER.base } },
              }}
              className="flex flex-col"
            >
              {continents.map((continent) => (
                <motion.li
                  key={continent.id}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: DURATION.fast, ease: EASE },
                    },
                  }}
                  className="flex items-center gap-6 border-t border-(--border) py-5 last:border-b"
                >
                  <motion.span
                    aria-hidden="true"
                    className="block h-2 w-16 shrink-0 origin-left sm:w-24"
                    style={{ backgroundColor: continent.color, skewX: -12 }}
                    variants={{
                      hidden: { scaleX: 0 },
                      visible: {
                        scaleX: 1,
                        transition: { duration: DURATION.base, ease: EASE },
                      },
                    }}
                  />
                  <span className="text-h4 font-semibold tracking-[-0.02em]">
                    {continent.name[locale]}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </Container>
    </Section>
  )
}
