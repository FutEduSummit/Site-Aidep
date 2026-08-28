import type { ComponentProps, ReactNode } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost'
export type ButtonSize = 'md' | 'lg'

const base =
  'group/btn relative inline-flex items-center justify-center gap-3 rounded-xs text-[0.8125rem] font-semibold uppercase leading-none tracking-[0.1em] transition-colors duration-200 ease-brand disabled:pointer-events-none disabled:opacity-50 min-h-11'

const variants: Record<ButtonVariant, string> = {
  /* Herda a superfície: preto sobre claro, branco sobre escuro. */
  primary:
    'bg-(--fg) text-(--bg) hover:bg-(--fg-muted) focus-visible:bg-(--fg-muted)',
  /* Verde institucional com texto quase preto — 5,1:1 de contraste. */
  accent: 'bg-brand-500 text-ink-950 hover:bg-brand-400',
  outline:
    'border border-(--border-strong) text-(--fg) hover:border-(--fg) hover:bg-(--overlay)',
  ghost: 'text-(--fg) hover:text-(--accent-text)',
}

const sizes: Record<ButtonSize, string> = {
  md: 'px-6 py-4',
  lg: 'px-8 py-5',
}

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], className)
}

/* ------------------------------------------------------------------ */

type IconMode = 'arrow' | 'external' | 'none'

function Icon({ mode }: { mode: IconMode }) {
  if (mode === 'none') return null
  const Component = mode === 'external' ? ArrowUpRight : ArrowRight
  return (
    <Component
      aria-hidden="true"
      className="size-4 shrink-0 transition-transform duration-300 ease-brand group-hover/btn:translate-x-1"
      strokeWidth={2}
    />
  )
}

type BaseProps = {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: IconMode
  className?: string
}

export function Button({
  children,
  variant,
  size,
  icon = 'none',
  className,
  ...props
}: BaseProps & ComponentProps<'button'>) {
  return (
    <button className={buttonClasses(variant, size, className)} {...props}>
      {children}
      <Icon mode={icon} />
    </button>
  )
}

type ButtonLinkProps = BaseProps &
  Omit<ComponentProps<typeof Link>, 'className' | 'children'>

/** Link interno — mantém o idioma e o caminho traduzido da rota. */
export function ButtonLink({
  children,
  variant,
  size,
  icon = 'arrow',
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {children}
      <Icon mode={icon} />
    </Link>
  )
}

/** Link externo — sempre com rel seguro e indicação de nova aba. */
export function ButtonExternal({
  children,
  variant,
  size,
  icon = 'external',
  className,
  ...props
}: BaseProps & ComponentProps<'a'>) {
  return (
    <a
      className={buttonClasses(variant, size, className)}
      target="_blank"
      rel="noreferrer noopener"
      {...props}
    >
      {children}
      <Icon mode={icon} />
    </a>
  )
}
