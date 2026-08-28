'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { DURATION, VIEWPORT, transition } from '@/lib/motion'
import { cn } from '@/lib/utils'

type Direction = 'up' | 'down' | 'left' | 'right'

const clipFrom: Record<Direction, string> = {
  up: 'inset(0% 0% 100% 0%)',
  down: 'inset(100% 0% 0% 0%)',
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
}

type ImageRevealProps = {
  children: ReactNode
  className?: string
  direction?: Direction
  delay?: number
  duration?: number
  /** Escala inicial do conteúdo interno — 1.08 → 1, como no Hero. */
  scaleFrom?: number
  animateOnMount?: boolean
}

/**
 * Revela a imagem por máscara (clip-path) enquanto o conteúdo interno
 * reduz de escala. A moldura não se move: quem se acomoda é a imagem.
 */
export function ImageReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = DURATION.slow,
  scaleFrom = 1.08,
  animateOnMount = false,
}: ImageRevealProps) {
  const orchestration = animateOnMount
    ? ({ initial: 'hidden', animate: 'visible' } as const)
    : ({
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, amount: 0.2, margin: VIEWPORT.margin },
      } as const)

  return (
    /* A máscara NÃO pode ficar neste elemento — o que carrega o gatilho.
       `clip-path` entra na conta da área que o IntersectionObserver mede, e
       o estado escondido recorta a moldura a zero: o observador passa a ver
       `intersectionRatio: 0` (mesmo com o elemento em cena), `amount` nunca
       é alcançado e a revelação que tiraria a máscara nunca dispara — a
       imagem fica invisível para sempre. Por isso o gatilho mora aqui, sem
       recorte, e a máscara desce uma camada por propagação de variantes. */
    <motion.div className={cn('relative', className)} {...orchestration}>
      <motion.div
        className="overflow-hidden"
        variants={{
          hidden: { clipPath: clipFrom[direction] },
          visible: {
            clipPath: 'inset(0% 0% 0% 0%)',
            transition: transition(duration, delay),
          },
        }}
      >
        <motion.div
          className="h-full w-full"
          variants={{
            hidden: { scale: scaleFrom },
            visible: { scale: 1, transition: transition(duration + 0.2, delay) },
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
