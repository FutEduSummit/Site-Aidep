import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CtaBand } from '@/components/sections/cta-band'
import { PageHero } from '@/components/sections/page-hero'
import { ProjectsIndex } from '@/components/sections/projects-index'
import { projects } from '@/content/projects'
import type { Locale } from '@/i18n/routing'
import { buildPageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo.projects' })

  return buildPageMetadata({
    locale,
    href: '/projects',
    title: t('title'),
    description: t('description'),
  })
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'projects' })
  const tHome = await getTranslations({ locale, namespace: 'home' })
  const tActions = await getTranslations({ locale, namespace: 'actions' })

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        aside={
          <p className="border-t border-(--border) pt-6 text-micro uppercase leading-relaxed tracking-[0.14em] text-(--fg-subtle)">
            {tHome('projects.description')}
          </p>
        }
      />

      <ProjectsIndex projects={projects} locale={locale} />

      <CtaBand
        id="projects-cta"
        surface="brand"
        eyebrow={tHome('donateCta.eyebrow')}
        title={tHome('donateCta.title')}
        description={tHome('donateCta.description')}
        primary={{ href: '/donate', label: tActions('donate') }}
        secondary={{ href: '/partners', label: tActions('becomePartner') }}
      />
    </>
  )
}
