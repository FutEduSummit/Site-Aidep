import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ApproachSection } from '@/components/sections/approach-section'
import { AudienceSection } from '@/components/sections/audience-section'
import { ContactSection } from '@/components/sections/contact-section'
import { ContentBlock } from '@/components/sections/content-block'
import { CtaBand } from '@/components/sections/cta-band'
import { HomeAbout } from '@/components/sections/home-about'
import { HomeHero } from '@/components/sections/home-hero'
import { InstagramSection } from '@/components/sections/instagram-section'
import { MetricsBand } from '@/components/sections/metrics-band'
import { NewsPreview } from '@/components/sections/news-preview'
import { PartnersStrip } from '@/components/sections/partners-strip'
import { ProjectsShowcase } from '@/components/sections/projects-showcase'
import { PurposeSection } from '@/components/sections/purpose-section'
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

/**
 * PÁGINA INICIAL
 * ==============
 * Página única de apresentação da AIDEP. Reúne o que antes estava espalhado
 * em três páginas separadas — “A AIDEP”, “Impacto” e “Contato” — em uma
 * leitura contínua, na ordem em que as perguntas aparecem:
 *
 *   quem somos → o que nos move → quem atendemos → que impacto geramos →
 *   o que fazemos → como fazemos → onde estamos → quem caminha junto →
 *   o que está acontecendo → como apoiar → como falar com a gente
 *
 * As páginas que continuam existindo (Projetos, Notícias, Transparência,
 * Parceiros e Doações) são aprofundamentos, não caminhos paralelos: cada
 * assunto aparece aqui em resumo e leva para a página própria.
 *
 * Âncoras usadas pela navegação (ver `lib/nav.ts`):
 *   #a-aidep · #publico-atendido · #impacto · #contato
 */
export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'home' })
  const tAbout = await getTranslations({ locale, namespace: 'about' })
  const tImpact = await getTranslations({ locale, namespace: 'impact' })
  const tActions = await getTranslations({ locale, namespace: 'actions' })
  const articles = getArticles(3)

  return (
    <>
      <HomeHero />

      {/* ---- Quem somos ------------------------------------------- */}

      <HomeAbout locale={locale} />

      <PurposeSection />

      {/* ---- Quem atendemos --------------------------------------- */}

      <AudienceSection locale={locale} />

      {/* ---- Que impacto geramos ---------------------------------- */}

      <MetricsBand
        id="impacto"
        metrics={headlineMetrics}
        locale={locale}
        surface="brand"
        eyebrow={tImpact('headline.eyebrow')}
        title={tImpact('headline.title')}
        description={tImpact('headline.description')}
        mediaKey="home.impact.banner"
      />

      <ResultsRows
        id="home-results"
        metrics={projectMetrics}
        locale={locale}
        surface="light"
        eyebrow={t('results.eyebrow')}
        title={t('results.title')}
        description={t('results.description')}
      />

      {/* ---- O que fazemos, e como -------------------------------- */}

      <ProjectsShowcase projects={projects} locale={locale} />

      <ApproachSection surface="dark" id="home-approach" />

      <SportSection locale={locale} />

      {/* ---- Onde estamos e quem somos institucionalmente --------- */}

      <ContentBlock
        id="a-aidep-atuacao"
        locale={locale}
        surface="muted"
        eyebrow={tAbout('presence.eyebrow')}
        title={tAbout('presence.title')}
        paragraphs={tAbout.raw('presence.paragraphs') as string[]}
        mediaKey="home.presence"
        mediaRatio="1 / 1"
        mediaSide="left"
      />

      {/* ---- Quem caminha junto, e o que está acontecendo --------- */}

      <PartnersStrip partners={partners} locale={locale} surface="light" />

      <NewsPreview articles={articles} locale={locale} />

      <InstagramSection locale={locale} />

      {/* ---- Como apoiar e como falar com a gente ----------------- */}

      <CtaBand
        id="home-partnership"
        surface="dark"
        eyebrow={t('partnershipCta.eyebrow')}
        title={t('partnershipCta.title')}
        description={t('partnershipCta.description')}
        primary={{ href: '/partners', label: tActions('becomePartner') }}
        secondary={{ href: '#contato', label: tActions('contact') }}
        mediaKey="home.partnership.banner"
      />

      <CtaBand
        id="home-donate"
        surface="brand"
        eyebrow={t('donateCta.eyebrow')}
        title={t('donateCta.title')}
        description={t('donateCta.description')}
        primary={{ href: '/donate', label: tActions('donate') }}
        secondary={{ href: '/transparency', label: tActions('seeTransparency') }}
        mediaKey="home.donate.banner"
      />

      <ContactSection locale={locale} />
    </>
  )
}
