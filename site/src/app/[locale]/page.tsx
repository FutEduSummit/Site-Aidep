import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ApproachSection } from '@/components/sections/approach-section'
import { CtaBand } from '@/components/sections/cta-band'
import { HomeAbout } from '@/components/sections/home-about'
import { HomeHero } from '@/components/sections/home-hero'
import { InstagramSection } from '@/components/sections/instagram-section'
import { MetricsBand } from '@/components/sections/metrics-band'
import { NewsPreview } from '@/components/sections/news-preview'
import { PartnersStrip } from '@/components/sections/partners-strip'
import { ProjectsShowcase } from '@/components/sections/projects-showcase'
import { ReachSection } from '@/components/sections/reach-section'
import { ResultsRows } from '@/components/sections/results-rows'
import { SportSection } from '@/components/sections/sport-section'
import { headlineMetrics, projectMetrics } from '@/content/impact'
import { getArticles } from '@/content/news'
import { partners } from '@/content/partners'
import { projects } from '@/content/projects'
import type { Locale } from '@/i18n/routing'
import { buildPageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo.home' })

  return buildPageMetadata({
    locale,
    href: '/',
    title: t('title'),
    description: t('description'),
  })
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'home' })
  const tActions = await getTranslations({ locale, namespace: 'actions' })
  const articles = getArticles(3)

  return (
    <>
      <HomeHero locale={locale} />

      <HomeAbout locale={locale} />

      <MetricsBand
        id="home-metrics"
        metrics={headlineMetrics}
        locale={locale}
        surface="brand"
        eyebrow={t('metrics.eyebrow')}
        title={t('metrics.title')}
        description={t('metrics.description')}
      />

      <ProjectsShowcase projects={projects} locale={locale} />

      <ApproachSection surface="dark" id="home-approach" />

      <SportSection locale={locale} />

      <ReachSection locale={locale} />

      <ResultsRows
        id="home-results"
        metrics={projectMetrics}
        locale={locale}
        surface="light"
        eyebrow={t('results.eyebrow')}
        title={t('results.title')}
        description={t('results.description')}
      />

      <PartnersStrip partners={partners} locale={locale} surface="muted" />

      <NewsPreview articles={articles} locale={locale} />

      <InstagramSection locale={locale} />

      <CtaBand
        id="home-partnership"
        surface="light"
        eyebrow={t('partnershipCta.eyebrow')}
        title={t('partnershipCta.title')}
        description={t('partnershipCta.description')}
        primary={{ href: '/partners', label: tActions('becomePartner') }}
        secondary={{ href: '/contact', label: tActions('contact') }}
      />

      <CtaBand
        id="home-donate"
        surface="brand"
        eyebrow={t('donateCta.eyebrow')}
        title={t('donateCta.title')}
        description={t('donateCta.description')}
        primary={{ href: '/donate', label: tActions('donate') }}
        secondary={{ href: '/transparency', label: tActions('seeTransparency') }}
      />
    </>
  )
}
