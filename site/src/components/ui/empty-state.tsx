import type { ReactNode } from 'react'
import { symbolMark } from '@/lib/brand'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/**
 * Estado vazio institucional.
 * Usado quando um conteúdo ainda não foi fornecido — a estrutura fica
 * pronta e o site diz com clareza o que virá, sem inventar dados.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-start gap-6 overflow-hidden border border-(--border) px-gutter py-section-sm',
        className,
      )}
    >
      <Image
        src={symbolMark.black.src}
        alt=""
        aria-hidden="true"
        width={symbolMark.black.width}
        height={symbolMark.black.height}
        sizes="(max-width: 768px) 80vw, 420px"
        className="pointer-events-none absolute -right-[6%] -top-[30%] h-[190%] w-auto max-w-none object-contain opacity-[0.05]"
      />

      <span className="modulo" />

      <h3 className="max-w-[24ch] text-h3 font-bold tracking-[-0.03em]">
        {title}
      </h3>

      {description ? (
        <p className="max-w-[58ch] text-body text-(--fg-muted)">{description}</p>
      ) : null}

      {action}
    </div>
  )
}
