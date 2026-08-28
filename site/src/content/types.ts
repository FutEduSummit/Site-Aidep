import type { Locale } from '@/i18n/routing'

/** Um valor traduzido para os três idiomas do site. */
export type Localized<T = string> = Record<Locale, T>

export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale]
}

/* ------------------------------------------------------------------ */
/* Mídia                                                              */
/* ------------------------------------------------------------------ */

/**
 * Toda imagem do site passa por aqui. Enquanto o arquivo real não for
 * entregue, a chave permanece `null` e a interface exibe o quadro
 * institucional reservado — nunca uma imagem inventada.
 */
export type MediaAsset = {
  /** Caminho a partir de /public — ex.: '/images/projetos/coracao-valente.jpg' */
  src: string
  width: number
  height: number
  alt: Localized
  /** Foco do recorte, quando a foto precisar de enquadramento específico. */
  position?: string
  credit?: string
}

/* ------------------------------------------------------------------ */
/* Números                                                            */
/* ------------------------------------------------------------------ */

export type Metric = {
  id: string
  value: number
  prefix?: string
  /** Sufixo por idioma — preserva "mil", "cidades", "pessoas". */
  suffix?: Localized
  label: Localized
  note?: Localized
}

/* ------------------------------------------------------------------ */
/* Projetos                                                           */
/* ------------------------------------------------------------------ */

export type ProjectLocation = {
  city: Localized
  region?: string
  venue?: string
}

export type Project = {
  slug: string
  /** Nome próprio — não se traduz. */
  name: string
  category: Localized
  summary: Localized
  /** Parágrafos da apresentação. */
  description: Localized<string[]>
  objective: Localized | null
  audience: Localized<string[]>
  locations: ProjectLocation[]
  metrics: Metric[]
  /** Conteúdos ainda não fornecidos permanecem nulos e o bloco fica oculto. */
  methodology: Localized<{ title: string; text: string }[]> | null
  results: Localized<string[]> | null
  gallery: MediaAsset[]
  /** Ids de parceiros declarados para este projeto. */
  partnerIds: string[]
  coverKey: string
}

/* ------------------------------------------------------------------ */
/* Parceiros                                                          */
/* ------------------------------------------------------------------ */

export type PartnerKind = 'public' | 'private' | 'government' | 'support'

export type Partner = {
  id: string
  name: string
  kind: PartnerKind
  /** Somente logos oficiais fornecidas. Sem arquivo, exibimos o nome. */
  logo: MediaAsset | null
  url: string | null
}

/* ------------------------------------------------------------------ */
/* Notícias                                                           */
/* ------------------------------------------------------------------ */

export type NewsArticle = {
  slug: string
  title: Localized
  excerpt: Localized
  /** Blocos simples — prontos para migrar para um CMS. */
  body: Localized<NewsBlock[]>
  category: Localized
  /** ISO 8601 (UTC). */
  date: string
  updatedAt?: string
  author?: string
  coverKey: string
  relatedProjectSlugs: string[]
  seo?: {
    title?: Localized
    description?: Localized
  }
}

export type NewsBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string; cite?: string }

/* ------------------------------------------------------------------ */
/* Transparência                                                      */
/* ------------------------------------------------------------------ */

export type DocumentCategory =
  | 'reports'
  | 'institutional'
  | 'accountability'
  | 'projects'

export type InstitutionalDocument = {
  id: string
  title: Localized
  category: DocumentCategory
  /** Ano de referência do documento. */
  year: number
  /** ISO 8601 — data de publicação. */
  publishedAt: string
  /** Caminho em /public. Sem arquivo, o item não é listado. */
  file: string
  format: 'pdf' | 'xlsx' | 'csv' | 'doc'
  sizeLabel?: string
  projectSlug?: string
}
