'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { EASE } from '@/lib/motion'

/**
 * Transição de entrada de página.
 *
 * Usada em `template.tsx`, portanto remonta a cada navegação. É curta
 * (0,42 s), não bloqueia o clique, não segura a rota e não cria overlay —
 * apenas dá continuidade visual entre uma página e outra.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
