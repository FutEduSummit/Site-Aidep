'use client'

import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { usePointerFine, useReducedMotionSafe } from '@/hooks/use-media'
import { EASE } from '@/lib/motion'

/**
 * Cursor contextual.
 *
 * Fica invisível o tempo todo e só aparece sobre elementos que declaram
 * `data-cursor-label` — os cartões de projeto e as chamadas editoriais.
 * A posição é escrita em motion values (sem re-render); o estado só muda
 * quando o ponteiro entra ou sai de um alvo.
 *
 * Nunca é montado em dispositivos de toque nem com movimento reduzido.
 */
export function CursorInteraction() {
  const fine = usePointerFine()
  const reduced = useReducedMotionSafe()
  const enabled = fine && !reduced

  const [label, setLabel] = useState<string | null>(null)

  const x = useMotionValue(-200)
  const y = useMotionValue(-200)
  const springX = useSpring(x, { stiffness: 420, damping: 34, mass: 0.5 })
  const springY = useSpring(y, { stiffness: 420, damping: 34, mass: 0.5 })

  useEffect(() => {
    if (!enabled) return

    function onMove(event: PointerEvent) {
      x.set(event.clientX)
      y.set(event.clientY)

      const target = event.target
      const next =
        target instanceof Element
          ? (target.closest('[data-cursor-label]') as HTMLElement | null)
          : null

      setLabel((current) => {
        const value = next?.dataset.cursorLabel ?? null
        return current === value ? current : value
      })
    }

    function onLeave() {
      setLabel(null)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[95] hidden lg:block"
      style={{ x: springX, y: springY }}
    >
      <AnimatePresence>
        {label ? (
          <motion.span
            key="cursor"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-500 text-center text-[0.6875rem] font-semibold uppercase leading-tight tracking-[0.12em] text-ink-950"
          >
            {label}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
