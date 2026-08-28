import type { StaticPathname } from '@/i18n/routing'

export type NavItem = {
  href: StaticPathname
  /** Chave em `nav` das mensagens. */
  key: string
}

/** Navegação principal — mesma ordem no desktop, no mobile e no rodapé. */
export const primaryNav: NavItem[] = [
  { href: '/about', key: 'about' },
  { href: '/projects', key: 'projects' },
  { href: '/impact', key: 'impact' },
  { href: '/news', key: 'news' },
  { href: '/transparency', key: 'transparency' },
  { href: '/partners', key: 'partners' },
  { href: '/contact', key: 'contact' },
]

export const footerInstitutional: NavItem[] = [
  { href: '/about', key: 'about' },
  { href: '/transparency', key: 'transparency' },
  { href: '/partners', key: 'partners' },
  { href: '/donate', key: 'donate' },
]

export const ctaNav: NavItem = { href: '/donate', key: 'donate' }
