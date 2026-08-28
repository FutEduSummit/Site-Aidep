import type { ComponentProps, ReactNode } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const base =
  'group/arrow inline-flex items-center gap-3 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-(--fg) transition-colors duration-200 ease-brand hover:text-(--accent-text) min-h-11'

function Chevron({ external }: { external?: boolean }) {
  const Component = external ? ArrowUpRight : ArrowRight
  return (
    <span className="relative flex size-8 items-center justify-center border border-(--border-strong) transition-colors duration-300 ease-brand group-hover/arrow:border-(--accent) group-hover/arrow:bg-(--accent) group-hover/arrow:text-(--accent-contrast)">
      <Component
        aria-hidden="true"
        strokeWidth={2}
        className="size-4 transition-transform duration-300 ease-brand group-hover/arrow:translate-x-0.5"
      />
    </span>
  )
}

export function ArrowLink({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & Omit<
  ComponentProps<typeof Link>,
  'className' | 'children'
>) {
  return (
    <Link className={cn(base, className)} {...props}>
      <span className="link-underline">{children}</span>
      <Chevron />
    </Link>
  )
}

export function ArrowExternal({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentProps<'a'>) {
  return (
    <a
      className={cn(base, className)}
      target="_blank"
      rel="noreferrer noopener"
      {...props}
    >
      <span className="link-underline">{children}</span>
      <Chevron external />
    </a>
  )
}
