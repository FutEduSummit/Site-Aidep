import type { MediaAsset } from './types'

/**
 * REGISTRO DE IMAGENS
 * ===================
 * Nenhuma fotografia foi entregue junto com o material de identidade.
 * Todas as chaves abaixo estão reservadas com `null`: a interface exibe o
 * quadro institucional (grafismo oficial da marca) na proporção correta,
 * sem deformação e sem deslocamento de layout.
 *
 * Para publicar uma foto:
 *   1. coloque o arquivo em `public/images/...` (WebP ou AVIF, quando possível);
 *   2. troque o `null` da chave por um objeto MediaAsset com src, width,
 *      height e o texto alternativo nos três idiomas.
 *
 * Exemplo:
 *   'home.hero': {
 *     src: '/images/home/hero.webp',
 *     width: 2400,
 *     height: 1600,
 *     alt: {
 *       pt: 'Crianças em treino de futebol em um polo esportivo da AIDEP',
 *       en: 'Children training football at an AIDEP sports hub',
 *       es: 'Niños entrenando fútbol en un polo deportivo de AIDEP',
 *     },
 *   },
 */
export const media: Record<string, MediaAsset | null> = {
  'home.hero': null,
  'home.about': null,
  'home.sport': null,
  'home.parasport': null,
  'home.impact': null,
  'home.reach': null,

  'about.hero': null,
  'about.history': null,
  'about.method': null,

  'impact.hero': null,
  'impact.story': null,

  'project.coracao-valente.cover': null,
  'project.coracao-valente.hero': null,
  'project.futsal-na-escola.cover': null,
  'project.futsal-na-escola.hero': null,
  'project.futedu-summit.cover': null,
  'project.futedu-summit.hero': null,

  'partners.hero': null,
  'donate.hero': null,
  'contact.hero': null,
  'transparency.hero': null,
  'news.hero': null,
  'news.futedu-summit-2026-inscricoes': null,
  'news.prestacao-de-contas-primeiro-semestre-2026': null,
  'news.coracao-valente-nova-turma-aracaju': null,
  'news.futsal-na-escola-formacao-de-professores': null,
  'news.oficinas-de-paradesporto-nos-polos': null,
  'news.articulacao-internacional-2027': null,
}

export function getMedia(key: string): MediaAsset | null {
  return media[key] ?? null
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
