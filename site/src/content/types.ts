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
  /**
   * Vídeo mudo que toma o lugar da fotografia quando pode tocar — só a
   * abertura da Página inicial usa isto hoje.
   *
   * A fotografia continua sendo o dado principal, e não vira detalhe do
   * vídeo: ela é a capa que a página mostra primeiro (é ela o LCP), a que
   * fica no ar para quem pediu menos movimento e a que aparece se o vídeo
   * não carregar. O texto alternativo é o dela, e descreve a mesma cena.
   */
  video?: {
    src: string
    /** Duração em segundos — é ela que decide quando o rodízio vira. */
    duration: number
  }
}

/**
 * Um vídeo do acervo oficial, pronto para tocar.
 *
 * Todo o acervo de vídeo da AIDEP é vertical (celular), então a proporção
 * faz parte do dado — é ela que decide a moldura, e não o contrário.
 * `poster` é obrigatório: o cartão nunca aparece vazio esperando o vídeo.
 */
export type VideoAsset = {
  src: string
  poster: string
  width: number
  height: number
  /** Duração em segundos. */
  duration: number
  title: Localized
  /** Descrição do que se vê — legenda do cartão e texto do leitor de tela. */
  description: Localized
  /** Onde foi gravado. Nome próprio de lugar: não se traduz. */
  place: string
  /** Projeto a que o vídeo pertence, quando houver. */
  projectSlug?: string
  /**
   * Filme institucional — recebe o cartão grande na frente da fileira.
   * No máximo um por lista.
   */
  featured?: boolean
  /** Idioma falado, quando o vídeo tem narração ou depoimento. */
  spokenLocale?: Locale
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
  /**
   * Quantos polos o projeto mantém nesta cidade. Ausente vale por um — é
   * o caso da maioria. Aracaju tem cinco e Nossa Senhora do Socorro tem
   * três, e é esse número que o mapa mostra na ficha da cidade em vez de
   * repetir o mesmo ponto cinco vezes no mesmo pixel.
   */
  polos?: number
  /**
   * Sigla da unidade federativa. Só é necessária quando `region` não é a
   * sigla — é ela que decide entre cidades homônimas ("Palmas" existe em
   * TO e no PR) ao marcar o ponto no mapa.
   */
  uf?: string
  /**
   * Coordenada informada à mão. Vale sobre o nome da cidade e resolve o
   * que o cadastro do IBGE não tem: distrito, comunidade, aldeia — ou
   * cidade fora do Brasil, que fica só na lista, sem ponto no mapa.
   */
  coords?: { lat: number; lng: number }
}

export type Project = {
  /** Presente apenas nos projetos vindos do painel (linha do Supabase). */
  id?: string
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
  /**
   * Capa enviada pelo painel. Quando presente, vale sobre `coverKey` —
   * ver `coverOf()` em `content/media.ts`.
   */
  cover?: MediaAsset | null
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
  /** Presente apenas nas notícias vindas do painel (linha do Supabase). */
  id?: string
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
  /** Capa enviada pelo painel; vale sobre `coverKey` quando presente. */
  cover?: MediaAsset | null
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

/**
 * Id da categoria. É `string` porque o cliente cria as categorias dele no
 * painel (tabela `documento_categorias`); os quatro valores históricos
 * abaixo continuam válidos e seguem cadastrados na migração inicial.
 */
export type DocumentCategory = string

/** Cores disponíveis para o selo da categoria na tabela de Transparência. */
export type CategoryColor =
  | 'verde'
  | 'azul'
  | 'ambar'
  | 'roxo'
  | 'cinza'
  | 'vermelho'

export type DocumentCategoryEntry = {
  id: DocumentCategory
  label: Localized
  color: CategoryColor
}

export type DocumentFormat =
  | 'pdf'
  | 'xlsx'
  | 'csv'
  | 'doc'
  | 'docx'
  | 'imagem'
  | 'outro'

export type InstitutionalDocument = {
  id: string
  title: Localized
  /** Coluna "Conteúdo" da tabela: o que o documento contém, em uma frase. */
  description?: Localized | null
  category: DocumentCategory
  /** Ano de referência do documento. */
  year: number
  /** ISO 8601 — data de publicação. */
  publishedAt: string
  /** URL do arquivo: caminho em /public ou endereço no Storage do Supabase. */
  file: string
  format: DocumentFormat
  sizeLabel?: string
  projectSlug?: string
  /** Miniatura da primeira página, exibida na coluna "Imagem". */
  thumbnail?: MediaAsset | null
  /** Nome original do arquivo enviado — usado no atributo `download`. */
  fileName?: string
}
