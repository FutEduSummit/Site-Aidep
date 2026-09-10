'use client'

import { Mail, MapPin, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { SectionHeader } from '@/components/ui/section-header'
import { InstagramIcon } from '@/components/ui/instagram-icon'
import { Container, Section } from '@/components/ui/section'
import { site } from '@/content/site'
import type { Locale } from '@/i18n/routing'
import type { ReactNode } from 'react'

/**
 * CONTATO — fim da página inicial.
 *
 * Não existe mais página de Contato: falar com a associação é o último
 * passo natural de quem chegou ao fim da Home, e não um destino separado
 * que exige uma navegação a mais. O id `contato` é o destino de todos os
 * links de contato do site.
 *
 * Não há formulário. Os canais são os próprios da associação — o e-mail,
 * o telefone, o endereço e o Instagram —, e cada um abre no aplicativo de
 * quem está lendo. Um formulário aqui só acrescentaria um intermediário
 * entre a pessoa e a caixa de entrada que ela já sabe usar.
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

        <div className="flex flex-col gap-8">
          <h3 className="text-micro font-semibold uppercase tracking-[0.16em] text-(--fg-subtle)">
            {t('info.eyebrow')}
          </h3>

          {/* Quatro canais lado a lado. No celular eles empilham; a partir
              de `md` ficam dois a dois, e só em tela larga os quatro
              dividem a linha.

              As colunas não são iguais de propósito: o e-mail é o dado
              mais longo da linha e fica com a fatia maior, o telefone e o
              Instagram são curtos e cedem parte da deles. Em quatro
              colunas iguais o e-mail não cabia e quebrava no meio da
              palavra. */}
          <dl className="grid grid-cols-1 gap-x-8 md:grid-cols-2 xl:grid-cols-[1.35fr_0.8fr_1.05fr_0.8fr]">
            <Canal icone={<Mail aria-hidden="true" className="size-4" />} rotulo={t('info.email')}>
              <a
                href={`mailto:${site.contact.email}`}
                className="link-underline text-h4 font-semibold tracking-[-0.02em]"
              >
                {site.contact.email}
              </a>
            </Canal>

            <Canal icone={<Phone aria-hidden="true" className="size-4" />} rotulo={t('info.phone')}>
              {site.contact.phone ? (
                <a
                  href={telHref(site.contact.phone)}
                  className="link-underline text-h4 font-semibold tracking-[-0.02em]"
                >
                  {site.contact.phone}
                </a>
              ) : (
                <span className="text-body text-(--fg-muted)">
                  {t('info.pending')}
                </span>
              )}
            </Canal>

            <Canal icone={<MapPin aria-hidden="true" className="size-4" />} rotulo={t('info.address')}>
              <span className="text-h4 font-semibold tracking-[-0.02em]">
                {site.contact.city}, {site.contact.region},{' '}
                {site.contact.country[locale]}
              </span>
            </Canal>

            <Canal icone={<InstagramIcon className="size-4" />} rotulo={t('info.social')}>
              <a
                href={site.social.instagram.url}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline text-h4 font-semibold tracking-[-0.02em]"
              >
                {site.social.instagram.handle}
              </a>
            </Canal>
          </dl>
        </div>
      </Container>
    </Section>
  )
}

/**
 * O `tel:` de um número escrito no formato brasileiro. O link precisa do
 * código do país para ser discado de fora do Brasil — o site é lido em três
 * idiomas —, então ele entra aqui quando o número não o traz.
 */
function telHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '')
  return `tel:${digits.startsWith('+') ? digits : `+55${digits}`}`
}

/** Um canal: o filete em cima, o rótulo pequeno e o dado em destaque. */
function Canal({
  icone,
  rotulo,
  children,
}: {
  icone: ReactNode
  rotulo: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-(--border) py-6">
      <dt className="flex items-center gap-3 text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-subtle)">
        {icone}
        {rotulo}
      </dt>
      <dd className="[overflow-wrap:anywhere]">{children}</dd>
    </div>
  )
}
