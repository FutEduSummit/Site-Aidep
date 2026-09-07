import type {
  CategoryColor,
  DocumentCategoryEntry,
  DocumentFormat,
  InstitutionalDocument,
  Localized,
  MediaAsset,
  Metric,
  NewsArticle,
  NewsBlock,
  Project,
  ProjectLocation,
} from '@/content/types'
import {
  estrutura,
  estruturaOpcional,
  lista,
  listaOpcional,
  mesmoTexto,
  texto,
  textoOpcional,
} from '@/lib/idiomas'
import type {
  LinhaCategoria,
  LinhaDocumento,
  LinhaNoticia,
  LinhaProjeto,
} from './tipos'

/**
 * DO BANCO PARA O SITE
 * ====================
 * Cada função aqui transforma uma linha crua do Supabase no tipo que os
 * componentes do site já sabem exibir. É a única fronteira onde dado de
 * fora vira dado confiável: campo faltando vira valor neutro, idioma
 * faltando herda o português, número inválido vira zero. Nada abaixo
 * desta camada precisa desconfiar do que recebeu.
 */

const CAPA_LARGURA_PADRAO = 1600
const CAPA_ALTURA_PADRAO = 900

const coresValidas: CategoryColor[] = [
  'verde',
  'azul',
  'ambar',
  'roxo',
  'cinza',
  'vermelho',
]

const formatosValidos: DocumentFormat[] = [
  'pdf',
  'xlsx',
  'csv',
  'doc',
  'docx',
  'imagem',
  'outro',
]

/** Data do banco (`2026-03-18` ou timestamp) no formato ISO curto do site. */
function dataIso(valor: string | null | undefined): string {
  if (!valor) return new Date().toISOString().slice(0, 10)
  return valor.slice(0, 10)
}

function imagem(
  url: string | null,
  largura: number | null,
  altura: number | null,
  alt: unknown,
  altPadrao: Localized,
): MediaAsset | null {
  if (!url) return null

  const descricao = textoOpcional(alt) ?? altPadrao

  return {
    src: url,
    width: largura && largura > 0 ? largura : CAPA_LARGURA_PADRAO,
    height: altura && altura > 0 ? altura : CAPA_ALTURA_PADRAO,
    alt: descricao,
  }
}

