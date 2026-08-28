'use client'

import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { useReducedMotionSafe } from '@/hooks/use-media'
import { cn } from '@/lib/utils'

type ParallaxProps = {
  children: ReactNode
  className?: string
  /** Amplitude total do deslocamento, em px. Mantida discreta por padrão. */
  distance?: number
  /** Direção do deslocamento em relação ao scroll. */
  direction?: 'up' | 'down'
  /** Escala aplicada ao longo do progresso — usada em fundos e grafismos. */
  scaleRange?: [number, number]
  as?: 'div' | 'figure' | 'span'
}

/**
 * Parallax vinculado ao progresso do elemento na viewport.
 * Desligado por completo quando o usuário pede menos movimento.
 */
export function Parallax({
  children,
  className,
  distance = 60,
  direction = 'up',
  scaleRange,
  as = 'div',
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotionSafe()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.3,
  })

  const sign = direction === 'up' ? -1 : 1
  const y = useTransform(smooth, [0, 1], [(-sign * distance) / 2, (sign * distance) / 2])
  const scale = useTransform(smooth, [0, 1], scaleRange ?? [1, 1])

  const Tag = (
    as === 'figure' ? motion.figure : as === 'span' ? motion.span : motion.div
  ) as typeof motion.div

  return (
    <Tag
      ref={ref}
      data-motion="parallax"
      className={cn(className)}
      style={reduced ? undefined : { y, scale }}
    >
      {children}
    </Tag>
  )
}

type ParallaxImageProps = {
  children: ReactNode
  className?: string
  innerClassName?: string
  distance?: number
  /** Zoom sutil acompanhando o scroll. */
  zoom?: [number, number]
}

/**
 * Moldura fixa com imagem que se desloca por dentro — o recorte permanece
 * estável e apenas o conteúdo respira. Nunca deforma a imagem.
 */
export function ParallaxImage({
  children,
  className,
  innerClassName,
  distance = 80,
  zoom = [1.06, 1],
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotionSafe()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.3,
  })

  const y = useTransform(smooth, [0, 1], [-distance / 2, distance / 2])
  const scale = useTransform(smooth, [0, 1], zoom)

  /* A camada interna é maior que a moldura na exata medida do
     deslocamento — assim nunca aparece uma faixa vazia nas bordas. */
  const cover = {
    top: -distance / 2,
    bottom: -distance / 2,
  }

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div
        data-motion="parallax"
        className={cn('absolute inset-x-0', innerClassName)}
        style={reduced ? cover : { ...cover, y, scale }}
      >
        {children}
      </motion.div>
    </div>
  )
}
