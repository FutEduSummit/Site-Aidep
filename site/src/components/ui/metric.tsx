'use client'

import { AnimatedCounter } from '@/components/motion/counter'
import type { Metric } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

const localeTag: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
}

type MetricBlockProps = {
  metric: Metric
  locale: Locale
  size?: 'lg' | 'md' | 'sm'
  className?: string
}

const sizes = {
  lg: 'text-metric',
  md: 'text-h1',
  sm: 'text-h2',
}

/** Número de impacto: prefixo, contagem e sufixo preservados. */
export function MetricBlock({
  metric,
  locale,
  size = 'lg',
  className,
}: MetricBlockProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <AnimatedCounter
        value={metric.value}
        locale={localeTag[locale]}
        prefix={metric.prefix}
        suffix={metric.suffix?.[locale]}
        className={cn(
          'font-bold tracking-[-0.045em] text-(--fg)',
          sizes[size],
        )}
        suffixClassName="text-[0.42em] font-semibold uppercase tracking-[0.06em] text-(--accent-text)"
      />
      <p className="max-w-[22ch] text-small font-medium leading-snug text-(--fg-muted)">
        {metric.label[locale]}
      </p>
      {metric.note ? (
        <p className="max-w-[30ch] text-micro uppercase leading-relaxed tracking-[0.14em] text-(--fg-subtle)">
          {metric.note[locale]}
        </p>
      ) : null}
    </div>
  )
}
