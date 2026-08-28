import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { CtaBand } from '@/components/sections/cta-band'
import { ImpactNarrative } from '@/components/sections/impact-narrative'
import { MetricsBand } from '@/components/sections/metrics-band'
import { PageHero } from '@/components/sections/page-hero'
import { ResultsRows } from '@/components/sections/results-rows'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'
import { audiences, headlineMetrics, projectMetrics } from '@/content/impact'
import type { Locale } from '@/i18n/routing'
import { buildPageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo.impact' })

  return buildPageMetadata({
    locale,
    href: '/impact',
    title: t('title'),
    description: t('description'),
  })
}

export default async function ImpactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'impact' })
  const tActions = await getTranslations({ locale, namespace: 'actions' })

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
      />

      <MetricsBand
        id="impact-headline"
        metrics={headlineMetrics}
        locale={locale}
        surface="brand"
        eyebrow={t('headline.eyebrow')}
        title={t('headline.title')}
        description={t('headline.description')}
      />

      <ImpactNarrative />

      <Section surface="light" ariaLabelledby="impact-audience-title">
        <Container className="flex flex-col gap-stack">
          <SectionHeader
            id="impact-audience-title"
            eyebrow={t('audience.eyebrow')}
            title={t('audience.title')}
          />
          <StaggerContainer as="ul" className="flex flex-wrap gap-3">
            {audiences[locale].map((item) => (
              <StaggerItem key={item} as="li">
                <span className="inline-flex min-h-11 items-center border border-(--border-strong) px-5 py-3 text-small font-medium">
                  {item}
                </span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <ResultsRows
        id="impact-projects"
        metrics={projectMetrics}
        locale={locale}
        surface="muted"
        eyebrow={t('byProject.eyebrow')}
        title={t('byProject.title')}
      />

      <CtaBand
        id="impact-cta"
        surface="dark"
        title={t('hero.title')}
        primary={{ href: '/projects', label: tActions('seeProjects') }}
        secondary={{ href: '/donate', label: tActions('donate') }}
      />
    </>
  )
}
