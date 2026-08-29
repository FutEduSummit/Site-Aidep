import { getStockMedia } from './media-stock'
import type { MediaAsset } from './types'

/**
 * REGISTRO DE IMAGENS
 * ===================
 * Esta é a fonte da verdade das fotografias oficiais da AIDEP.
 *
 * Nenhuma fotografia foi entregue junto com o material de identidade, por
 * isso todas as chaves abaixo estão reservadas com `null`. Enquanto uma
 * chave é `null`, `getMedia()` cai na fotografia de banco equivalente em
 * `media-stock.ts` (Pexels, com crédito do fotógrafo) — assim o site pode
 * ser avaliado preenchido, sem nenhuma imagem inventada e sem nenhuma
 * imagem gerada por IA.
 *
 * Para publicar a foto oficial de uma chave:
 *   1. coloque o arquivo em `public/images/...` (WebP ou AVIF, quando possível);
 *   2. troque o `null` por um objeto MediaAsset com src, width, height e o
 *      texto alternativo nos três idiomas.
 *
 * A partir daí a foto oficial vale sempre, e a de banco deixa de aparecer.
 *
 * Exemplo:
 *   'home.hero': {
 *     src: '/images/home/hero.webp',
 *     width: 2560,
 *     height: 1100,
 *     alt: {
 *       pt: 'Crianças em treino de futebol em um polo esportivo da AIDEP',
 *       en: 'Children training football at an AIDEP sports hub',
 *       es: 'Niños entrenando fútbol en un polo deportivo de AIDEP',
 *     },
 *   },
 */
export const media: Record<string, MediaAsset | null> = {
  /* Página inicial */
  'home.hero': null,
  'home.about': null,
  'home.audience': null,
  'home.sport': null,
  'home.parasport': null,
  'home.presence': null,
  'home.contact': null,

  /* Faixas de fundo — fotografia sangrada atrás de uma seção inteira.
     Pedem imagem larga (21/9) e com espaço livre à esquerda, onde entra o
     texto. Ver `components/ui/section-banner.tsx`. */
  'home.impact.banner': null,
  'home.partnership.banner': null,
  'home.donate.banner': null,
  'page.projects.banner': null,
  'page.news.banner': null,
  'page.transparency.banner': null,
  'page.partners.banner': null,
  'page.donate.banner': null,

  /* Projetos */
  'project.coracao-valente.cover': null,
  'project.futsal-na-escola.cover': null,
  'project.futedu-summit.cover': null,

  /* Notícias */
  'news.futedu-summit-2026-inscricoes': null,
  'news.prestacao-de-contas-primeiro-semestre-2026': null,
  'news.coracao-valente-nova-turma-aracaju': null,
  'news.futsal-na-escola-formacao-de-professores': null,
  'news.oficinas-de-paradesporto-nos-polos': null,
  'news.articulacao-internacional-2027': null,
}

/**
 * Imagem de uma chave: a fotografia oficial se já houver, senão a de banco.
 * `null` só quando a chave não existe em nenhum dos dois registros — aí a
 * moldura exibe o painel institucional da marca.
 */
export function getMedia(key: string): MediaAsset | null {
  return media[key] ?? getStockMedia(key)
}

/**
 * Posts do Instagram publicados no site.
 * Não existe integração com a API do Instagram: os posts abaixo são
 * cadastrados manualmente. Enquanto a lista estiver vazia, a seção exibe
 * apenas a chamada para o perfil oficial.
 */
export type InstagramPost = {
  id: string
  url: string
  image: MediaAsset
  caption: string
}

export const instagramPosts: InstagramPost[] = []
