import Image from 'next/image'
import { AtSign, Mail, MapPin } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { GrowLine } from '@/components/motion/grow-line'
import { Container, Section } from '@/components/ui/section'
import { site } from '@/content/site'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getLockup, symbolMark } from '@/lib/brand'
import { footerInstitutional, homeSections, primaryNav } from '@/lib/nav'

export function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const tContact = useTranslations('contact.info')
  const locale = useLocale() as Locale
  const lockup = getLockup(locale, 'verticalWhite')
  const year = new Date().getFullYear()

  return (
    /* O grafismo decorativo abaixo sangra 20% da altura do rodapé. Sem o
       corte no eixo Y ele estica a rolagem do documento e sobra uma faixa
       branca do body depois do rodapé. */
    <Section
      as="footer"
      surface="dark"
      space="none"
      className="overflow-y-clip pt-section-sm"
    >
      <Image
        src={symbolMark.white.src}
        alt=""
        aria-hidden="true"
        width={symbolMark.white.width}
        height={symbolMark.white.height}
        sizes="(max-width: 768px) 90vw, 40vw"
        className="pointer-events-none absolute -bottom-[18%] -right-[8%] -z-10 h-[120%] w-auto max-w-none object-contain opacity-[0.045]"
      />

      <Container className="flex flex-col gap-stack">
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-8 lg:col-span-4">
            <Link href="/" className="inline-flex">
              <Image
                src={lockup.src}
                alt={site.legalName[locale]}
                width={lockup.width}
                height={lockup.height}
                sizes="200px"
                className="h-32 w-auto"
              />
            </Link>
            <p className="max-w-[34ch] text-body text-(--fg-muted)">
              {t('tagline')}
            </p>
          </div>

          <nav
            aria-label={tNav('footerLabel')}
            className="flex flex-col gap-5 lg:col-span-2 lg:col-start-6"
          >
            <h2 className="text-micro font-semibold uppercase tracking-[0.18em] text-(--fg-subtle)">
              {t('sitemap')}
            </h2>
            <ul className="flex flex-col gap-3">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="link-underline text-small text-(--fg-muted) transition-colors duration-200 ease-brand hover:text-(--fg)"
                  >
                    {tNav(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-5 lg:col-span-2">
            <h2 className="text-micro font-semibold uppercase tracking-[0.18em] text-(--fg-subtle)">
              {t('institutional')}
            </h2>
            <ul className="flex flex-col gap-3">
              {footerInstitutional.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="link-underline text-small text-(--fg-muted) transition-colors duration-200 ease-brand hover:text-(--fg)"
                  >
                    {tNav(item.key)}
                  </Link>
                </li>
              ))}
              {/* Seções da Página inicial: um link direto poupa o visitante
                  de abrir a Home e procurar. */}
              {homeSections.map((section) => (
                <li key={section.id}>
                  <Link
                    href={{ pathname: '/', hash: section.id }}
                    className="link-underline text-small text-(--fg-muted) transition-colors duration-200 ease-brand hover:text-(--fg)"
                  >
                    {tNav(section.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-3">
            <h2 className="text-micro font-semibold uppercase tracking-[0.18em] text-(--fg-subtle)">
              {t('contactTitle')}
            </h2>
            <ul className="flex flex-col gap-4 text-small text-(--fg-muted)">
              <li>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="link-underline inline-flex items-center gap-3 transition-colors duration-200 ease-brand hover:text-(--fg)"
                >
                  <Mail aria-hidden="true" className="size-4 shrink-0" />
                  <span>{site.contact.email}</span>
                </a>
              </li>
              <li className="inline-flex items-center gap-3">
                <MapPin aria-hidden="true" className="size-4 shrink-0" />
                <span>
                  {site.contact.city} — {site.contact.region},{' '}
                  {site.contact.country[locale]}
                </span>
              </li>
              <li>
                <a
                  href={site.social.instagram.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline inline-flex items-center gap-3 transition-colors duration-200 ease-brand hover:text-(--fg)"
                >
                  <AtSign aria-hidden="true" className="size-4 shrink-0" />
                  <span>{site.social.instagram.handle}</span>
                </a>
              </li>
            </ul>
            <p className="max-w-[32ch] text-micro leading-relaxed tracking-[0.04em] text-(--fg-subtle)">
              {tContact('pending')}: {t('pendingData')}
            </p>
          </div>
        </div>

        <GrowLine />

        <div className="flex flex-col gap-4 pb-10 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[52ch] text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
            {t('legalName')}
          </p>
          <p className="text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
            © {year} {site.shortName}. {t('rights')}
          </p>
        </div>
      </Container>
    </Section>
  )
}
