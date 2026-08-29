import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight, MapPin } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { ContentBlock } from '@/components/sections/content-block'
import { CtaBand } from '@/components/sections/cta-band'
import { MetricsBand } from '@/components/sections/metrics-band'
import { PageHero } from '@/components/sections/page-hero'
import { NewsCard } from '@/components/ui/news-card'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'
import { getArticlesByProject } from '@/content/news'
import { getPartners } from '@/content/partners'
import { getProject, projects } from '@/content/projects'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { locales } from '@/i18n/routing'
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  localizedPath,
} from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    projects.map((project) => ({ locale, slug: project.slug })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const project = getProject(slug)
  if (!project) return {}

  return buildPageMetadata({
    locale,
    href: { pathname: '/projects/[slug]', params: { slug } },
    title: project.name,
    description: project.summary[locale],
  })
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const project = getProject(slug)
  if (!project) notFound()

  const t = await getTranslations({ locale, namespace: 'projects' })
  const tActions = await getTranslations({ locale, namespace: 'actions' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })

  const relatedNews = getArticlesByProject(project.slug)
  const projectPartners = getPartners(project.partnerIds)
  const currentIndex = projects.findIndex((item) => item.slug === project.slug)
  const nextProject = projects[(currentIndex + 1) % projects.length]

  const breadcrumb = breadcrumbJsonLd([
    { name: tNav('home'), url: absoluteUrl(localizedPath(locale, '/')) },
    {
      name: tNav('projects'),
      url: absoluteUrl(localizedPath(locale, '/projects')),
    },
    {
      name: project.name,
      url: absoluteUrl(
        localizedPath(locale, {
          pathname: '/projects/[slug]',
          params: { slug: project.slug },
        }),
      ),
    },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <PageHero
        eyebrow={project.category[locale]}
        title={project.name}
        lead={project.summary[locale]}
        mediaKey={project.coverKey}
        aside={
          <dl className="flex flex-col gap-6">
            {project.metrics.slice(0, 2).map((metric) => (
              <div key={metric.id} className="border-t border-(--border) pt-5">
                <dd className="flex items-baseline gap-1 text-h2 font-extrabold tracking-[-0.045em]">
                  {new Intl.NumberFormat(locale).format(metric.value)}
                  {metric.suffix ? (
                    <span className="text-[0.42em] font-semibold uppercase tracking-[0.06em] text-(--accent)">
                      {metric.suffix[locale]}
                    </span>
                  ) : null}
                </dd>
                <dt className="mt-2 max-w-[24ch] text-micro uppercase leading-relaxed tracking-[0.14em] text-(--fg-subtle)">
                  {metric.label[locale]}
                </dt>
              </div>
            ))}
          </dl>
        }
      >
        <Link
          href="/projects"
          className="link-underline inline-flex min-h-11 items-center text-[0.8125rem] font-semibold uppercase tracking-[0.1em]"
        >
          {tActions('backToProjects')}
        </Link>
      </PageHero>

      <ContentBlock
        id="project-presentation"
        locale={locale}
        surface="light"
        eyebrow={t('labels.presentation')}
        title={project.summary[locale]}
        paragraphs={project.description[locale]}
      />

      <Section surface="muted" ariaLabelledby="project-details-title">
        <Container className="flex flex-col gap-stack">
          <SectionHeader
            id="project-details-title"
            eyebrow={t('labels.category')}
            title={project.category[locale]}
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-3">
            {project.objective ? (
              <div className="flex flex-col gap-4 border-t border-(--border) pt-8">
                <h3 className="text-micro font-semibold uppercase tracking-[0.16em] text-(--fg-subtle)">
                  {t('labels.objective')}
                </h3>
                <p className="max-w-[40ch] text-body text-(--fg)">
                  {project.objective[locale]}
                </p>
              </div>
            ) : null}

            <div className="flex flex-col gap-4 border-t border-(--border) pt-8">
              <h3 className="text-micro font-semibold uppercase tracking-[0.16em] text-(--fg-subtle)">
                {t('labels.audience')}
              </h3>
              <StaggerContainer as="ul" className="flex flex-wrap gap-2">
                {project.audience[locale].map((item) => (
                  <StaggerItem key={item} as="li">
                    <span className="inline-flex items-center border border-(--border-strong) px-4 py-2 text-small">
                      {item}
                    </span>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>

            {project.locations.length > 0 ? (
              <div className="flex flex-col gap-4 border-t border-(--border) pt-8">
                <h3 className="text-micro font-semibold uppercase tracking-[0.16em] text-(--fg-subtle)">
                  {t('labels.locations')}
                </h3>
                <ul className="flex flex-col gap-3">
                  {project.locations.map((location) => (
                    <li
                      key={location.city[locale]}
                      className="flex items-start gap-3 text-body"
                    >
                      <MapPin
                        aria-hidden="true"
                        className="mt-1 size-4 shrink-0 text-(--accent-text)"
                      />
                      <span>
                        {location.city[locale]}
                        {location.region ? ` — ${location.region}` : ''}
                        {location.venue ? (
                          <span className="block text-small text-(--fg-muted)">
                            {location.venue}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Container>
      </Section>

      <MetricsBand
        id="project-metrics"
        metrics={project.metrics}
        locale={locale}
        surface="dark"
        size="md"
        columns={3}
        title={t('labels.numbers')}
      />

      {/* Metodologia — publicada assim que o conteúdo for fornecido. */}
      {project.methodology ? (
        <Section surface="light" ariaLabelledby="project-method-title">
          <Container className="flex flex-col gap-stack">
            <SectionHeader
              id="project-method-title"
              title={t('labels.methodology')}
            />
            <StaggerContainer as="ol" className="flex flex-col">
              {project.methodology[locale].map((step, index) => (
                <StaggerItem
                  key={step.title}
                  as="li"
                  className="grid grid-cols-[auto_1fr] gap-x-8 border-t border-(--border) py-8 last:border-b"
                >
                  <span className="text-micro font-semibold uppercase tracking-[0.18em] text-(--accent-text)">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-h3 font-bold tracking-[-0.03em]">
                      {step.title}
                    </h3>
                    <p className="max-w-[54ch] text-body text-(--fg-muted)">
                      {step.text}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </Section>
      ) : null}

      {/* Galeria — exibida quando houver fotografias cadastradas. */}
      {project.gallery.length > 0 ? (
        <Section surface="muted" ariaLabelledby="project-gallery-title">
          <Container className="flex flex-col gap-stack">
            <SectionHeader
              id="project-gallery-title"
              title={t('labels.gallery')}
            />
            <StaggerContainer
              as="ul"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {project.gallery.map((image) => (
                <StaggerItem key={image.src} as="li">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.alt[locale]}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </Section>
      ) : null}

      {/* Resultados descritivos — publicados quando fornecidos. */}
      {project.results ? (
        <Section surface="light" ariaLabelledby="project-results-title">
          <Container className="flex flex-col gap-stack">
            <SectionHeader
              id="project-results-title"
              title={t('labels.results')}
            />
            <ul className="prose-aidep max-w-[68ch]">
              {project.results[locale].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      {/* Parceiros do projeto — exibidos quando declarados. */}
      {projectPartners.length > 0 ? (
        <Section surface="muted" ariaLabelledby="project-partners-title">
          <Container className="flex flex-col gap-stack">
            <SectionHeader
              id="project-partners-title"
              title={t('labels.partners')}
            />
            <ul className="flex flex-wrap gap-x-10 gap-y-4">
              {projectPartners.map((partner) => (
                <li key={partner.id} className="text-h4 font-semibold">
                  {partner.name}
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      {/* Notícias relacionadas — exibidas quando houver publicações. */}
      {relatedNews.length > 0 ? (
        <Section surface="light" ariaLabelledby="project-news-title">
          <Container className="flex flex-col gap-stack">
            <SectionHeader
              id="project-news-title"
              title={t('labels.relatedNews')}
            />
            <StaggerContainer
              as="ul"
              className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
            >
              {relatedNews.map((article) => (
                <StaggerItem key={article.slug} as="li">
                  <NewsCard
                    article={article}
                    locale={locale}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </Section>
      ) : null}

      <CtaBand
        id="project-cta"
        surface="brand"
        mediaKey="home.donate.banner"
        title={t('cta.title')}
        description={t('cta.description')}
        primary={{ href: '/donate', label: tActions('donate') }}
        secondary={{ href: '/partners', label: tActions('becomePartner') }}
      />

      <Section surface="dark" space="compact" ariaLabel={t('labels.nextProject')}>
        <Container>
          <Link
            href={{
              pathname: '/projects/[slug]',
              params: { slug: nextProject.slug },
            }}
            className="group/next flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-micro font-semibold uppercase tracking-[0.18em] text-(--fg-subtle)">
              {t('labels.nextProject')}
            </span>
            <span className="flex items-center gap-5 text-h3 font-bold tracking-[-0.03em]">
              {nextProject.name}
              <span className="flex size-10 items-center justify-center border border-(--border-strong) transition-colors duration-300 ease-brand group-hover/next:border-(--accent) group-hover/next:bg-(--accent) group-hover/next:text-(--accent-contrast)">
                <ArrowRight aria-hidden="true" strokeWidth={2} className="size-4" />
              </span>
            </span>
          </Link>
        </Container>
      </Section>
    </>
  )
}
