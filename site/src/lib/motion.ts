import type { Transition, Variants } from 'motion/react'

/* =========================================================================
   LINGUAGEM DE MOVIMENTO DA AIDEP
   Tudo parte de uma ideia: os módulos do símbolo entram em trajetória,
   convergem e se organizam. Nada aparece por acaso — os elementos
   *chegam*. Por isso: entrada sempre a partir de um deslocamento,
   sempre com a mesma curva, sempre uma única vez.
   ========================================================================= */

/** Curva única do projeto — saída rápida, chegada longa e estável. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
export const EASE_IN: [number, number, number, number] = [0.64, 0, 0.78, 0]

export const DURATION = {
  micro: 0.2,
  fast: 0.42,
  base: 0.7,
  slow: 0.9,
} as const

export const STAGGER = {
  tight: 0.06,
  base: 0.08,
  loose: 0.12,
} as const

/** Deslocamentos verticais de entrada (px). */
export const DISTANCE = {
  sm: 24,
  md: 40,
  lg: 60,
} as const

/** Um único ponto de verdade para o gatilho de viewport. */
export const VIEWPORT = {
  once: true,
  amount: 0.2,
  margin: '0px 0px -12% 0px',
} as const

export const transition = (
  duration: number = DURATION.base,
  delay = 0,
): Transition => ({ duration, delay, ease: EASE })

/** Substituto instantâneo usado quando o usuário pede menos movimento. */
export const reducedTransition: Transition = { duration: 0.2, ease: 'linear' }

/* ------------------------------------------------------------------ */
/* Variantes reutilizáveis                                            */
/* ------------------------------------------------------------------ */

export const fadeUp = (
  distance: number = DISTANCE.md,
  duration: number = DURATION.base,
): Variants => ({
  hidden: { opacity: 0, y: distance },
  visible: { opacity: 1, y: 0, transition: transition(duration) },
})

export const fadeIn = (duration: number = DURATION.base): Variants => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition(duration) },
})

export const fadeSide = (
  distance = DISTANCE.md,
  duration: number = DURATION.base,
): Variants => ({
  hidden: { opacity: 0, x: distance },
  visible: { opacity: 1, x: 0, transition: transition(duration) },
})

/** Máscara vertical — usada em títulos por linha e em imagens. */
export const clipUp = (duration: number = DURATION.slow): Variants => ({
  hidden: { clipPath: 'inset(0% 0% 100% 0%)', y: '18%' },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    y: '0%',
    transition: transition(duration),
  },
})

/** Régua institucional que cresce da esquerda para a direita. */
export const growLine = (duration: number = DURATION.slow): Variants => ({
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: transition(duration) },
})

export const staggerParent = (
  stagger: number = STAGGER.base,
  delayChildren = 0,
): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
})

/** Variantes estáticas para prefers-reduced-motion: tudo visível, sem deslocamento. */
export const staticVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: reducedTransition },
}
