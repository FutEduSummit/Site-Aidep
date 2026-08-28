'use client'

import { useTranslations } from 'next-intl'
import { MaskedWords } from '@/components/motion/animated-text'
import { GrowLine } from '@/components/motion/grow-line'
import { Reveal } from '@/components/motion/reveal'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { Container, Section, type Surface } from '@/components/ui/section'

type ApproachItem = { title: string; text: string }

export function ApproachSection({
  surface = 'dark',
  id = 'approach',
}: {
  surface?: Surface
  id?: string
}) {
  const t = useTranslations('home.approach')
  const tItems = useTranslations('approach')
  const items = tItems.raw('items') as ApproachItem[]

  return (
    <Section surface={surface} ariaLabelledby={`${id}-title`}>
      <Container className="flex flex-col gap-stack">
        <GrowLine />

        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8">
          <div className="lg:sticky lg:top-32 lg:col-span-4">
            <Reveal duration={0.5}>
              <p className="eyebrow mb-8">{t('eyebrow')}</p>
            </Reveal>
            <MaskedWords
              id={`${id}-title`}
              text={t('title')}
              className="max-w-[16ch] text-h1 font-bold tracking-[-0.04em]"
            />
            <Reveal delay={0.12} distance={24}>
              <p className="mt-8 max-w-[44ch] text-lead text-(--fg-muted)">
                {t('description')}
              </p>
            </Reveal>
          </div>

          <StaggerContainer
            as="ol"
            className="flex flex-col lg:col-span-7 lg:col-start-6"
          >
            {items.map((item, index) => (
              <StaggerItem
                key={item.title}
                as="li"
                className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-t border-(--border) py-8 last:border-b sm:gap-x-10"
              >
                <span className="pt-1 text-micro font-semibold uppercase tracking-[0.18em] text-(--accent)">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-3">
                  <h3 className="text-h3 font-bold tracking-[-0.03em]">
                    {item.title}
                  </h3>
                  <p className="max-w-[52ch] text-body text-(--fg-muted)">
                    {item.text}
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
