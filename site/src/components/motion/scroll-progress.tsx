'use client'

import { motion, useScroll, useSpring } from 'motion/react'

/** Linha de progresso da página, fixa abaixo do header. */
export function ScrollProgress({ label }: { label: string }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      aria-hidden="true"
      title={label}
      className="pointer-events-none fixed inset-x-0 top-0 z-[110] h-[2px] origin-left bg-brand-500"
      style={{ scaleX }}
    />
  )
}
