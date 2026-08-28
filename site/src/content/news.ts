import { exampleContentEnabled } from '@/lib/example-content'
import { exampleNews } from './news-example'
import type { NewsArticle } from './types'

/**
 * NOTÍCIAS
 * =========
 * Nenhuma notícia real foi fornecida até o momento. A estrutura está
 * completa e pronta para receber conteúdo — manualmente ou por um CMS
 * futuro: basta que a fonte devolva objetos no formato `NewsArticle`.
 *
 * Enquanto isso, o site carrega as notícias de exemplo de
 * `news-example.ts` — conteúdo de demonstração, para avaliar a lista, a
 * página de leitura e a seção da Home preenchidas. Com
 * `NEXT_PUBLIC_EXAMPLE_CONTENT=0` a lista é vazia e, com ela:
 *   • a seção de notícias da Home não é renderizada;
 *   • a página de Notícias exibe o estado vazio institucional;
 *   • o sitemap não gera URLs de notícia.
 *
 * Para publicar notícia real, escreva os itens aqui mesmo, no lugar da
 * lista vazia — o formato é o de `news-example.ts`:
 *
 *   const published: NewsArticle[] = [
 *     {
 *       slug: 'futedu-summit-2026',
 *       title: { pt: '…', en: '…', es: '…' },
 *       excerpt: { pt: '…', en: '…', es: '…' },
 *       body: {
 *         pt: [{ type: 'paragraph', text: '…' }],
 *         en: [{ type: 'paragraph', text: '…' }],
 *         es: [{ type: 'paragraph', text: '…' }],
 *       },
 *       category: { pt: 'Institucional', en: 'Institutional', es: 'Institucional' },
 *       date: '2026-03-18',
 *       coverKey: 'news.futedu-summit-2026',
 *       relatedProjectSlugs: ['futedu-summit'],
 *     },
 *   ]
 */

/** Notícias publicadas pela associação. */
const published: NewsArticle[] = []

export const news: NewsArticle[] = exampleContentEnabled
  ? [...published, ...exampleNews]
  : published

export function getArticle(slug: string): NewsArticle | undefined {
  return news.find((article) => article.slug === slug)
}

/** Ordenadas da mais recente para a mais antiga. */
export function getArticles(limit?: number): NewsArticle[] {
  const sorted = [...news].sort((a, b) => b.date.localeCompare(a.date))
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}

export function getRelatedArticles(
  slug: string,
  limit = 3,
): NewsArticle[] {
  const current = getArticle(slug)
  if (!current) return []

  const byProject = getArticles().filter(
    (article) =>
      article.slug !== slug &&
      article.relatedProjectSlugs.some((projectSlug) =>
        current.relatedProjectSlugs.includes(projectSlug),
      ),
  )

  const rest = getArticles().filter(
    (article) =>
      article.slug !== slug && !byProject.some((a) => a.slug === article.slug),
  )

  return [...byProject, ...rest].slice(0, limit)
}

export function getArticlesByProject(
  projectSlug: string,
  limit = 3,
): NewsArticle[] {
  return getArticles()
    .filter((article) => article.relatedProjectSlugs.includes(projectSlug))
    .slice(0, limit)
}
