'use client'

import { useCallback, useRef, type ReactNode } from 'react'
import { usePointerFine, useReducedMotionSafe } from '@/hooks/use-media'
import { cn } from '@/lib/utils'

type SpotlightCardProps = {
  children: ReactNode
  className?: string
  /** Elemento renderizado — mantém a semântica correta de cada uso. */
  as?: 'div' | 'article' | 'li'
}

/**
 * Cartão com foco de luz seguindo o ponteiro.
 *
 * A posição é escrita em variáveis CSS dentro de um requestAnimationFrame:
 * o React não re-renderiza a cada movimento do mouse. Desligado em
 * dispositivos de toque e com movimento reduzido.
 */
export function SpotlightCard({
  children,
  className,
  as: Tag = 'div',
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef<number | null>(null)
  const fine = usePointerFine()
  const reduced = useReducedMotionSafe()
  const enabled = fine && !reduced

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!enabled) return
      const node = ref.current
      if (!node) return

      const { clientX, clientY } = event
      if (frame.current !== null) cancelAnimationFrame(frame.current)

      frame.current = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect()
        node.style.setProperty('--spot-x', `${clientX - rect.left}px`)
        node.style.setProperty('--spot-y', `${clientY - rect.top}px`)
        node.style.setProperty('--spot-opacity', '1')
        frame.current = null
      })
    },
    [enabled],
  )

  const handleLeave = useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current)
      frame.current = null
    }
    ref.current?.style.setProperty('--spot-opacity', '0')
  }, [])

  return (
    <Tag
      ref={ref as never}
      data-motion="spotlight"
      className={cn('group/spot relative isolate', className)}
      onPointerMove={enabled ? handleMove : undefined}
      onPointerLeave={enabled ? handleLeave : undefined}
    >
      {enabled ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[var(--spot-opacity,0)] transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(280px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in srgb, var(--accent) 14%, transparent), transparent 70%)',
          }}
        />
      ) : null}
      {children}
    </Tag>
  )
}
