'use client'

import { MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import { DURATION, EASE } from '@/lib/motion'

/**
 * Configuração global do movimento.
 *
 * `reducedMotion="user"` faz o Motion respeitar automaticamente
 * prefers-reduced-motion: animações de transform e layout são suprimidas e
 * apenas a opacidade continua animando — exatamente o comportamento pedido
 * (substituir movimento por fades rápidos, sem esconder conteúdo).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: DURATION.base, ease: EASE }}
    >
      {children}
    </MotionConfig>
  )
}
