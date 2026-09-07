import { lerNoticias } from '@/lib/cms/leitura'
import { exampleContentEnabled } from '@/lib/example-content'
import { exampleNews } from './news-example'
import type { NewsArticle } from './types'

/**
 * NOTÍCIAS
 * ========
 * A fonte da verdade é o painel do cliente (`/admin/noticias`), gravado na
 * tabela `noticias` do Supabase.
 *
 * Enquanto não houver nenhuma notícia publicada lá — ou se o Supabase
 * estiver fora do ar —, valem as notícias abaixo: as escritas à mão em
 * `estaticas` e, quando o conteúdo de exemplo está ligado (o padrão), as de
 * demonstração de `news-example.ts`. Assim a página nunca fica quebrada e
 * a demonstração continua disponível até o conteúdo real entrar.
 *
 * Com `NEXT_PUBLIC_EXAMPLE_CONTENT=0` e a tabela vazia, a lista é vazia:
 * a Home não renderiza a seção, a página de Notícias exibe o estado vazio
 * institucional e o sitemap não gera URLs de notícia.
 */

/** Notícias escritas diretamente no código. Normalmente vazio. */
const estaticas: NewsArticle[] = []

const reserva: NewsArticle[] = exampleContentEnabled
  ? [...estaticas, ...exampleNews]
  : estaticas

/** Tudo o que está no ar, da mais recente para a mais antiga. */
export async function getArticles(limit?: number): Promise<NewsArticle[]> {
  const doPainel = await lerNoticias()
  const todas = doPainel ?? reserva

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
