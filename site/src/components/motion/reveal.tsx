'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { DISTANCE, DURATION, VIEWPORT, transition } from '@/lib/motion'
import { cn } from '@/lib/utils'

const tags = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  aside: motion.aside,
  header: motion.header,
  figure: motion.figure,
  li: motion.li,
  p: motion.p,
  span: motion.span,
} as const

export type RevealTag = keyof typeof tags

type RevealProps = {
  children: ReactNode
  as?: RevealTag
  className?: string
  /** Deslocamento vertical inicial, em px. */
  distance?: number
  delay?: number
  duration?: number
  /** Anima uma única vez (padrão) ou sempre que entrar na viewport. */
  once?: boolean
  amount?: number
}

/**
 * Bloco que entra ao aparecer na viewport: opacidade + deslocamento
 * vertical, sempre com a curva do projeto e, por padrão, uma única vez.
 */
export function Reveal({
  children,
  as = 'div',
  className,
  distance = DISTANCE.md,
  delay = 0,
  duration = DURATION.base,
  once = true,
  amount = VIEWPORT.amount,
}: RevealProps) {
  const Tag = tags[as] as typeof motion.div

  return (
    <Tag
      className={cn(className)}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount, margin: VIEWPORT.margin }}
      transition={transition(duration, delay)}
    >
      {children}
    </Tag>
  )
}
