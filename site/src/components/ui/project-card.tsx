'use client'

import { ArrowRight } from 'lucide-react'
import { SpotlightCard } from '@/components/motion/spotlight-card'
import { MediaFrame } from '@/components/ui/media-frame'
import { getMedia } from '@/content/media'
import type { Project } from '@/content/types'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

const localeTag: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
}

type ProjectCardProps = {
  project: Project
  locale: Locale
  index: number
  cursorLabel: string
  className?: string
  /** `feature` usa composição editorial grande; `list` é a versão compacta. */
  variant?: 'feature' | 'list'
}

export function ProjectCard({
  project,
  locale,
  index,
  cursorLabel,
  className,
  variant = 'feature',
}: ProjectCardProps) {
  const number = String(index + 1).padStart(2, '0')
  const formatter = new Intl.NumberFormat(localeTag[locale])

  return (
    <SpotlightCard
      as="article"
      className={cn(
        'border-t border-(--border) pt-8 first:border-t-0 first:pt-0 lg:border-t-0 lg:pt-0',
        className,
      )}
    >
      <Link
        href={{ pathname: '/projects/[slug]', params: { slug: project.slug } }}
        data-cursor-label={cursorLabel}
        className="group/card flex h-full flex-col gap-6 outline-offset-8"
      >
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-micro font-semibold uppercase tracking-[0.18em] text-(--accent-text)">
            {number}
          </span>
          <span className="text-micro uppercase tracking-[0.16em] text-(--fg-subtle)">
            {project.category[locale]}
          </span>
        </div>

        <div className="relative overflow-hidden">
          <MediaFrame
            media={getMedia(project.coverKey)}
            mediaKey={project.coverKey}
            locale={locale}
            ratio={variant === 'feature' ? '4 / 3' : '16 / 10'}
            tone="light"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 45vw, 32vw"
            className="transition-transform duration-700 ease-brand fine:motion-safe:group-hover/card:scale-[1.04]"
          />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <h3 className="text-h3 font-bold tracking-[-0.03em]">
            {project.name}
          </h3>
          <p className="max-w-[42ch] text-body text-(--fg-muted)">
            {project.summary[locale]}
          </p>
        </div>

        <dl className="flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-(--border) pt-5">
          {project.metrics.slice(0, 2).map((metric) => (
            <div key={metric.id} className="flex flex-col gap-1">
              <dt className="sr-only">{metric.label[locale]}</dt>
              <dd className="flex items-baseline gap-1 text-h4 font-bold tracking-[-0.03em]">
                {formatter.format(metric.value)}
                {metric.suffix ? (
                  <span className="text-[0.6em] font-semibold uppercase tracking-[0.06em] text-(--accent-text)">
                    {metric.suffix[locale]}
                  </span>
                ) : null}
              </dd>
              <p className="max-w-[18ch] text-micro uppercase leading-relaxed tracking-[0.12em] text-(--fg-subtle)">
                {metric.label[locale]}
              </p>
            </div>
          ))}

          <span className="ml-auto flex size-9 items-center justify-center border border-(--border-strong) transition-colors duration-300 ease-brand group-hover/card:border-(--accent) group-hover/card:bg-(--accent) group-hover/card:text-(--accent-contrast)">
            <ArrowRight aria-hidden="true" strokeWidth={2} className="size-4" />
          </span>
        </dl>
      </Link>
    </SpotlightCard>
  )
}
