'use client'

import { useTranslations } from 'next-intl'
import { MaskedWords } from '@/components/motion/animated-text'
import { GrowLine } from '@/components/motion/grow-line'
import { ParallaxImage } from '@/components/motion/parallax'
import { Reveal } from '@/components/motion/reveal'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { ArrowAnchor } from '@/components/ui/anchor-link'
import { MediaFrame } from '@/components/ui/media-frame'
import { Container, Section } from '@/components/ui/section'
import { getMedia } from '@/content/media'
import type { Locale } from '@/i18n/routing'

type Highlight = { term: string; detail: string }

export function HomeAbout({ locale }: { locale: Locale }) {
  const t = useTranslations('home.about')
  const tActions = useTranslations('actions')

  const paragraphs = t.raw('paragraphs') as string[]
  const highlights = t.raw('highlights') as Highlight[]

  return (
    <Section id="a-aidep" surface="light" ariaLabelledby="home-about-title">
      <Container className="flex flex-col gap-stack">
        <GrowLine />

        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-7">
            <Reveal duration={0.5}>
              <p className="eyebrow mb-8">{t('eyebrow')}</p>
            </Reveal>

            <MaskedWords
              id="home-about-title"
              text={t('title')}
              className="max-w-[20ch] text-h1 font-bold tracking-[-0.04em]"
            />

            <div className="mt-10 flex max-w-[58ch] flex-col gap-6">
              {paragraphs.map((paragraph, index) => (
                <Reveal key={index} delay={0.08 * index} distance={24}>
                  <p className="text-lead text-(--fg-muted)">{paragraph}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2} distance={24} className="mt-10">
              <ArrowAnchor href="#publico-atendido">
                {tActions('seeAudience')}
              </ArrowAnchor>
            </Reveal>
          </div>

          <div className="flex flex-col gap-10 lg:col-span-4 lg:col-start-9">
            <ParallaxImage distance={56} className="w-full">
              <MediaFrame
                media={getMedia('home.about')}
                locale={locale}
                ratio="4 / 5"
                tone="light"
                sizes="(max-width: 1024px) 100vw, 32vw"
              />
            </ParallaxImage>

            <StaggerContainer as="dl" className="flex flex-col">
              {highlights.map((item) => (
                <StaggerItem
                  key={item.term}
                  className="border-t border-(--border) py-5 first:border-t-0 first:pt-0"
                >
                  <dt className="text-micro font-semibold uppercase tracking-[0.16em] text-(--fg-subtle)">
                    {item.term}
                  </dt>
                  <dd className="mt-2 text-small leading-relaxed text-(--fg)">
                    {item.detail}
                  </dd>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </Container>
    </Section>
  )
}
