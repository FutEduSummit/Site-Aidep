import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { ContentBlock } from '@/components/sections/content-block'
import { CtaBand } from '@/components/sections/cta-band'
import { PageHero } from '@/components/sections/page-hero'
import { ReachSection } from '@/components/sections/reach-section'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'
import { audiences } from '@/content/impact'
import { site } from '@/content/site'
import type { Locale } from '@/i18n/routing'
import { buildPageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo.about' })

  return buildPageMetadata({
    locale,
    href: '/about',
    title: t('title'),
    description: t('description'),
  })
}

type PurposeItem = { title: string; text: string }

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'about' })
  const tActions = await getTranslations({ locale, namespace: 'actions' })
  const purposeItems = t.raw('purpose.items') as PurposeItem[]

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        aside={
          <dl className="flex flex-col gap-6 border-t border-(--border) pt-6">
            <div>
              <dt className="text-micro font-semibold uppercase tracking-[0.16em] text-(--fg-subtle)">
                {t('hero.eyebrow')}
              </dt>
              <dd className="mt-2 text-small text-(--fg-muted)">
                {site.legalName[locale]}
              </dd>
            </div>
          </dl>
        }
      />

      <ContentBlock
        id="about-positioning"
        locale={locale}
        surface="light"
        eyebrow={t('positioning.eyebrow')}
        title={t('positioning.title')}
        paragraphs={t.raw('positioning.paragraphs') as string[]}
        mediaKey="about.hero"
        mediaRatio="4 / 5"
      />

      <Section surface="muted" ariaLabelledby="about-purpose-title">
        <Container className="flex flex-col gap-stack">
          <SectionHeader
            id="about-purpose-title"
            eyebrow={t('purpose.eyebrow')}
            title={t('purpose.title')}
          />

          <StaggerContainer
            as="ul"
            className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3"
          >
            {purposeItems.map((item, index) => (
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

      <Section surface="light" ariaLabelledby="about-audience-title">
        <Container className="flex flex-col gap-stack">
          <SectionHeader
            id="about-audience-title"
            eyebrow={t('audience.eyebrow')}
            title={t('audience.title')}
            description={t('audience.description')}
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

      <ContentBlock
        id="about-reach"
        locale={locale}
        surface="muted"
        eyebrow={t('reach.eyebrow')}
        title={t('reach.title')}
        paragraphs={t.raw('reach.paragraphs') as string[]}
        mediaKey="about.history"
        mediaRatio="1 / 1"
        mediaSide="left"
      />

      <ReachSection locale={locale} />

      <ContentBlock
        id="about-identity"
        locale={locale}
        surface="light"
        eyebrow={t('identity.eyebrow')}
        title={t('identity.title')}
        paragraphs={t.raw('identity.paragraphs') as string[]}
      />

      <ContentBlock
        id="about-governance"
        locale={locale}
        surface="muted"
        eyebrow={t('governance.eyebrow')}
        title={t('governance.title')}
        paragraphs={t.raw('governance.paragraphs') as string[]}
      />

      <CtaBand
        id="about-cta"
        surface="brand"
        title={t('cta.title')}
        primary={{ href: '/projects', label: tActions('seeProjects') }}
        secondary={{ href: '/donate', label: tActions('donate') }}
      />
    </>
  )
}
