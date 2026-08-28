'use client'

import { useTranslations } from 'next-intl'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'

type PurposeItem = { title: string; text: string }

/** Os três compromissos da associação — antes na página “A AIDEP”. */
export function PurposeSection() {
  const t = useTranslations('about.purpose')
  const items = t.raw('items') as PurposeItem[]

  return (
    <Section surface="light" ariaLabelledby="home-purpose-title">
      <Container className="flex flex-col gap-stack">
        <SectionHeader
          id="home-purpose-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
        />

        <StaggerContainer
          as="ul"
          className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3"
        >
          {items.map((item, index) => (
            <StaggerItem
              key={item.title}
              as="li"
              className="flex flex-col gap-4 border-t border-(--border) pt-8"
            >
              <span className="text-micro font-semibold uppercase tracking-[0.18em] text-(--accent-text)">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-h3 font-bold tracking-[-0.03em]">
                {item.title}
              </h3>
              <p className="max-w-[36ch] text-body text-(--fg-muted)">
                {item.text}
              </p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  )
}
