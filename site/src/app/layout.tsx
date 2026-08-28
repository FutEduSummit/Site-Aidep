import type { ReactNode } from 'react'

/**
 * Layout raiz transparente.
 * A marcação <html> e <body> é definida em `app/[locale]/layout.tsx`,
 * onde o idioma da página já é conhecido.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
