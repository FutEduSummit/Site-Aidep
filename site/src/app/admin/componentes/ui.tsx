'use client'

import { ChevronDown, LoaderCircle } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * PEÇAS DA INTERFACE DO PAINEL
 * ============================
 * Os controles que todas as telas de edição usam. Deliberadamente sóbrios:
 * quem trabalha aqui está preenchendo formulário longo, não navegando por
 * uma página institucional. Sem animação, sem transição de entrada, alvo
 * de toque grande e foco sempre visível.
 *
 * As cores saem dos mesmos tokens do site (`globals.css`), então o painel
 * acompanha a marca sem duplicar nenhuma definição de cor.
 */

const controle =
  'w-full min-h-11 border border-(--border-strong) bg-(--bg) px-3 py-2.5 text-body text-(--fg) transition-colors duration-150 placeholder:text-(--fg-subtle) hover:border-(--fg-muted) focus-visible:border-(--focus) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--focus) disabled:opacity-50 aria-[invalid=true]:border-danger'

export const classesDeControle = controle

/* ------------------------------------------------------------------ */

export function Campo({
  htmlFor,
  rotulo,
  children,
  erro,
  dica,
  opcional,
  className,
}: {
  htmlFor?: string
  rotulo: string
  children: ReactNode
  erro?: string
  dica?: string
  opcional?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-baseline gap-2 text-micro font-semibold uppercase tracking-[0.12em] text-(--fg-muted)"
      >
        {rotulo}
        {opcional ? (
          <span className="font-normal normal-case tracking-normal text-(--fg-subtle)">
            (opcional)
          </span>
        ) : null}
      </label>

      {children}

      {/* `tracking-normal`: o token `text-micro` traz 0.18em de espaçamento,
          desenhado para rótulo em caixa alta. Numa frase inteira aquilo vira
          texto esticado e difícil de ler. */}
      {dica && !erro ? (
        <p className="text-micro leading-relaxed tracking-normal text-(--fg-subtle)">
          {dica}
        </p>
      ) : null}

      {erro ? (
        <p className="text-small font-medium text-danger">{erro}</p>
      ) : null}
    </div>
  )
}

export function Entrada({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(controle, className)} {...props} />
}

export function AreaDeTexto({
  className,
  ...props
}: ComponentProps<'textarea'>) {
  return (
    <textarea
      rows={4}
      className={cn(controle, 'min-h-24 resize-y leading-relaxed', className)}
      {...props}
    />
  )
}

export function Selecao({
  className,
  children,
  ...props
}: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select className={cn(controle, 'appearance-none pr-10', className)} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-(--fg-muted)"
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */

type VarianteDeBotao = 'principal' | 'contorno' | 'discreto' | 'perigo'

const variantes: Record<VarianteDeBotao, string> = {
  principal: 'bg-brand-500 text-ink-950 hover:bg-brand-400',
  contorno:
    'border border-(--border-strong) text-(--fg) hover:border-(--fg) hover:bg-(--overlay)',
  discreto: 'text-(--fg-muted) hover:text-(--fg) hover:bg-(--overlay)',
  perigo: 'border border-danger text-danger hover:bg-danger-soft',
}

export function Botao({
  variante = 'principal',
  carregando = false,
  className,
  children,
  disabled,
  ...props
}: ComponentProps<'button'> & {
  variante?: VarianteDeBotao
  carregando?: boolean
}) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 px-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus) disabled:pointer-events-none disabled:opacity-50',
        variantes[variante],
        className,
      )}
      disabled={disabled || carregando}
      {...props}
    >
      {carregando ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : null}
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */

export function Interruptor({
  id,
  rotulo,
  descricao,
  checked,
  onChange,
}: {
  id: string
  rotulo: string
  descricao?: string
  checked: boolean
  onChange: (valor: boolean) => void
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(evento) => onChange(evento.target.checked)}
        className="mt-0.5 size-5 shrink-0 cursor-pointer appearance-none border border-(--border-strong) bg-(--bg) transition-colors duration-150 checked:border-brand-500 checked:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--focus)"
      />
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-small font-semibold">{rotulo}</span>
        {descricao ? (
          <span className="block text-micro leading-relaxed tracking-normal text-(--fg-subtle)">
            {descricao}
          </span>
        ) : null}
      </label>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export function Cartao({
  titulo,
  descricao,
  children,
  acao,
}: {
  titulo?: string
  descricao?: string
  children: ReactNode
  acao?: ReactNode
}) {
  return (
    <section className="flex flex-col gap-5 border border-(--border) bg-(--bg) p-5 sm:p-6">
      {titulo ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-(--border) pb-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-h4 font-semibold tracking-[-0.02em]">{titulo}</h2>
            {descricao ? (
              <p className="max-w-[60ch] text-small text-(--fg-muted)">
                {descricao}
              </p>
            ) : null}
          </div>
          {acao}
        </header>
      ) : null}

      {children}
    </section>
  )
}

export function Aviso({
  tom = 'info',
  children,
}: {
  tom?: 'info' | 'erro' | 'sucesso'
  children: ReactNode
}) {
  const tons = {
    info: 'border-(--border-strong) bg-paper-3 text-(--fg)',
    erro: 'border-danger bg-danger-soft text-[#7f1d1d]',
    sucesso: 'border-brand-500 bg-brand-100 text-brand-900',
  }

  return (
    <p
      role={tom === 'erro' ? 'alert' : 'status'}
      className={cn('border-l-2 px-4 py-3 text-small', tons[tom])}
    >
      {children}
    </p>
  )
}

/** Cabeçalho de uma tela do painel. */
export function TituloDaPagina({
  titulo,
  descricao,
  acao,
}: {
  titulo: string
  descricao?: string
  acao?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-(--border) pb-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-h2 font-extrabold tracking-[-0.035em]">{titulo}</h1>
        {descricao ? (
          <p className="max-w-[64ch] text-body text-(--fg-muted)">{descricao}</p>
        ) : null}
      </div>
      {acao}
    </header>
  )
}
