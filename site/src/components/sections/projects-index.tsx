'use client'

import { ArrowRight, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ImageReveal } from '@/components/motion/image-reveal'
import { ParallaxImage } from '@/components/motion/parallax'
import { Reveal } from '@/components/motion/reveal'
import { SpotlightCard } from '@/components/motion/spotlight-card'
import { MediaFrame } from '@/components/ui/media-frame'
import { Container, Section } from '@/components/ui/section'
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

/** Índice de projetos: linhas editoriais alternadas, uma por projeto. */
export function ProjectsIndex({
  projects,
  locale,
}: {
  projects: Project[]
  locale: Locale
}) {
  const t = useTranslations('projects.labels')
  const tActions = useTranslations('actions')
  const formatter = new Intl.NumberFormat(localeTag[locale])

  return (
    <Section surface="light" ariaLabel={t('allProjects')}>
      <Container className="flex flex-col gap-24 lg:gap-32">
        {projects.map((project, index) => {
          const reversed = index % 2 === 1

          return (
            <SpotlightCard as="article" key={project.slug}>
              <Link
                href={{
                  pathname: '/projects/[slug]',
                  params: { slug: project.slug },
                }}
                className="group/item flex flex-col gap-8 outline-offset-8 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8"
              >
                <ImageReveal
                  className={cn(
                    'lg:col-span-7',
                    reversed && 'lg:col-start-6',
                  )}
                  direction={reversed ? 'right' : 'left'}
                >
                  <ParallaxImage distance={48}>
                    <MediaFrame
                      media={getMedia(project.coverKey)}
                      locale={locale}
                      ratio="16 / 11"
                      tone="light"
                      sizes="(max-width: 1024px) 100vw, 56vw"
                      className="transition-transform duration-700 ease-brand fine:motion-safe:group-hover/item:scale-[1.03]"
                    />
                  </ParallaxImage>
                </ImageReveal>

                <div
                  className={cn(
                    'flex flex-col gap-6 lg:col-span-4',
                    reversed ? 'lg:col-start-1 lg:row-start-1' : 'lg:col-start-9',
                  )}
                >
                  <Reveal distance={24} className="flex items-center gap-4">
                    <span className="text-micro font-semibold uppercase tracking-[0.18em] text-(--accent-text)">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-micro uppercase tracking-[0.16em] text-(--fg-subtle)">
                      {project.category[locale]}
                    </span>
                  </Reveal>

                  <Reveal distance={28} delay={0.06}>
                    <h2 className="text-h2 font-bold tracking-[-0.04em]">
                      {project.name}
                    </h2>
                  </Reveal>

                  <Reveal distance={24} delay={0.12}>
                    <p className="max-w-[44ch] text-body text-(--fg-muted)">
                      {project.summary[locale]}
                    </p>
                  </Reveal>

                  {project.locations.length > 0 ? (
                    <Reveal distance={20} delay={0.16}>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
                        <MapPin aria-hidden="true" className="size-4" />
                        {project.locations
                          .map((location) =>
                            [location.city[locale], location.region]
                              .filter(Boolean)
                              .join(' — '),
                          )
                          .join(' · ')}
                      </p>
                    </Reveal>
                  ) : null}

                  <Reveal distance={20} delay={0.2}>
                    <dl className="flex flex-wrap gap-x-8 gap-y-4 border-t border-(--border) pt-5">
                      {project.metrics.slice(0, 2).map((metric) => (
                        <div key={metric.id}>
                          <dt className="sr-only">{metric.label[locale]}</dt>
                          <dd className="flex items-baseline gap-1 text-h3 font-bold tracking-[-0.04em]">
                            {formatter.format(metric.value)}
                            {metric.suffix ? (
                              <span className="text-[0.5em] font-semibold uppercase tracking-[0.06em] text-(--accent-text)">
                                {metric.suffix[locale]}
                              </span>
                            ) : null}
                          </dd>
                          <p className="mt-1 max-w-[18ch] text-micro uppercase leading-relaxed tracking-[0.12em] text-(--fg-subtle)">
                            {metric.label[locale]}
                          </p>
                        </div>
                      ))}
                    </dl>
                  </Reveal>

                  <Reveal distance={20} delay={0.24}>
                    <span className="inline-flex items-center gap-3 text-[0.8125rem] font-semibold uppercase tracking-[0.1em]">
                      <span className="link-underline">
                        {tActions('seeProject')}
                      </span>
                      <span className="flex size-9 items-center justify-center border border-(--border-strong) transition-colors duration-300 ease-brand group-hover/item:border-(--accent) group-hover/item:bg-(--accent) group-hover/item:text-(--accent-contrast)">
                        <ArrowRight
                          aria-hidden="true"
                          strokeWidth={2}
                          className="size-4"
                        />
                      </span>
                    </span>
                  </Reveal>
                </div>
              </Link>
            </SpotlightCard>
          )
        })}
      </Container>
    </Section>
  )
}
