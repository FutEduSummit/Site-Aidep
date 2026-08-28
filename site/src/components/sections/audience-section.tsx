'use client'

import { useTranslations } from 'next-intl'
import { ImageReveal } from '@/components/motion/image-reveal'
import { ParallaxImage } from '@/components/motion/parallax'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { MediaFrame } from '@/components/ui/media-frame'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'
import { getMedia } from '@/content/media'
import type { Locale } from '@/i18n/routing'

type Group = { title: string; text: string }

/**
 * PÚBLICO ATENDIDO
 *
 * Antes era uma fileira de etiquetas dentro da apresentação da associação.
 * Agora é seção própria: cada faixa de público ganha um parágrafo dizendo o
 * que a AIDEP oferece a ela, porque é isso que diferencia um público do
 * outro na prática — e não o nome na etiqueta.
 */
export function AudienceSection({ locale }: { locale: Locale }) {
  const t = useTranslations('about.audience')
  const groups = t.raw('groups') as Group[]

  return (
    <Section
      id="publico-atendido"
      surface="muted"
      ariaLabelledby="home-audience-title"
    >
      <Container className="flex flex-col gap-stack">
        <SectionHeader
          id="home-audience-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />

        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8">
          <ImageReveal className="lg:col-span-5" direction="left">
            <ParallaxImage distance={48} className="w-full">
              <MediaFrame
                media={getMedia('home.audience')}
                locale={locale}
                ratio="4 / 3"
                tone="light"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </ParallaxImage>
          </ImageReveal>

          <StaggerContainer
            as="ol"
            className="flex flex-col lg:col-span-6 lg:col-start-7"
          >
            {groups.map((group, index) => (
              <StaggerItem
                key={group.title}
                as="li"
                className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-(--border) py-6 last:border-b sm:gap-x-8"
              >
                <span className="pt-1 text-micro font-semibold uppercase tracking-[0.18em] text-(--accent-text)">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-h4 font-semibold tracking-[-0.02em]">
                    {group.title}
                  </h3>
                  <p className="max-w-[48ch] text-small leading-relaxed text-(--fg-muted)">
                    {group.text}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </Container>
    </Section>
  )
}
