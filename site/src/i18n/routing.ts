import { defineRouting } from 'next-intl/routing'

export const locales = ['pt', 'en', 'es'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'pt'

/**
 * Rotas do site.
 *
 * A chave é o caminho interno (usado no código e na estrutura de pastas de
 * `app/[locale]`). O valor é o caminho público por idioma — assim cada
 * idioma tem URLs amigáveis e o seletor de idiomas consegue manter o
 * usuário exatamente na mesma página ao trocar de idioma.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/projects': { pt: '/projetos', en: '/projects', es: '/proyectos' },
    '/projects/[slug]': {
      pt: '/projetos/[slug]',
      en: '/projects/[slug]',
      es: '/proyectos/[slug]',
    },
    '/news': { pt: '/noticias', en: '/news', es: '/noticias' },
    '/news/[slug]': {
      pt: '/noticias/[slug]',
      en: '/news/[slug]',
      es: '/noticias/[slug]',
    },
    '/transparency': {
      pt: '/transparencia',
      en: '/transparency',
      es: '/transparencia',
    },
    '/partners': { pt: '/parceiros', en: '/partners', es: '/socios' },
    '/donate': { pt: '/doacoes', en: '/donate', es: '/donaciones' },
  },
})

export type AppPathname = keyof typeof routing.pathnames

/** Rotas sem parâmetros dinâmicos — as que podem ser linkadas diretamente. */
export type StaticPathname = Exclude<
  AppPathname,
  `${string}[${string}]${string}`
>
