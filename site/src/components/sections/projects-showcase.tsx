'use client'

import { ArrowRight } from 'lucide-react'
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { SpotlightCard } from '@/components/motion/spotlight-card'
import { ArrowLink } from '@/components/ui/arrow-link'
import { MediaFrame } from '@/components/ui/media-frame'
import { ProjectCard } from '@/components/ui/project-card'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'
import { getMedia } from '@/content/media'
import type { Project } from '@/content/types'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

const localeTag: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
}

type ShowcaseProps = {
  projects: Project[]
  locale: Locale
}

/**
 * Projetos em destaque.
 *
 * Desktop: os cartões se empilham em composição sticky, ganhando
 * profundidade conforme o próximo cobre o anterior.
 * Mobile: lista vertical simples — sem pinning, sem tilt, sem hover.
 */
export function ProjectsShowcase({ projects, locale }: ShowcaseProps) {
  const t = useTranslations('home.projects')
  const tActions = useTranslations('actions')
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  return (
    <Section surface="muted" ariaLabelledby="home-projects-title">
      <Container className="flex flex-col gap-stack">
        <SectionHeader
          id="home-projects-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
          action={<ArrowLink href="/projects">{tActions('seeProjects')}</ArrowLink>}
        />

        {/* Mobile e tablet — lista vertical */}
        <div className="flex flex-col gap-12 lg:hidden">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              locale={locale}
              index={index}
              cursorLabel={tActions('seeProject')}
            />
          ))}
        </div>

        {/* Desktop — pilha sticky */}
        <div ref={containerRef} className="hidden lg:block">
          {projects.map((project, index) => (
            <StickyProject
              key={project.slug}
              project={project}
              locale={locale}
              index={index}
              total={projects.length}
              progress={scrollYProgress}
              cursorLabel={tActions('seeProject')}
              cta={tActions('seeProject')}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}

function StickyProject({
  project,
  locale,
  index,
  total,
  progress,
  cursorLabel,
  cta,
}: {
  project: Project
  locale: Locale
  index: number
  total: number
  progress: MotionValue<number>
  cursorLabel: string
  cta: string
}) {
  const isLast = index === total - 1
  const start = index / total

  const scale = useTransform(progress, [start, 1], [1, isLast ? 1 : 0.93])
  const opacity = useTransform(progress, [start, 1], [1, isLast ? 1 : 0.45])

  const formatter = new Intl.NumberFormat(localeTag[locale])
  const number = String(index + 1).padStart(2, '0')

  return (
    /* Cada cartão para um pouco mais abaixo, revelando a borda do anterior. */
    <motion.div
      className="sticky"
      style={{
        scale,
        opacity,
        transformOrigin: 'center top',
        top: `calc(7rem + ${index * 1.75}rem)`,
      }}
    >
      <div>
        <SpotlightCard
          as="article"
          className="mb-8 border border-(--border) bg-(--bg-raised)"
        >
          <Link
            href={{ pathname: '/projects/[slug]', params: { slug: project.slug } }}
            data-cursor-label={cursorLabel}
            className="group/row grid grid-cols-12 items-stretch gap-x-8 outline-offset-4"
          >
            <div className="col-span-5 flex flex-col justify-between gap-10 p-10 xl:p-12">
              <div className="flex items-center justify-between gap-6">
                <span className="text-micro font-semibold uppercase tracking-[0.18em] text-(--accent-text)">
                  {number}
                </span>
                <span className="text-micro uppercase tracking-[0.16em] text-(--fg-subtle)">
                  {project.category[locale]}
                </span>
              </div>

              <div className="flex flex-col gap-5">
                <h3 className="text-h2 font-bold tracking-[-0.04em]">
                  {project.name}
                </h3>
                <p className="max-w-[40ch] text-lead text-(--fg-muted)">
                  {project.summary[locale]}
                </p>
              </div>

              <div className="flex flex-col gap-6">
                <dl className="flex flex-wrap gap-x-10 gap-y-4">
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
                      <p className="mt-1 max-w-[20ch] text-micro uppercase leading-relaxed tracking-[0.12em] text-(--fg-subtle)">
                        {metric.label[locale]}
                      </p>
                    </div>
                  ))}
                </dl>

                <span className="inline-flex items-center gap-3 text-[0.8125rem] font-semibold uppercase tracking-[0.1em]">
                  <span className="link-underline">{cta}</span>
                  <span className="flex size-9 items-center justify-center border border-(--border-strong) transition-colors duration-300 ease-brand group-hover/row:border-(--accent) group-hover/row:bg-(--accent) group-hover/row:text-(--accent-contrast)">
                    <ArrowRight aria-hidden="true" strokeWidth={2} className="size-4" />
                  </span>
                </span>
              </div>
            </div>

            <div className="col-span-7 overflow-hidden">
              <MediaFrame
                media={getMedia(project.coverKey)}
                mediaKey={project.coverKey}
                locale={locale}
                ratio="4 / 3"
                tone="light"
                sizes="55vw"
                className="h-full transition-transform duration-700 ease-brand fine:motion-safe:group-hover/row:scale-[1.03]"
              />
            </div>
          </Link>
        </SpotlightCard>
      </div>
    </motion.div>
  )
}
