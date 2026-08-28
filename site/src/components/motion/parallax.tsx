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
 *
 * A altura vem do próprio conteúdo (em geral uma `MediaFrame`, que reserva
 * a proporção): a moldura não precisa receber altura de fora. O que ela
 * exibe fica `distance` px mais baixo que a imagem, porque é essa folga que
 * o deslocamento consome.
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

  /* A camada interna fica NO FLUXO: é ela que dá altura à moldura.
     Tirá-la do fluxo (`absolute`) deixava a moldura com altura zero e,
     como a moldura tem `overflow-hidden`, a imagem desaparecia por
     inteiro — bastava a moldura não receber altura de fora.

     O sangramento continua: a margem negativa faz a camada passar
     `distance / 2` da borda de cima e da de baixo, de modo que a moldura
     mede `altura da imagem − distance` e o deslocamento nunca descobre uma
     faixa vazia. `overflow-hidden` cria um contexto de formatação próprio,
     portanto essas margens não escapam para fora da moldura. */
  const bleed = {
    marginTop: -distance / 2,
    marginBottom: -distance / 2,
  }

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div
        data-motion="parallax"
        className={innerClassName}
        style={reduced ? bleed : { ...bleed, y, scale }}
      >
        {children}
      </motion.div>
    </div>
  )
}
