'use client'

import { motion } from 'motion/react'
import type { ElementType } from 'react'
import { DURATION, STAGGER, VIEWPORT, transition } from '@/lib/motion'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* SplitTextReveal — títulos que entram linha a linha, por máscara      */
/* ------------------------------------------------------------------ */

type SplitTextRevealProps = {
  /** Cada item é uma linha do título. A quebra é intencional, não automática. */
  lines: string[]
  as?: ElementType
  className?: string
  lineClassName?: string
  delay?: number
  stagger?: number
  duration?: number
  /** `true` inicia assim que monta (Hero); `false` espera entrar na viewport. */
  animateOnMount?: boolean
}

export function SplitTextReveal({
  lines,
  as: Tag = 'h2',
  className,
  lineClassName,
  delay = 0,
  stagger = STAGGER.loose,
  duration = DURATION.slow,
  animateOnMount = false,
}: SplitTextRevealProps) {
  const orchestration = animateOnMount
    ? ({ initial: 'hidden', animate: 'visible' } as const)
    : ({
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, amount: 0.4, margin: VIEWPORT.margin },
      } as const)

  return (
    <Tag className={cn(className)}>
      <motion.span
        className="block"
        {...orchestration}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
        }}
      >
        {lines.map((line, index) => (
          <span
            key={`${line}-${index}`}
            className={cn('block overflow-hidden pb-[0.06em]', lineClassName)}
          >
            <motion.span
              className="block"
              variants={{
                hidden: { y: '110%' },
                visible: { y: '0%', transition: transition(duration) },
              }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}

/* ------------------------------------------------------------------ */
/* MaskedWords — títulos que sobem por máscara, palavra a palavra       */
/* ------------------------------------------------------------------ */

type MaskedWordsProps = {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  stagger?: number
  duration?: number
  animateOnMount?: boolean
  id?: string
}

/**
 * Alternativa ao SplitTextReveal para títulos cuja quebra de linha depende
 * da largura da tela: cada palavra sobe por trás de uma máscara, em
 * cascata. O recorte reserva espaço para descidas (g, p, ç).
 */
export function MaskedWords({
  text,
  as: Tag = 'h2',
  className,
  delay = 0,
  stagger = 0.045,
  duration = DURATION.slow,
  animateOnMount = false,
  id,
}: MaskedWordsProps) {
  const words = text.split(' ')

  const orchestration = animateOnMount
    ? ({ initial: 'hidden', animate: 'visible' } as const)
    : ({
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, amount: 0.35, margin: VIEWPORT.margin },
      } as const)

  return (
    <Tag className={cn(className)} id={id}>
      <motion.span
        {...orchestration}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
        }}
      >
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="-mb-[0.16em] inline-block overflow-hidden pb-[0.16em] align-bottom"
          >
            <motion.span
              className="inline-block whitespace-pre"
              variants={{
                hidden: { y: '110%' },
                visible: { y: '0%', transition: transition(duration) },
              }}
            >
              {word}
              {index < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}

/* ------------------------------------------------------------------ */
/* AnimatedText — parágrafos e frases, palavra a palavra                */
/* ------------------------------------------------------------------ */

type AnimatedTextProps = {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  stagger?: number
  animateOnMount?: boolean
}

export function AnimatedText({
  text,
  as: Tag = 'p',
  className,
  delay = 0,
  stagger = 0.02,
  animateOnMount = false,
}: AnimatedTextProps) {
  const words = text.split(' ')

  const orchestration = animateOnMount
    ? ({ initial: 'hidden', animate: 'visible' } as const)
    : ({
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, amount: 0.3, margin: VIEWPORT.margin },
      } as const)

  return (
    <Tag className={cn(className)}>
      <motion.span
        {...orchestration}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
        }}
      >
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            className="inline-block whitespace-pre"
            variants={{
              hidden: { opacity: 0, y: '0.4em' },
              visible: { opacity: 1, y: '0em', transition: transition(DURATION.fast) },
            }}
          >
            {word}
            {index < words.length - 1 ? ' ' : ''}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  )
}
