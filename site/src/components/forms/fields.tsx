'use client'

import { Check, ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const control =
  'w-full min-h-12 border border-(--border-strong) bg-transparent px-4 py-3 text-body text-(--fg) transition-colors duration-200 ease-brand placeholder:text-(--fg-subtle) hover:border-(--fg-muted) focus-visible:border-(--focus) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus) aria-[invalid=true]:border-danger'

type FieldProps = {
  id: string
  label: string
  children: ReactNode
  error?: string
  hint?: string
  required?: boolean
  optionalLabel?: string
  className?: string
}

/**
 * Campo de formulário acessível: label real associada ao controle,
 * mensagem de erro ligada por aria-describedby e estado inválido
 * anunciado por aria-invalid.
 */
export function Field({
  id,
  label,
  children,
  error,
  hint,
  required = true,
  optionalLabel,
  className,
}: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label
        htmlFor={id}
        className="flex items-baseline gap-2 text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-muted)"
      >
        {label}
        {!required && optionalLabel ? (
          <span className="font-normal normal-case tracking-normal text-(--fg-subtle)">
            ({optionalLabel})
          </span>
        ) : null}
      </label>

      {children}

      {hint && !error ? (
        <p id={`${id}-hint`} className="text-micro tracking-[0.04em] text-(--fg-subtle)">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={`${id}-error`} className="text-small font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}

export const inputClasses = control

export function SelectControl({
  className,
  children,
  ...props
}: React.ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        className={cn(control, 'appearance-none pr-12', className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-(--fg-muted)"
      />
    </div>
  )
}

export function CheckboxControl({
  id,
  label,
  error,
  ...props
}: { id: string; label: string; error?: string } & React.ComponentProps<'input'>) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <span className="relative mt-1 inline-flex size-5 shrink-0">
          <input
            id={id}
            type="checkbox"
            className="peer size-5 cursor-pointer appearance-none border border-(--border-strong) transition-colors duration-200 ease-brand checked:border-(--accent) checked:bg-(--accent) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus) aria-[invalid=true]:border-danger"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />
          <Check
            aria-hidden="true"
            strokeWidth={3}
            className="pointer-events-none absolute inset-0 m-auto size-3.5 text-(--accent-contrast) opacity-0 peer-checked:opacity-100"
          />
        </span>
        <label htmlFor={id} className="cursor-pointer text-small text-(--fg-muted)">
          {label}
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-small font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}
