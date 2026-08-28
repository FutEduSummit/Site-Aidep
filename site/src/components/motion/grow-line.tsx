'use client'

import { motion } from 'motion/react'
import { DURATION, VIEWPORT, transition } from '@/lib/motion'
import { cn } from '@/lib/utils'

/**
 * Régua institucional: cresce da esquerda para a direita ao entrar na
 * viewport. É o divisor padrão entre blocos e seções.
 */
export function GrowLine({
  className,
  delay = 0,
  duration = DURATION.slow,
  origin = 'left',
}: {
  className?: string
  delay?: number
  duration?: number
  origin?: 'left' | 'right' | 'center'
}) {
  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        'h-px w-full bg-[var(--rule)]',
        origin === 'left' && 'origin-left',
        origin === 'right' && 'origin-right',
        origin === 'center' && 'origin-center',
        className,
      )}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.6, margin: VIEWPORT.margin }}
      transition={transition(duration, delay)}
    />
  )
}
