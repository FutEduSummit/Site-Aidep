import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { PageHero } from '@/components/sections/page-hero'
import { Accordion } from '@/components/ui/accordion'
import { ArrowLink } from '@/components/ui/arrow-link'
import { ButtonExternal } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'
import { site } from '@/content/site'
import { projects } from '@/content/projects'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { buildPageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

type ImpactItem = { title: string; text: string }
type FaqItem = { question: string; answer: string }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo.donate' })

  return buildPageMetadata({
    locale,
    href: '/donate',
    title: t('title'),
    description: t('description'),
  })
}

export default async function DonatePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'donate' })
  const tFaq = await getTranslations({ locale, namespace: 'faq' })
  const tActions = await getTranslations({ locale, namespace: 'actions' })

  const impactItems = t.raw('impact.items') as ImpactItem[]
  const faqItems = tFaq.raw('items') as FaqItem[]

  /* Dados oficiais de doação ainda não fornecidos: a etapa de pagamento
     permanece oculta e o site diz isso com clareza. */
  const hasDonationChannels = Boolean(site.donation.pix || site.donation.bank)

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        mediaKey="page.donate.banner"
      />

      <Section surface="light" ariaLabelledby="donate-impact-title">
        <Container className="flex flex-col gap-stack">
          <SectionHeader
            id="donate-impact-title"
            eyebrow={t('impact.eyebrow')}
            title={t('impact.title')}
          />
          <StaggerContainer
            as="ul"
            className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3"
          >
            {impactItems.map((item, index) => (
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

      <Section surface="muted" ariaLabelledby="donate-projects-title">
        <Container className="flex flex-col gap-stack">
          <SectionHeader
            id="donate-projects-title"
            eyebrow={t('projects.eyebrow')}
            title={t('projects.title')}
          />
          <StaggerContainer as="ul" className="flex flex-col">
            {projects.map((project) => (
              <StaggerItem
                key={project.slug}
                as="li"
                className="border-t border-(--border) py-7 last:border-b"
              >
                <Link
                  href={{
                    pathname: '/projects/[slug]',
                    params: { slug: project.slug },
                  }}
                  className="group/link flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <h3 className="text-h3 font-bold tracking-[-0.03em]">
                    <span className="link-underline">{project.name}</span>
                  </h3>
                  <p className="max-w-[40ch] text-small text-(--fg-muted)">
                    {project.summary[locale]}
                  </p>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section surface="dark" ariaLabelledby="donate-channels-title">
        <Container className="flex flex-col gap-stack">
          <SectionHeader
            id="donate-channels-title"
            eyebrow={t('channels.eyebrow')}
            title={t('channels.title')}
          />

          {hasDonationChannels ? null : (
            <EmptyState
              title={t('channels.pending')}
              description={t('channels.description')}
              action={
                <ButtonExternal
                  href={`mailto:${site.contact.email}`}
                  variant="accent"
                  icon="none"
                >
                  {tActions('sendEmail')}
                </ButtonExternal>
              }
            />
          )}
        </Container>
      </Section>

      <Section surface="light" ariaLabelledby="donate-transparency-title">
        <Container className="flex flex-col gap-stack">
          <SectionHeader
            id="donate-transparency-title"
            eyebrow={t('transparency.eyebrow')}
            title={t('transparency.title')}
            description={t('transparency.description')}
            action={
              <ArrowLink href="/transparency">
                {tActions('seeTransparency')}
              </ArrowLink>
            }
          />
        </Container>
      </Section>

      <Section surface="muted" ariaLabelledby="donate-faq-title">
        <Container className="flex flex-col gap-stack">
          <SectionHeader
            id="donate-faq-title"
            eyebrow={t('faq.eyebrow')}
            title={t('faq.title')}
          />
          <div className="lg:grid lg:grid-cols-12">
            <div className="lg:col-span-9">
              <Accordion items={faqItems} />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
