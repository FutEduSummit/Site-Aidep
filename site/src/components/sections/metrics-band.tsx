'use client'

import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { MetricBlock } from '@/components/ui/metric'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section, type Surface } from '@/components/ui/section'
import type { Metric } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { STAGGER } from '@/lib/motion'
import { cn } from '@/lib/utils'

type MetricsBandProps = {
  metrics: Metric[]
  locale: Locale
  eyebrow?: string
  title: string
  description?: string
  id?: string
  surface?: Surface
  size?: 'lg' | 'md' | 'sm'
  columns?: 2 | 3 | 4
}

const columnClasses = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

export function MetricsBand({
  metrics,
  locale,
  eyebrow,
  title,
  description,
  id = 'metrics',
  surface = 'dark',
  size = 'lg',
  columns = 4,
}: MetricsBandProps) {
  return (
    <Section surface={surface} ariaLabelledby={`${id}-title`}>
      <Container className="flex flex-col gap-stack">
        <SectionHeader
          id={`${id}-title`}
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        <StaggerContainer
          stagger={STAGGER.loose}
          className={cn('grid grid-cols-1 gap-x-8 gap-y-12', columnClasses[columns])}
        >
          {metrics.map((metric) => (
            <StaggerItem
              key={metric.id}
              className="border-t border-(--border) pt-8"
            >
              <MetricBlock metric={metric} locale={locale} size={size} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  )
}
