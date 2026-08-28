import { ArrowRight } from 'lucide-react'
import { MediaFrame } from '@/components/ui/media-frame'
import { getMedia } from '@/content/media'
import type { NewsArticle } from '@/content/types'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { formatDate } from '@/lib/utils'

const localeTag: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
}

export function NewsCard({
  article,
  locale,
  cursorLabel,
}: {
  article: NewsArticle
  locale: Locale
  cursorLabel: string
}) {
  return (
    <article className="h-full">
      <Link
        href={{ pathname: '/news/[slug]', params: { slug: article.slug } }}
        data-cursor-label={cursorLabel}
        className="group/news flex h-full flex-col gap-5 outline-offset-8"
      >
        <div className="overflow-hidden">
          <MediaFrame
            media={getMedia(article.coverKey)}
            locale={locale}
            ratio="16 / 10"
            tone="light"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 45vw, 30vw"
            className="transition-transform duration-700 ease-brand fine:motion-safe:group-hover/news:scale-[1.04]"
          />
        </div>

        <div className="flex items-center gap-4 text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
          <span className="text-(--accent-text)">{article.category[locale]}</span>
          <time dateTime={article.date}>
            {formatDate(article.date, localeTag[locale])}
          </time>
        </div>

        <h3 className="text-h4 font-bold tracking-[-0.02em]">
          {article.title[locale]}
        </h3>

        <p className="max-w-[46ch] text-small text-(--fg-muted)">
          {article.excerpt[locale]}
        </p>

        <span className="mt-auto flex size-9 items-center justify-center border border-(--border-strong) transition-colors duration-300 ease-brand group-hover/news:border-(--accent) group-hover/news:bg-(--accent) group-hover/news:text-(--accent-contrast)">
          <ArrowRight aria-hidden="true" strokeWidth={2} className="size-4" />
        </span>
      </Link>
    </article>
  )
}
