import type { StaticPathname } from '@/i18n/routing'

export type NavItem = {
  href: StaticPathname
  /** Chave em `nav` das mensagens. */
  key: string
}

/**
 * Navegação principal — mesma ordem no desktop, no mobile e no rodapé.
 *
 * A Página inicial reúne a apresentação da associação, o público atendido,
 * o impacto e o contato: o que antes eram páginas separadas hoje são seções
 * da Home, e a navegação lista apenas destinos que são página de verdade.
 */
export const primaryNav: NavItem[] = [
  { href: '/', key: 'home' },
  { href: '/projects', key: 'projects' },
  { href: '/news', key: 'news' },
  { href: '/transparency', key: 'transparency' },
  { href: '/partners', key: 'partners' },
  { href: '/donate', key: 'donate' },
]

export const footerInstitutional: NavItem[] = [
  { href: '/transparency', key: 'transparency' },
  { href: '/partners', key: 'partners' },
  { href: '/donate', key: 'donate' },
]

/**
 * Seções da Página inicial que a navegação aponta diretamente.
 * O `id` corresponde ao id da seção em `app/[locale]/page.tsx`.
 */
export type HomeSection = { id: string; key: string }

export const homeSections: HomeSection[] = [
  { id: 'a-aidep', key: 'aboutSection' },
  { id: 'publico-atendido', key: 'audienceSection' },
  { id: 'impacto', key: 'impactSection' },
  { id: 'contato', key: 'contactSection' },
]

/**
 * Uma rota está ativa quando é exatamente a atual ou quando a atual é uma
 * página filha dela (`/projects` fica ativo em `/projects/futedu-summit`).
 * A raiz nunca casa por prefixo, senão ficaria sempre ativa.
 */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
