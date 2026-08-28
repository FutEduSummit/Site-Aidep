'use client'

import { useTranslations } from 'next-intl'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { ArrowLink } from '@/components/ui/arrow-link'
import { NewsCard } from '@/components/ui/news-card'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'
import type { NewsArticle } from '@/content/types'
import type { Locale } from '@/i18n/routing'

/**
 * Notícias recentes.
 * Enquanto não houver notícias publicadas, a seção não é renderizada —
 * a Home não exibe blocos vazios.
 */
export function NewsPreview({
  articles,
  locale,
}: {
  articles: NewsArticle[]
  locale: Locale
}) {
  const t = useTranslations('home.news')
  const tActions = useTranslations('actions')

  if (articles.length === 0) return null

  return (
    <Section surface="light" ariaLabelledby="home-news-title">
      <Container className="flex flex-col gap-stack">
        <SectionHeader
          id="home-news-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
          action={<ArrowLink href="/news">{tActions('seeNews')}</ArrowLink>}
        />

        <StaggerContainer
          as="ul"
          className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
        >
          {articles.map((article) => (
            <StaggerItem key={article.slug} as="li" className="h-full">
              <NewsCard
                article={article}
                locale={locale}
                cursorLabel={tActions('readMore')}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  )
}
