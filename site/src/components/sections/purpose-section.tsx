'use client'

import { useTranslations } from 'next-intl'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'

type PurposeItem = { title: string; text: string }

/**
 * Os três compromissos da associação — antes na página “A AIDEP”.
 *
 * Bloco curto: vem logo depois da `HomeAbout`, na mesma superfície clara e
 * aberto por uma régua, então funciona como fecho daquele bloco. Por isso o
 * espaçamento é `compact` — com o padrão, os três cartões de duas linhas
 * ficavam boiando no meio de um vazio grande demais.
 */
export function PurposeSection() {
  const t = useTranslations('about.purpose')
  const items = t.raw('items') as PurposeItem[]

  return (
    <Section
      surface="light"
      space="compact"
      ariaLabelledby="home-purpose-title"
    >
      <Container className="flex flex-col gap-10 lg:gap-14">
        <SectionHeader
          id="home-purpose-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
        />

        <StaggerContainer
          as="ul"
          className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-3"
        >
          {items.map((item, index) => (
            <StaggerItem
              key={item.title}
              as="li"
              className="flex flex-col gap-3 border-t border-(--border) pt-6"
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
