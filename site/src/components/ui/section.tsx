import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type Surface = 'light' | 'muted' | 'dark' | 'brand'

type SectionProps = {
  children: ReactNode
  /** Define os tokens semânticos de todo o bloco. */
  surface?: Surface
  id?: string
  className?: string
  /** Espaçamento vertical do bloco. */
  space?: 'default' | 'compact' | 'none'
  as?: 'section' | 'div' | 'footer' | 'header'
  ariaLabelledby?: string
  ariaLabel?: string
}

const spaces = {
  default: 'py-section',
  compact: 'py-section-sm',
  none: '',
}

export function Section({
  children,
  surface = 'light',
  id,
  className,
  space = 'default',
  as: Tag = 'section',
  ariaLabelledby,
  ariaLabel,
}: SectionProps) {
  return (
    <Tag
      id={id}
      data-surface={surface}
      aria-labelledby={ariaLabelledby}
      aria-label={ariaLabel}
      className={cn(
        'surface relative isolate w-full overflow-x-clip',
        spaces[space],
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export function Container({
  children,
  className,
  wide = false,
}: {
  children: ReactNode
  className?: string
  wide?: boolean
}) {
  return (
    <div className={cn(wide ? 'container-wide' : 'container-site', className)}>
      {children}
    </div>
  )
}
