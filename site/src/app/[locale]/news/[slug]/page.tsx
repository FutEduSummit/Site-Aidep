import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ImageReveal } from '@/components/motion/image-reveal'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { MediaFrame } from '@/components/ui/media-frame'
import { NewsCard } from '@/components/ui/news-card'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'
import { ShareLinks } from '@/components/ui/share-links'
import { getMedia } from '@/content/media'
import { getArticle, getRelatedArticles, news } from '@/content/news'
import { getProject } from '@/content/projects'
import type { NewsBlock } from '@/content/types'
import { Link } from '@/i18n/navigation'
import { locales, type Locale } from '@/i18n/routing'
import {
  absoluteUrl,
  articleJsonLd,
  buildPageMetadata,
  localizedPath,
} from '@/lib/seo'
import { formatDate } from '@/lib/utils'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

const localeTag: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
}

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    news.map((article) => ({ locale, slug: article.slug })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const article = getArticle(slug)
  if (!article) return {}

  return buildPageMetadata({
    locale,
    href: { pathname: '/news/[slug]', params: { slug } },
    title: article.seo?.title?.[locale] ?? article.title[locale],
    description: article.seo?.description?.[locale] ?? article.excerpt[locale],
    type: 'article',
    publishedTime: article.date,
    modifiedTime: article.updatedAt,
  })
}

function Block({ block }: { block: NewsBlock }) {
  if (block.type === 'heading') return <h2>{block.text}</h2>
  if (block.type === 'list')
    return (
      <ul>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  if (block.type === 'quote')
    return (
      <blockquote className="border-l-2 border-(--accent) pl-6 text-lead font-medium">
        {block.text}
        {block.cite ? (
          <cite className="mt-3 block text-small not-italic text-(--fg-subtle)">
            {block.cite}
          </cite>
        ) : null}
      </blockquote>
    )
  return <p>{block.text}</p>
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const article = getArticle(slug)
  if (!article) notFound()

  const t = await getTranslations({ locale, namespace: 'news' })
  const tActions = await getTranslations({ locale, namespace: 'actions' })
  const related = getRelatedArticles(slug)

  const url = absoluteUrl(
    localizedPath(locale, { pathname: '/news/[slug]', params: { slug } }),
  )

  const jsonLd = articleJsonLd({
    locale,
    url,
    headline: article.title[locale],
    description: article.excerpt[locale],
    datePublished: article.date,
    dateModified: article.updatedAt,
    author: article.author,
    image: getMedia(article.coverKey)?.src,
  })

  const relatedProjects = article.relatedProjectSlugs
    .map((projectSlug) => getProject(projectSlug))
    .filter((project) => Boolean(project))

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Section surface="dark" space="none" className="pb-section-sm pt-18 lg:pt-22">
        <Container className="pt-section-sm">
          <article className="flex flex-col gap-8">
            <Link
              href="/news"
              className="link-underline inline-flex min-h-11 items-center self-start text-[0.8125rem] font-semibold uppercase tracking-[0.1em]"
            >
              {tActions('backToNews')}
            </Link>

            <p className="flex flex-wrap items-center gap-4 text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
              <span className="text-(--accent)">{article.category[locale]}</span>
              <time dateTime={article.date}>
                {formatDate(article.date, localeTag[locale])}
              </time>
              {article.author ? (
                <span>
                  {t('labels.author')} {article.author}
                </span>
              ) : null}
            </p>

            <h1 className="max-w-[22ch] text-display font-extrabold tracking-[-0.045em]">
              {article.title[locale]}
            </h1>

            <p className="max-w-[58ch] text-lead text-(--fg-muted)">
              {article.excerpt[locale]}
            </p>
          </article>
        </Container>
      </Section>

      <Section surface="light" space="none" className="py-section-sm">
        <Container>
          <ImageReveal>
            <MediaFrame
              media={getMedia(article.coverKey)}
              mediaKey={article.coverKey}
              locale={locale}
              ratio="16 / 9"
              tone="light"
              priority
              sizes="(max-width: 1536px) 100vw, 1536px"
            />
          </ImageReveal>
        </Container>
      </Section>

      <Section surface="light" space="compact">
        <Container>
          <div className="flex flex-col gap-12 lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="prose-aidep max-w-[68ch] text-body text-(--fg) lg:col-span-7 lg:col-start-3">
              {article.body[locale].map((block, index) => (
                <Block key={index} block={block} />
              ))}
            </div>

            <aside className="flex flex-col gap-8 lg:col-span-2 lg:col-start-11">
              <ShareLinks title={article.title[locale]} />

              {relatedProjects.length > 0 ? (
                <div className="flex flex-col gap-3 border-t border-(--border) pt-6">
                  <h2 className="text-micro font-semibold uppercase tracking-[0.16em] text-(--fg-subtle)">
                    {t('labels.relatedProjects')}
                  </h2>
                  <ul className="flex flex-col gap-2">
                    {relatedProjects.map((project) => (
                      <li key={project!.slug}>
                        <Link
                          href={{
                            pathname: '/projects/[slug]',
                            params: { slug: project!.slug },
                          }}
                          className="link-underline text-small font-medium"
                        >
                          {project!.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          </div>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section surface="muted" ariaLabelledby="news-related-title">
          <Container className="flex flex-col gap-stack">
            <SectionHeader
              id="news-related-title"
              title={t('labels.related')}
            />
            <StaggerContainer
              as="ul"
              className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
            >
              {related.map((item) => (
                <StaggerItem key={item.slug} as="li" className="h-full">
                  <NewsCard
                    article={item}
                    locale={locale}
                    cursorLabel={tActions('readMore')}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </Section>
      ) : null}
    </>
  )
}
