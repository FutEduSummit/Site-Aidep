import type { Metadata } from 'next'
import { getPathname } from '@/i18n/navigation'
import { locales, type Locale } from '@/i18n/routing'
import { site } from '@/content/site'
import { getLockup, getOgImage } from '@/lib/brand'

export type PageHref = Parameters<typeof getPathname>[0]['href']

export function absoluteUrl(path: string) {
  return new URL(path, site.url).toString()
}

export function localizedPath(locale: Locale, href: PageHref) {
  return getPathname({ locale, href })
}

/** hreflang completo: um link por idioma + x-default apontando para o português. */
export function buildLanguageAlternates(href: PageHref) {
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(localizedPath(locale, href))]),
  ) as Record<Locale | 'x-default', string>

  languages['x-default'] = absoluteUrl(localizedPath('pt', href))
  return languages
}

type PageMetadataInput = {
  locale: Locale
  href: PageHref
  title: string
  description: string
  /** Passe `false` para páginas que não devem ser indexadas. */
  index?: boolean
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
}

export function buildPageMetadata({
  locale,
  href,
  title,
  description,
  index = true,
  type = 'website',
  publishedTime,
  modifiedTime,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(localizedPath(locale, href))
  const og = getOgImage(locale)

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: buildLanguageAlternates(href),
    },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      type,
      url: canonical,
      title,
      description,
      siteName: site.shortName,
      locale: openGraphLocale(locale),
      alternateLocale: locales
        .filter((item) => item !== locale)
        .map(openGraphLocale),
      images: [{ url: og.url, width: og.width, height: og.height, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [og.url],
    },
  }
}

export function openGraphLocale(locale: Locale) {
  return { pt: 'pt_BR', en: 'en_US', es: 'es_ES' }[locale]
}

/* ------------------------------------------------------------------ */
/* Dados estruturados                                                 */
/* ------------------------------------------------------------------ */

export function organizationJsonLd(locale: Locale) {
  const logo = getLockup(locale, 'verticalColor')

  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    '@id': `${site.url}#organization`,
    name: site.shortName,
    alternateName: site.legalName[locale],
    legalName: site.legalName[locale],
    description: site.positioning[locale],
    url: absoluteUrl(localizedPath(locale, '/')),
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(logo.src),
      width: logo.width,
      height: logo.height,
    },
    image: absoluteUrl(getOgImage(locale).url),
    email: site.contact.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.contact.city,
      addressRegion: site.contact.region,
      addressCountry: site.contact.countryCode,
    },
    areaServed: {
      '@type': 'Country',
      name: site.contact.country[locale],
    },
    sameAs: [site.social.instagram.url],
    knowsLanguage: ['pt-BR', 'en', 'es'],
  }
}

export function websiteJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}#website`,
    name: site.shortName,
    url: absoluteUrl(localizedPath(locale, '/')),
    inLanguage: locale,
    publisher: { '@id': `${site.url}#organization` },
  }
}

export function articleJsonLd(input: {
  locale: Locale
  url: string
  headline: string
  description: string
  datePublished: string
  dateModified?: string
  author?: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: input.locale,
    mainEntityOfPage: input.url,
    ...(input.image ? { image: [absoluteUrl(input.image)] } : {}),
    author: input.author
      ? { '@type': 'Person', name: input.author }
      : { '@id': `${site.url}#organization` },
    publisher: { '@id': `${site.url}#organization` },
  }
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