/** "4 kB", "1,2 MB" — o rótulo que aparece ao lado do documento. */
export function rotuloTamanho(bytes: number | null | undefined): string | undefined {
  if (!bytes || bytes <= 0) return undefined
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

/* ------------------------------------------------------------------ */
/* Categorias                                                         */
/* ------------------------------------------------------------------ */

export function paraCategoria(linha: LinhaCategoria): DocumentCategoryEntry {
  const cor = coresValidas.includes(linha.cor as CategoryColor)
    ? (linha.cor as CategoryColor)
    : 'cinza'

  return {
    id: linha.id,
    label: texto(linha.rotulo),
    color: cor,
  }
}

/* ------------------------------------------------------------------ */
/* Documentos                                                         */
/* ------------------------------------------------------------------ */

export function paraDocumento(linha: LinhaDocumento): InstitutionalDocument {
  const titulo = texto(linha.titulo)

  const formato = formatosValidos.includes(linha.formato as DocumentFormat)
    ? (linha.formato as DocumentFormat)
    : 'outro'

  return {
    id: linha.id,
    title: titulo,
    description: textoOpcional(linha.conteudo),
    category: linha.categoria_id ?? 'outros',
    year: Number(linha.ano) || new Date(dataIso(linha.publicado_em)).getUTCFullYear(),
    publishedAt: dataIso(linha.publicado_em),
    file: linha.arquivo_url,
    format: formato,
    sizeLabel: rotuloTamanho(linha.tamanho_bytes),
    projectSlug: linha.projeto_slug ?? undefined,
    thumbnail: imagem(linha.miniatura_url, 420, 594, null, titulo),
    fileName: linha.arquivo_nome ?? undefined,
  }
}

/* ------------------------------------------------------------------ */
/* Notícias                                                           */
/* ------------------------------------------------------------------ */

/** Descarta bloco malformado em vez de deixar a página de leitura quebrar. */
function blocosValidos(brutos: NewsBlock[]): NewsBlock[] {
  return brutos.filter((bloco) => {
    if (!bloco || typeof bloco !== 'object') return false
    if (bloco.type === 'list') return Array.isArray(bloco.items) && bloco.items.length > 0
    return typeof (bloco as { text?: unknown }).text === 'string'
  })
}

export function paraNoticia(linha: LinhaNoticia): NewsArticle {
  const titulo = texto(linha.titulo)
  const corpo = estrutura<NewsBlock>(linha.corpo)

  const seoTitulo = textoOpcional(linha.seo_titulo)
  const seoDescricao = textoOpcional(linha.seo_descricao)

  return {
    id: linha.id,
    slug: linha.slug,
    title: titulo,
    excerpt: texto(linha.resumo),
    body: {
      pt: blocosValidos(corpo.pt),
      en: blocosValidos(corpo.en),
      es: blocosValidos(corpo.es),
    },
    category: texto(linha.categoria),
    date: dataIso(linha.data),
    updatedAt: linha.atualizado_em ?? undefined,
    author: linha.autor ?? undefined,
    coverKey: `noticia.${linha.slug}`,
    cover: imagem(
      linha.capa_url,
      linha.capa_largura,
      linha.capa_altura,
      linha.capa_alt,
      titulo,
    ),
    relatedProjectSlugs: linha.projetos_relacionados ?? [],
    seo:
      seoTitulo || seoDescricao
        ? {
            title: seoTitulo ?? undefined,
            description: seoDescricao ?? undefined,
          }
        : undefined,
  }
}

/* ------------------------------------------------------------------ */
/* Projetos                                                           */
/* ------------------------------------------------------------------ */

function paraLocais(bruto: unknown): ProjectLocation[] {
  if (!Array.isArray(bruto)) return []

  const locais: ProjectLocation[] = []

  for (const item of bruto) {
    const local = (item ?? {}) as Record<string, unknown>
    const cidade = texto(local.city ?? local.cidade)
    /* Sem cidade não há o que exibir no bloco de locais de atuação. */
    if (!cidade.pt) continue

    const coords = (local.coords ?? null) as { lat?: unknown; lng?: unknown } | null
    const temCoordenada =
      coords && Number.isFinite(Number(coords.lat)) && Number.isFinite(Number(coords.lng))

    locais.push({
      city: cidade,
      region: typeof local.region === 'string' ? local.region : undefined,
      venue: typeof local.venue === 'string' ? local.venue : undefined,
      uf: typeof local.uf === 'string' ? local.uf : undefined,
      coords: temCoordenada
        ? { lat: Number(coords.lat), lng: Number(coords.lng) }
        : undefined,
    })
  }

  return locais
}

function paraMetricas(bruto: unknown): Metric[] {
  if (!Array.isArray(bruto)) return []

  const metricas: Metric[] = []

  bruto.forEach((item, indice) => {
    const metrica = (item ?? {}) as Record<string, unknown>
    const rotulo = texto(metrica.label ?? metrica.rotulo)
    /* Número sem legenda não diz nada — descartado em vez de exibido solto. */
    if (!rotulo.pt) return

    metricas.push({
      id: typeof metrica.id === 'string' && metrica.id ? metrica.id : `m${indice}`,
      value: Number(metrica.value ?? metrica.valor) || 0,
      prefix: typeof metrica.prefix === 'string' ? metrica.prefix : undefined,
      suffix: textoOpcional(metrica.suffix ?? metrica.sufixo) ?? undefined,
      label: rotulo,
    })
  })

  return metricas
}

function paraGaleria(bruto: unknown, alt: Localized): MediaAsset[] {
  if (!Array.isArray(bruto)) return []

  const fotos: MediaAsset[] = []

  for (const item of bruto) {
    const foto = (item ?? {}) as Record<string, unknown>
    if (typeof foto.src !== 'string' || !foto.src) continue

    fotos.push({
      src: foto.src,
      width: Number(foto.width) > 0 ? Number(foto.width) : CAPA_LARGURA_PADRAO,
      height: Number(foto.height) > 0 ? Number(foto.height) : CAPA_ALTURA_PADRAO,
      alt: textoOpcional(foto.alt) ?? alt,
    })
  }

  return fotos
}

export function paraProjeto(linha: LinhaProjeto): Project {
  const nome = mesmoTexto(linha.nome)

  return {
    id: linha.id,
    slug: linha.slug,
    name: linha.nome,
    category: texto(linha.categoria),
    summary: texto(linha.resumo),
    description: lista(linha.descricao),
    objective: textoOpcional(linha.objetivo),
    audience: lista(linha.publico),
    locations: paraLocais(linha.locais),
    metrics: paraMetricas(linha.metricas),
    methodology: estruturaOpcional<{ title: string; text: string }>(linha.metodologia),
    results: listaOpcional(linha.resultados),
    gallery: paraGaleria(linha.galeria, nome),
    partnerIds: linha.parceiros ?? [],
    /* Mesma chave do registro estático (`content/media.ts`), e não uma
       chave só do painel: assim o projeto importado para o painel sem capa
       própria continua abrindo com a fotografia oficial já publicada, em
       vez de cair no painel da marca. Capa enviada pelo painel (`cover`,
       abaixo) continua valendo sobre ela. */
    coverKey: `project.${linha.slug}.cover`,
    cover: imagem(
      linha.capa_url,
      linha.capa_largura,
      linha.capa_altura,
      linha.capa_alt,
      nome,
    ),
  }
}
