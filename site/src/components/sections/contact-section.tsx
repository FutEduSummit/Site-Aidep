'use client'

import { AtSign, Mail, MapPin, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ContactForm } from '@/components/forms/contact-form'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'
import { site } from '@/content/site'
import type { Locale } from '@/i18n/routing'

/**
 * CONTATO — fim da página inicial.
 *
 * Não existe mais página de Contato: falar com a associação é o último
 * passo natural de quem chegou ao fim da Home, e não um destino separado
 * que exige uma navegação a mais. O id `contato` é o destino de todos os
 * links de contato do site.
 */
export function ContactSection({ locale }: { locale: Locale }) {
  const t = useTranslations('contact')

  return (
    <Section id="contato" surface="light" ariaLabelledby="home-contact-title">
      <Container className="flex flex-col gap-stack">
        <SectionHeader
          id="home-contact-title"
          eyebrow={t('hero.eyebrow')}
          title={t('hero.title')}
          description={t('hero.lead')}
        />

        <div className="flex flex-col gap-16 lg:grid lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-7">
            <h3 className="mb-10 text-micro font-semibold uppercase tracking-[0.16em] text-(--fg-subtle)">
              {t('form.title')}
            </h3>
            <ContactForm />
          </div>

          <aside className="flex flex-col gap-8 lg:col-span-4 lg:col-start-9">
            <h3 className="text-micro font-semibold uppercase tracking-[0.16em] text-(--fg-subtle)">
              {t('info.eyebrow')}
            </h3>

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
  )
}
