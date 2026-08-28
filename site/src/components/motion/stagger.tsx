'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { DISTANCE, DURATION, STAGGER, VIEWPORT, transition } from '@/lib/motion'
import { cn } from '@/lib/utils'

const containerTags = {
  div: motion.div,
  ul: motion.ul,
  ol: motion.ol,
  section: motion.section,
  dl: motion.dl,
} as const

const itemTags = {
  div: motion.div,
  li: motion.li,
  article: motion.article,
  figure: motion.figure,
  p: motion.p,
  span: motion.span,
  dt: motion.dt,
  dd: motion.dd,
} as const

type ContainerProps = {
  children: ReactNode
  as?: keyof typeof containerTags
  className?: string
  stagger?: number
  delayChildren?: number
  once?: boolean
  amount?: number
}

/** Orquestra a entrada dos filhos em cascata. Use com `StaggerItem`. */
export function StaggerContainer({
  children,
  as = 'div',
  className,
  stagger = STAGGER.base,
  delayChildren = 0,
  once = true,
  amount = 0.15,
}: ContainerProps) {
  const Tag = containerTags[as] as typeof motion.div

  return (
    <Tag
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: VIEWPORT.margin }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren } },
      }}
    >
      {children}
    </Tag>
  )
}

type ItemProps = {
  children: ReactNode
  as?: keyof typeof itemTags
  className?: string
  distance?: number
  duration?: number
}

export function StaggerItem({
  children,
  as = 'div',
  className,
  distance = DISTANCE.sm,
  duration = DURATION.base,
}: ItemProps) {
  const Tag = itemTags[as] as typeof motion.div

  return (
    <Tag
      className={cn(className)}
      variants={{
        hidden: { opacity: 0, y: distance },
        visible: { opacity: 1, y: 0, transition: transition(duration) },
      }}
    >
      {children}
    </Tag>
  )
}
