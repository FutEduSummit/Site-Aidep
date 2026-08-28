import type { ComponentProps, ReactNode } from 'react'
import { ArrowDown } from 'lucide-react'
import { buttonClasses, type ButtonSize, type ButtonVariant } from './button'
import { cn } from '@/lib/utils'

/** Destino dentro da própria página — sempre um id existente. */
export type HashHref = `#${string}`

export function isHashHref(href: string): href is HashHref {
  return href.startsWith('#')
}

/**
 * Link para uma seção da própria página.
 *
 * Não é navegação: não troca de rota, não remonta o `template` e não deixa
 * a impressão de que toda seção é uma página nova. A seta aponta para
 * baixo, e não para o lado, para dizer isso antes do clique. O recuo do
 * header fixo já vem do `scroll-padding-top` do documento.
 */
export function ButtonAnchor({
  children,
  variant,
  size,
  className,
  ...props
}: {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  href: HashHref
} & Omit<ComponentProps<'a'>, 'className' | 'children' | 'href'>) {
  return (
    <a className={buttonClasses(variant, size, className)} {...props}>
      {children}
      <ArrowDown
        aria-hidden="true"
        strokeWidth={2}
        className="size-4 shrink-0 transition-transform duration-300 ease-brand group-hover/btn:translate-y-1"
      />
    </a>
  )
}

const arrowBase =
  'group/arrow inline-flex items-center gap-3 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-(--fg) transition-colors duration-200 ease-brand hover:text-(--accent-text) min-h-11'

/** Mesma ideia do `ArrowLink`, para um destino na própria página. */
export function ArrowAnchor({
  children,
  className,
  ...props
}: {
  children: ReactNode
  className?: string
  href: HashHref
} & Omit<ComponentProps<'a'>, 'className' | 'children' | 'href'>) {
  return (
    <a className={cn(arrowBase, className)} {...props}>
      <span className="link-underline">{children}</span>
      <span className="relative flex size-8 items-center justify-center border border-(--border-strong) transition-colors duration-300 ease-brand group-hover/arrow:border-(--accent) group-hover/arrow:bg-(--accent) group-hover/arrow:text-(--accent-contrast)">
        <ArrowDown
          aria-hidden="true"
          strokeWidth={2}
          className="size-4 transition-transform duration-300 ease-brand group-hover/arrow:translate-y-0.5"
        />
      </span>
    </a>
  )
}
