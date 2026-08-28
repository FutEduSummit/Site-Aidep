'use client'

import { useTranslations } from 'next-intl'
import { LogoMarquee } from '@/components/motion/logo-marquee'
import { ArrowLink } from '@/components/ui/arrow-link'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section, type Surface } from '@/components/ui/section'
import type { Partner } from '@/content/types'
import type { Locale } from '@/i18n/routing'

export function PartnersStrip({
  partners,
  locale,
  surface = 'muted',
}: {
  partners: Partner[]
  locale: Locale
  surface?: Surface
}) {
  const t = useTranslations('home.partners')
  const tList = useTranslations('partners.list')
  const tActions = useTranslations('actions')
  const tA11y = useTranslations('a11y')

  if (partners.length === 0) return null

  return (
    <Section surface={surface} ariaLabelledby="home-partners-title">
      <Container className="flex flex-col gap-stack">
        <SectionHeader
          id="home-partners-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
          action={<ArrowLink href="/partners">{tActions('seePartners')}</ArrowLink>}
        />
      </Container>

      <LogoMarquee
        partners={partners}
        locale={locale}
        label={tA11y('partnersMarquee')}
        pendingLabel={tList('logoPending')}
        className="mt-4 border-y border-(--border) py-8"
      />
    </Section>
  )
}
