import type { ReactNode } from 'react'
import { PageTransition } from '@/components/motion/page-transition'

/**
 * Remonta a cada navegação: dá continuidade visual entre páginas sem
 * atrasar nem bloquear a rota.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}
