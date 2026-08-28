import type { Metadata } from 'next'
import { AtSign, Mail, MapPin, Phone } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ContactForm } from '@/components/forms/contact-form'
import { PageHero } from '@/components/sections/page-hero'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'
import { site } from '@/content/site'
import type { Locale } from '@/i18n/routing'
import { buildPageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo.contact' })

  return buildPageMetadata({
    locale,
    href: '/contact',
    title: t('title'),
    description: t('description'),
  })
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'contact' })

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
      />

      <Section surface="light" ariaLabelledby="contact-form-title">
        <Container>
          <div className="flex flex-col gap-16 lg:grid lg:grid-cols-12 lg:gap-x-8">
            <div className="lg:col-span-7">
              <SectionHeader
                id="contact-form-title"
                eyebrow={t('form.eyebrow')}
                title={t('form.title')}
                layout="stacked"
                className="mb-12"
              />
              <ContactForm />
            </div>

            <aside className="flex flex-col gap-8 lg:col-span-4 lg:col-start-9">
              <h2 className="text-micro font-semibold uppercase tracking-[0.16em] text-(--fg-subtle)">
                {t('info.eyebrow')}
              </h2>

              <dl className="flex flex-col">
                <div className="flex flex-col gap-2 border-t border-(--border) py-6">
                  <dt className="flex items-center gap-3 text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-subtle)">
                    <Mail aria-hidden="true" className="size-4" />
                    {t('info.email')}
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${site.contact.email}`}
                      className="link-underline text-h4 font-semibold tracking-[-0.02em]"
                    >
                      {site.contact.email}
                    </a>
                  </dd>
                </div>

                <div className="flex flex-col gap-2 border-t border-(--border) py-6">
                  <dt className="flex items-center gap-3 text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-subtle)">
                    <Phone aria-hidden="true" className="size-4" />
                    {t('info.phone')}
                  </dt>
                  <dd className="text-body text-(--fg-muted)">
                    {site.contact.phone ? (
                      <a
                        href={`tel:${site.contact.phone.replace(/[^\d+]/g, '')}`}
                        className="link-underline text-h4 font-semibold tracking-[-0.02em] text-(--fg)"
                      >
                        {site.contact.phone}
                      </a>
                    ) : (
                      t('info.pending')
                    )}
                  </dd>
                </div>

                <div className="flex flex-col gap-2 border-t border-(--border) py-6">
                  <dt className="flex items-center gap-3 text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-subtle)">
                    <MapPin aria-hidden="true" className="size-4" />
                    {t('info.address')}
                  </dt>
                  <dd className="text-h4 font-semibold tracking-[-0.02em]">
                    {site.contact.city} — {site.contact.region},{' '}
                    {site.contact.country[locale]}
                  </dd>
                </div>

                <div className="flex flex-col gap-2 border-t border-(--border) py-6 last:border-b">
                  <dt className="flex items-center gap-3 text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-subtle)">
                    <AtSign aria-hidden="true" className="size-4" />
                    {t('info.social')}
                  </dt>
                  <dd>
                    <a
                      href={site.social.instagram.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="link-underline text-h4 font-semibold tracking-[-0.02em]"
                    >
                      {site.social.instagram.handle}
                    </a>
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  )
}
