'use client'

import { useTranslations } from 'next-intl'
import { MaskedWords } from '@/components/motion/animated-text'
import { ImageReveal } from '@/components/motion/image-reveal'
import { ParallaxImage } from '@/components/motion/parallax'
import { Reveal } from '@/components/motion/reveal'
import { MediaFrame } from '@/components/ui/media-frame'
import { Container, Section } from '@/components/ui/section'
import { getMedia } from '@/content/media'
import type { Locale } from '@/i18n/routing'

/**
 * Esporte e paradesporto como ferramentas de transformação.
 * Composição assimétrica: a imagem sangra pela esquerda e o texto ocupa a
 * coluna direita, quebrando o ritmo das seções anteriores.
 *
 * Os três compromissos — formação, inclusão e transformação social — ficam
 * apenas na `PurposeSection`, logo acima na página, para não repetir.
 */
export function SportSection({ locale }: { locale: Locale }) {
  const t = useTranslations('home.sport')
  const paragraphs = t.raw('paragraphs') as string[]

  return (
    <Section surface="light" ariaLabelledby="home-sport-title">
      <Container>
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
          <ImageReveal className="lg:col-span-6" direction="left">
            <ParallaxImage distance={64} className="w-full">
              <MediaFrame
                media={getMedia('home.sport')}
                locale={locale}
                ratio="5 / 6"
                tone="light"
                sizes="(max-width: 1024px) 100vw, 46vw"
              />
            </ParallaxImage>
          </ImageReveal>

          <div className="lg:col-span-5 lg:col-start-8">
            <Reveal duration={0.5}>
              <p className="eyebrow mb-8">{t('eyebrow')}</p>
            </Reveal>

            <MaskedWords
              id="home-sport-title"
              text={t('title')}
              className="text-h1 font-bold tracking-[-0.04em]"
            />

            <div className="mt-10 flex flex-col gap-6">
              {paragraphs.map((paragraph, index) => (
                <Reveal key={index} delay={0.08 * index} distance={24}>
                  <p className="max-w-[50ch] text-body text-(--fg-muted)">
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
