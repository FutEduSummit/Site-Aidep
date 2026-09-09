import { lerNoticias } from '@/lib/cms/leitura'
import type { NewsArticle } from './types'

/**
 * NOTÍCIAS
 * ========
 * A única fonte é o painel do cliente (`/admin/noticias`), gravado na
 * tabela `noticias` do Supabase. Notícia que não está no banco não
 * aparece no site — não há lista de reserva no código, e o conteúdo de
 * demonstração de `news-example.ts` não chega mais à página. Ele
 * continua no repositório só para `npm run conteudo:semear`, que grava
 * essas notícias no banco quando alguém quer o site preenchido para uma
 * apresentação.
 *
 * Com a tabela vazia — ou com o Supabase fora do ar — a lista é vazia: a
 * Home não renderiza a seção, a página de Notícias exibe o estado vazio
 * institucional e o sitemap não gera URLs de notícia.
 */

/** Tudo o que está publicado no banco, da mais recente para a mais antiga. */
export async function getArticles(limit?: number): Promise<NewsArticle[]> {
  const todas = (await lerNoticias()) ?? []

  const ordenadas = [...todas].sort((a, b) => b.date.localeCompare(a.date))
  return typeof limit === 'number' ? ordenadas.slice(0, limit) : ordenadas
}

export async function getArticle(slug: string): Promise<NewsArticle | undefined> {
  const todas = await getArticles()
  return todas.find((article) => article.slug === slug)
}

/**
 * Relacionadas: primeiro as que dividem projeto com a notícia atual,
 * depois as mais recentes, até completar o limite.
 */
export async function getRelatedArticles(
  slug: string,
  limit = 3,
): Promise<NewsArticle[]> {
  const todas = await getArticles()
  const atual = todas.find((article) => article.slug === slug)
  if (!atual) return []

  const porProjeto = todas.filter(
    (article) =>
      article.slug !== slug &&
      article.relatedProjectSlugs.some((projectSlug) =>
        atual.relatedProjectSlugs.includes(projectSlug),
      ),
  )

  const restantes = todas.filter(
    (article) =>
      article.slug !== slug &&
      !porProjeto.some((outra) => outra.slug === article.slug),
  )

  return [...porProjeto, ...restantes].slice(0, limit)
}

export async function getArticlesByProject(
  projectSlug: string,
  limit = 3,
): Promise<NewsArticle[]> {
  const todas = await getArticles()
  return todas
    .filter((article) => article.relatedProjectSlugs.includes(projectSlug))
    .slice(0, limit)
}
