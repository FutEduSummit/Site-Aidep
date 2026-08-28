'use client'

import { motion, useMotionValue, useSpring } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { usePointerFine, useReducedMotionSafe } from '@/hooks/use-media'
import { cn } from '@/lib/utils'

type MagneticProps = {
  children: ReactNode
  className?: string
  /** Deslocamento máximo, em px. Mantido curto para não parecer truque. */
  strength?: number
}

/**
 * Botão magnético.
 *
 * O movimento é escrito diretamente em motion values — nenhum estado do
 * React é atualizado a cada movimento do ponteiro, portanto não há
 * re-render. O efeito só existe em dispositivos com ponteiro preciso.
 */
export function MagneticButton({
  children,
  className,
  strength = 10,
}: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const fine = usePointerFine()
  const reduced = useReducedMotionSafe()
  const enabled = fine && !reduced

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 20, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 260, damping: 20, mass: 0.4 })

  function handleMove(event: React.PointerEvent<HTMLSpanElement>) {
    if (!enabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const relX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const relY = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    x.set(Math.max(-1, Math.min(1, relX)) * strength)
    y.set(Math.max(-1, Math.min(1, relY)) * strength * 0.6)
  }

  function reset() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span
      ref={ref}
      className={cn('inline-block', className)}
      style={enabled ? { x: springX, y: springY } : undefined}
      onPointerMove={enabled ? handleMove : undefined}
      onPointerLeave={enabled ? reset : undefined}
      onBlur={enabled ? reset : undefined}
    >
      {children}
    </motion.span>
  )
}

type TiltProps = {
  children: ReactNode
  className?: string
  /** Inclinação máxima, em graus. Limitada a 4° por padrão. */
  max?: number
}

/** Inclinação discreta de cartões, apenas com ponteiro preciso. */
export function Tilt({ children, className, max = 4 }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null)
  const fine = usePointerFine()
  const reduced = useReducedMotionSafe()
  const enabled = fine && !reduced

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springX = useSpring(rotateX, { stiffness: 180, damping: 22, mass: 0.4 })
  const springY = useSpring(rotateY, { stiffness: 180, damping: 22, mass: 0.4 })

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!enabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    rotateY.set(px * max * 2)
    rotateX.set(-py * max * 2)
  }

  function reset() {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      data-motion="tilt"
      className={cn(className)}
      style={
        enabled
          ? {
              rotateX: springX,
              rotateY: springY,
              transformPerspective: 1200,
              transformStyle: 'preserve-3d',
            }
          : undefined
      }
      onPointerMove={enabled ? handleMove : undefined}
      onPointerLeave={enabled ? reset : undefined}
    >
      {children}
    </motion.div>
  )
}
