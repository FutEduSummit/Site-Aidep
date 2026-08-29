import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { PageHero } from '@/components/sections/page-hero'
import { ButtonExternal } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { NewsCard } from '@/components/ui/news-card'
import { Container, Section } from '@/components/ui/section'
import { getArticles } from '@/content/news'
import { site } from '@/content/site'
import type { Locale } from '@/i18n/routing'
import { buildPageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo.news' })

  return buildPageMetadata({
    locale,
    href: '/news',
    title: t('title'),
    description: t('description'),
  })
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'news' })
  const tActions = await getTranslations({ locale, namespace: 'actions' })
  const articles = getArticles()

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        mediaKey="page.news.banner"
      />

      <Section surface="light" ariaLabel={t('labels.readingList')}>
        <Container>
          {articles.length > 0 ? (
            <StaggerContainer
              as="ul"
              className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
            >
              {articles.map((article) => (
                <StaggerItem key={article.slug} as="li" className="h-full">
                  <NewsCard
                    article={article}
                    locale={locale}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <EmptyState
              title={t('empty.title')}
              description={t('empty.description')}
              action={
                <ButtonExternal
                  href={site.social.instagram.url}
                  variant="accent"
                >
                  {tActions('openInstagram')}
                </ButtonExternal>
              }
            />
          )}
        </Container>
      </Section>
    </>
  )
}
