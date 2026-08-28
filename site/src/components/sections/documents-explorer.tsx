'use client'

import { Download, Eye, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useMemo, useState } from 'react'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { EmptyState } from '@/components/ui/empty-state'
import { SelectControl, inputClasses } from '@/components/forms/fields'
import { Container, Section } from '@/components/ui/section'
import { documentCategories } from '@/content/documents'
import type { DocumentCategory, InstitutionalDocument } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { formatDate } from '@/lib/utils'

const localeTag: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
}

type Props = {
  documents: InstitutionalDocument[]
  years: number[]
  locale: Locale
}

/**
 * Explorador de documentos da Transparência.
 * Filtros por ano e categoria, busca por título, visualização e download.
 * Sem documentos publicados, exibe o estado vazio institucional — nenhum
 * documento ou valor é inventado.
 */
export function DocumentsExplorer({ documents, years, locale }: Props) {
  const t = useTranslations('transparency')
  const tActions = useTranslations('actions')
  const uid = useId()

  const [query, setQuery] = useState('')
  const [year, setYear] = useState<'all' | number>('all')
  const [category, setCategory] = useState<'all' | DocumentCategory>('all')

  const hasDocuments = documents.length > 0

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return documents
      .filter((doc) => (year === 'all' ? true : doc.year === year))
      .filter((doc) => (category === 'all' ? true : doc.category === category))
      .filter((doc) =>
        term ? doc.title[locale].toLowerCase().includes(term) : true,
      )
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  }, [documents, query, year, category, locale])

  return (
    <Section surface="light" ariaLabelledby="transparency-docs-title">
      <Container className="flex flex-col gap-stack">
        <h2 id="transparency-docs-title" className="sr-only">
          {t('hero.title')}
        </h2>

        {hasDocuments ? (
          <>
            <div className="grid grid-cols-1 gap-6 border-b border-(--border) pb-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label
                  htmlFor={`${uid}-search`}
                  className="text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-muted)"
                >
                  {t('filters.search')}
                </label>
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-(--fg-subtle)"
                  />
                  <input
                    id={`${uid}-search`}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t('filters.searchPlaceholder')}
                    className={`${inputClasses} pl-11`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`${uid}-year`}
                  className="text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-muted)"
                >
                  {t('filters.year')}
                </label>
                <SelectControl
                  id={`${uid}-year`}
                  value={String(year)}
                  onChange={(event) =>
                    setYear(
                      event.target.value === 'all'
                        ? 'all'
                        : Number(event.target.value),
                    )
                  }
                >
                  <option value="all">{t('filters.allYears')}</option>
                  {years.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </SelectControl>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`${uid}-category`}
                  className="text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-muted)"
                >
                  {t('filters.category')}
                </label>
                <SelectControl
                  id={`${uid}-category`}
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as 'all' | DocumentCategory)
                  }
                >
                  <option value="all">{t('filters.all')}</option>
                  {documentCategories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label[locale]}
                    </option>
                  ))}
                </SelectControl>
              </div>
            </div>

            <p aria-live="polite" className="text-small text-(--fg-muted)">
              {t('filters.resultsCount', { count: filtered.length })}
            </p>

            {filtered.length > 0 ? (
              <StaggerContainer as="ul" className="flex flex-col">
                {filtered.map((doc) => (
                  <StaggerItem
                    key={doc.id}
                    as="li"
                    className="flex flex-col gap-4 border-t border-(--border) py-6 last:border-b sm:flex-row sm:items-center sm:justify-between sm:gap-8"
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="text-h4 font-semibold tracking-[-0.02em]">
                        {doc.title[locale]}
                      </h3>
                      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
                        <span>
                          {documentCategories.find(
                            (item) => item.id === doc.category,
                          )?.label[locale] ?? ''}
                        </span>
                        <span>{doc.year}</span>
                        <span>{doc.format.toUpperCase()}</span>
                        {doc.sizeLabel ? <span>{doc.sizeLabel}</span> : null}
                        <time dateTime={doc.publishedAt}>
                          {formatDate(doc.publishedAt, localeTag[locale])}
                        </time>
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <a
                        href={doc.file}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex min-h-11 items-center gap-2 border border-(--border-strong) px-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] transition-colors duration-200 ease-brand hover:border-(--fg)"
                      >
                        <Eye aria-hidden="true" className="size-4" />
                        {tActions('view')}
                      </a>
                      <a
                        href={doc.file}
                        download
                        className="inline-flex min-h-11 items-center gap-2 bg-(--fg) px-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-(--bg) transition-colors duration-200 ease-brand hover:bg-(--fg-muted)"
                      >
                        <Download aria-hidden="true" className="size-4" />
                        {tActions('download')}
                      </a>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <EmptyState title={t('empty.noResults')} />
            )}
          </>
        ) : (
          <EmptyState
            title={t('empty.title')}
            description={t('empty.description')}
          />
        )}
      </Container>
    </Section>
  )
}
