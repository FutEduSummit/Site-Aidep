/**
 * AS LINHAS DO BANCO, COMO ELAS SÃO
 * =================================
 * Espelho exato das tabelas criadas em
 * `supabase/migrations/0001_plataforma.sql`. Nomes em português porque são
 * os nomes das colunas — mexer aqui sem mexer lá quebra a leitura.
 *
 * Os campos `jsonb` chegam como `unknown`: quem valida e completa os
 * idiomas que faltam é `lib/idiomas.ts`, no mapeamento.
 */

export type LinhaCategoria = {
  id: string
  rotulo: unknown
  cor: string
  ordem: number
}

export type LinhaDocumento = {
  id: string
  titulo: unknown
  conteudo: unknown
  categoria_id: string | null
  ano: number
  publicado_em: string
  arquivo_url: string
  arquivo_path: string | null
  arquivo_nome: string | null
  formato: string
  tamanho_bytes: number | null
  miniatura_url: string | null
  miniatura_path: string | null
  projeto_slug: string | null
  publicado: boolean
  criado_em: string
  atualizado_em: string
}

export type LinhaNoticia = {
  id: string
  slug: string
  titulo: unknown
  resumo: unknown
  corpo: unknown
  categoria: unknown
  data: string
  autor: string | null
  capa_url: string | null
  capa_path: string | null
  capa_largura: number | null
  capa_altura: number | null
  capa_alt: unknown
  projetos_relacionados: string[] | null
  seo_titulo: unknown
  seo_descricao: unknown
  publicado: boolean
  criado_em: string
  atualizado_em: string
}

export type LinhaProjeto = {
  id: string
  slug: string
  nome: string
  categoria: unknown
  resumo: unknown
  descricao: unknown
  objetivo: unknown
  publico: unknown
  locais: unknown
  metricas: unknown
  metodologia: unknown
  resultados: unknown
  galeria: unknown
  parceiros: string[] | null
  capa_url: string | null
  capa_path: string | null
  capa_largura: number | null
  capa_altura: number | null
  capa_alt: unknown
  ordem: number
  publicado: boolean
  criado_em: string
  atualizado_em: string
}

/** Colunas pedidas em cada consulta — evita `select('*')` implícito. */
export const colunasCategoria = 'id, rotulo, cor, ordem'

export const colunasDocumento =
  'id, titulo, conteudo, categoria_id, ano, publicado_em, arquivo_url, arquivo_path, arquivo_nome, formato, tamanho_bytes, miniatura_url, miniatura_path, projeto_slug, publicado, criado_em, atualizado_em'

export const colunasNoticia =
  'id, slug, titulo, resumo, corpo, categoria, data, autor, capa_url, capa_path, capa_largura, capa_altura, capa_alt, projetos_relacionados, seo_titulo, seo_descricao, publicado, criado_em, atualizado_em'

export const colunasProjeto =
  'id, slug, nome, categoria, resumo, descricao, objetivo, publico, locais, metricas, metodologia, resultados, galeria, parceiros, capa_url, capa_path, capa_largura, capa_altura, capa_alt, ordem, publicado, criado_em, atualizado_em'
