import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { PartnerForm } from '@/components/forms/partner-form'
import { PageHero } from '@/components/sections/page-hero'
import { PartnersStrip } from '@/components/sections/partners-strip'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'
import { institutionalSupport, partners } from '@/content/partners'
import type { Locale } from '@/i18n/routing'
import { buildPageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

type WhyItem = { title: string; text: string }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo.partners' })

  return buildPageMetadata({
    locale,
    href: '/partners',
    title: t('title'),
    description: t('description'),
  })
}

export default async function PartnersPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'partners' })
  const whyItems = t.raw('why.items') as WhyItem[]

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        mediaKey="page.partners.banner"
      />

      <Section surface="light" ariaLabelledby="partners-list-title">
        <Container className="flex flex-col gap-stack">
          <SectionHeader
            id="partners-list-title"
            eyebrow={t('list.eyebrow')}
            title={t('list.title')}
          />

          <StaggerContainer as="ul" className="flex flex-col">
            {partners.map((partner) => (
              <StaggerItem
                key={partner.id}
                as="li"
                className="flex flex-col gap-2 border-t border-(--border) py-7 last:border-b sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <h3 className="text-h3 font-bold tracking-[-0.03em]">
                  {partner.name}
                </h3>
                <p className="text-micro uppercase tracking-[0.16em] text-(--fg-subtle)">
                  {t(`list.kinds.${partner.kind}`)}
                </p>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <p className="text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
            {t('list.logoPending')}
          </p>
        </Container>
      </Section>

      <PartnersStrip partners={partners} locale={locale} surface="muted" />

      <Section surface="light" ariaLabelledby="partners-support-title">
        <Container className="flex flex-col gap-stack">
          <SectionHeader
            id="partners-support-title"
            eyebrow={t('support.eyebrow')}
            title={t('support.title')}
          />
          <ul className="flex flex-col">
            {institutionalSupport[locale].map((item) => (
              <li
                key={item}
                className="border-t border-(--border) py-6 text-h4 font-semibold tracking-[-0.02em] last:border-b"
              >
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section surface="dark" ariaLabelledby="partners-why-title">
        <Container className="flex flex-col gap-stack">
          <SectionHeader
            id="partners-why-title"
            eyebrow={t('why.eyebrow')}
            title={t('why.title')}
          />
          <StaggerContainer
            as="ul"
            className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3"
          >
            {whyItems.map((item, index) => (
              <StaggerItem
                key={item.title}
                as="li"
                className="flex flex-col gap-4 border-t border-(--border) pt-8"
              >
                <span className="text-micro font-semibold uppercase tracking-[0.18em] text-(--accent)">
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

      <Section
        id="seja-parceiro"
        surface="light"
        ariaLabelledby="partners-form-title"
      >
        <Container className="flex flex-col gap-stack">
          <SectionHeader
            id="partners-form-title"
            eyebrow={t('form.eyebrow')}
            title={t('form.title')}
            description={t('form.description')}
          />
          <div className="lg:grid lg:grid-cols-12">
            <div className="lg:col-span-8">
              <PartnerForm />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
