import type { MetadataRoute } from 'next'
import { news } from '@/content/news'
import { projects } from '@/content/projects'
import { locales, type Locale } from '@/i18n/routing'
import { absoluteUrl, localizedPath, type PageHref } from '@/lib/seo'

const staticRoutes: { href: PageHref; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }[] = [
  { href: '/', priority: 1, changeFrequency: 'weekly' },
  { href: '/projects', priority: 0.9, changeFrequency: 'monthly' },
  { href: '/news', priority: 0.7, changeFrequency: 'weekly' },
  { href: '/transparency', priority: 0.7, changeFrequency: 'monthly' },
  { href: '/partners', priority: 0.6, changeFrequency: 'monthly' },
  { href: '/donate', priority: 0.8, changeFrequency: 'monthly' },
]

function languagesFor(href: PageHref) {
  return Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(localizedPath(locale, href))]),
  ) as Record<Locale, string>
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const route of staticRoutes) {
    for (const locale of locales) {
      entries.push({
        url: absoluteUrl(localizedPath(locale, route.href)),
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: { languages: languagesFor(route.href) },
      })
    }
  }

  for (const project of projects) {
    const href: PageHref = {
      pathname: '/projects/[slug]',
      params: { slug: project.slug },
    }
    for (const locale of locales) {
      entries.push({
        url: absoluteUrl(localizedPath(locale, href)),
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages: languagesFor(href) },
      })
    }
  }

  for (const article of news) {
    const href: PageHref = {
      pathname: '/news/[slug]',
      params: { slug: article.slug },
    }
    for (const locale of locales) {
      entries.push({
        url: absoluteUrl(localizedPath(locale, href)),
        lastModified: new Date(article.updatedAt ?? article.date),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: { languages: languagesFor(href) },
      })
    }
  }

  return entries
}
