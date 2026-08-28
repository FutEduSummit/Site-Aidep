'use client'

import type { ReactNode } from 'react'
import { MaskedWords } from '@/components/motion/animated-text'
import { GrowLine } from '@/components/motion/grow-line'
import { Reveal } from '@/components/motion/reveal'
import { DISTANCE } from '@/lib/motion'
import { cn } from '@/lib/utils'

type SectionHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  /** Id do título — usado por aria-labelledby da seção. */
  id?: string
  action?: ReactNode
  className?: string
  titleClassName?: string
  /** `wide` alarga o título; `column` empilha descrição abaixo. */
  layout?: 'split' | 'stacked'
  as?: 'h1' | 'h2' | 'h3'
  rule?: boolean
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  id,
  action,
  className,
  titleClassName,
  layout = 'split',
  as = 'h2',
  rule = true,
}: SectionHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-stack', className)}>
      {rule ? <GrowLine /> : null}

      <div
        className={cn(
          'flex flex-col gap-8',
          layout === 'split' &&
            'lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-8 lg:gap-y-10',
        )}
      >
        <div className={cn(layout === 'split' && 'lg:col-span-7')}>
          {eyebrow ? (
            <Reveal distance={DISTANCE.sm} duration={0.5}>
              <p className="eyebrow mb-6">{eyebrow}</p>
            </Reveal>
          ) : null}

          <MaskedWords
            as={as}
            id={id}
            text={title}
            className={cn(
              'max-w-[18ch] text-h2 font-bold tracking-[-0.03em]',
              titleClassName,
            )}
          />
        </div>

        {description || action ? (
          <div
            className={cn(
              'flex flex-col items-start gap-8',
              layout === 'split' && 'lg:col-span-4 lg:col-start-9',
            )}
          >
            {description ? (
              <Reveal distance={DISTANCE.sm} delay={0.08}>
                <p className="max-w-[46ch] text-lead text-(--fg-muted)">
                  {description}
                </p>
              </Reveal>
            ) : null}
            {action ? (
              <Reveal distance={DISTANCE.sm} delay={0.16}>
                {action}
              </Reveal>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  )
}
