import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { CtaBand } from '@/components/sections/cta-band'
import { DocumentsExplorer } from '@/components/sections/documents-explorer'
import { PageHero } from '@/components/sections/page-hero'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'
import { documents, getDocumentYears, lastUpdatedAt } from '@/content/documents'
import type { Locale } from '@/i18n/routing'
import { buildPageMetadata } from '@/lib/seo'
import { formatMonthYear } from '@/lib/utils'

type Props = { params: Promise<{ locale: Locale }> }

const localeTag: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo.transparency' })

  return buildPageMetadata({
    locale,
    href: '/transparency',
    title: t('title'),
    description: t('description'),
  })
}

export default async function TransparencyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'transparency' })
  const tActions = await getTranslations({ locale, namespace: 'actions' })
  const commitmentItems = t.raw('commitment.items') as string[]

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        mediaKey="page.transparency.banner"
        aside={
          <dl className="flex flex-col gap-6">
            <div className="border-t border-(--border) pt-5">
              <dt className="text-micro font-semibold uppercase tracking-[0.16em] text-(--fg-subtle)">
                {t('labels.frequency')}
              </dt>
              <dd className="mt-2 text-h4 font-semibold tracking-[-0.02em]">
                {t('labels.frequencyValue')}
              </dd>
            </div>
            <div className="border-t border-(--border) pt-5">
              <dt className="text-micro font-semibold uppercase tracking-[0.16em] text-(--fg-subtle)">
                {t('labels.lastUpdate')}
              </dt>
              <dd className="mt-2 text-small text-(--fg-muted)">
                {lastUpdatedAt
                  ? formatMonthYear(lastUpdatedAt, localeTag[locale])
                  : t('labels.pendingUpdate')}
              </dd>
            </div>
          </dl>
        }
      />

      <DocumentsExplorer
        documents={documents}
        years={getDocumentYears()}
        locale={locale}
      />

      <Section surface="muted" ariaLabelledby="transparency-commitment-title">
        <Container className="flex flex-col gap-stack">
          <SectionHeader
            id="transparency-commitment-title"
            eyebrow={t('commitment.eyebrow')}
            title={t('commitment.title')}
          />
          <StaggerContainer
            as="ul"
            className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {commitmentItems.map((item, index) => (
              <StaggerItem
                key={item}
                as="li"
                className="flex flex-col gap-4 border-t border-(--border) pt-6"
              >
                <span className="text-micro font-semibold uppercase tracking-[0.18em] text-(--accent-text)">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="text-h4 font-semibold tracking-[-0.02em]">{item}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <CtaBand
        id="transparency-cta"
        surface="dark"
        mediaKey="home.donate.banner"
        title={t('hero.title')}
        primary={{ href: '/donate', label: tActions('donate') }}
        secondary={{ href: '/partners', label: tActions('seePartners') }}
      />
    </>
  )
}
