'use client'

import { animate, useInView } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useReducedMotionSafe } from '@/hooks/use-media'
import { DURATION, EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

type AnimatedCounterProps = {
  value: number
  locale: string
  /** Prefixo preservado, ex.: "+" */
  prefix?: string
  /** Sufixo preservado, ex.: "mil" */
  suffix?: string
  className?: string
  suffixClassName?: string
  duration?: number
}

/**
 * Contador que anima ao entrar na viewport.
 *
 * O valor final já é renderizado no HTML — leitores de tela, buscadores e
 * usuários sem JavaScript veem sempre o número correto. A contagem apenas
 * substitui o texto durante a animação.
 */
export function AnimatedCounter({
  value,
  locale,
  prefix,
  suffix,
  className,
  suffixClassName,
  duration = 1.6,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduced = useReducedMotionSafe()

  const formatter = new Intl.NumberFormat(locale)
  const final = formatter.format(value)

  useEffect(() => {
    const node = ref.current
    if (!node || !inView || reduced) return

    const controls = animate(0, value, {
      duration: Math.min(duration, DURATION.slow * 2.2),
      ease: EASE,
      onUpdate: (latest) => {
        node.textContent = formatter.format(Math.round(latest))
      },
      onComplete: () => {
        node.textContent = final
      },
    })

    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, value, duration, locale])

  return (
    <span className={cn('inline-flex items-baseline gap-[0.15em]', className)}>
      {prefix ? <span>{prefix}</span> : null}
      <span ref={ref} className="tabular-nums">
        {final}
      </span>
      {suffix ? <span className={cn(suffixClassName)}>{suffix}</span> : null}
    </span>
  )
}
