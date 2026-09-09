/**
 * ARQUIVO GERADO — não edite à mão.
 * Refaça com `npm run acervo` (ver `scripts/preparar-acervo.mjs`).
 *
 * Medidas reais dos arquivos publicados em `public/images/acervo` e
 * `public/videos`. Quem dá nome, legenda e destino a cada um é
 * `content/media.ts` (fotografias) e `content/videos.ts` (vídeos).
 */

export type ArquivoDeImagem = {
  src: string
  width: number
  height: number
}

export type ArquivoDeVideo = ArquivoDeImagem & {
  /** Capa exibida antes de o vídeo tocar. */
  poster: string
  /** Duração em segundos, arredondada. */
  duration: number
}

export const imagensDoAcervo = {
  'polo-estancia-comemoracao': { src: '/images/acervo/polo-estancia-comemoracao.webp', width: 1620, height: 1080 },
  'polo-estancia-comemoracao-2': { src: '/images/acervo/polo-estancia-comemoracao-2.webp', width: 1620, height: 1080 },
  'polo-estancia-time-no-campo': { src: '/images/acervo/polo-estancia-time-no-campo.webp', width: 2400, height: 1350 },
  'polo-estancia-turma-reunida': { src: '/images/acervo/polo-estancia-turma-reunida.webp', width: 2000, height: 1125 },
  'polo-estancia-roda-no-gramado': { src: '/images/acervo/polo-estancia-roda-no-gramado.webp', width: 2400, height: 1350 },
  'polo-estancia-alegria': { src: '/images/acervo/polo-estancia-alegria.webp', width: 1620, height: 1080 },
  'polo-estancia-atencao': { src: '/images/acervo/polo-estancia-atencao.webp', width: 1080, height: 1620 },
  'polo-estancia-banco': { src: '/images/acervo/polo-estancia-banco.webp', width: 2000, height: 1125 },
  'polo-estancia-entrega-chuteiras': { src: '/images/acervo/polo-estancia-entrega-chuteiras.webp', width: 1800, height: 1012 },
  'polo-estancia-entrega-kit': { src: '/images/acervo/polo-estancia-entrega-kit.webp', width: 1800, height: 1012 },
  'polo-estancia-abertura': { src: '/images/acervo/polo-estancia-abertura.webp', width: 2000, height: 1125 },
  'polo-bugio-abertura': { src: '/images/acervo/polo-bugio-abertura.webp', width: 2400, height: 1350 },
  'polo-bugio-comunidade': { src: '/images/acervo/polo-bugio-comunidade.webp', width: 2400, height: 1350 },
  'polo-bugio-na-rua': { src: '/images/acervo/polo-bugio-na-rua.webp', width: 2000, height: 1125 },
  'polo-bugio-turma': { src: '/images/acervo/polo-bugio-turma.webp', width: 1800, height: 1012 },
  'polo-poco-verde-plateia': { src: '/images/acervo/polo-poco-verde-plateia.webp', width: 2400, height: 1350 },
  'polo-poco-verde-plateia-2': { src: '/images/acervo/polo-poco-verde-plateia-2.webp', width: 2000, height: 1125 },
  'polo-poco-verde-time': { src: '/images/acervo/polo-poco-verde-time.webp', width: 2400, height: 1350 },
  'polo-poco-verde-abertura': { src: '/images/acervo/polo-poco-verde-abertura.webp', width: 2000, height: 1125 },
  'polo-poco-verde-cerimonia': { src: '/images/acervo/polo-poco-verde-cerimonia.webp', width: 2400, height: 1350 },
  'futedu-summit-portico': { src: '/images/acervo/futedu-summit-portico.webp', width: 2400, height: 1350 },
  'futedu-summit-delegacoes': { src: '/images/acervo/futedu-summit-delegacoes.webp', width: 2400, height: 1600 },
  'futedu-summit-participantes': { src: '/images/acervo/futedu-summit-participantes.webp', width: 2400, height: 1600 },
  'futedu-summit-certificado': { src: '/images/acervo/futedu-summit-certificado.webp', width: 1800, height: 1200 },
  'futedu-summit-palco': { src: '/images/acervo/futedu-summit-palco.webp', width: 2000, height: 1333 },
  'futedu-summit-formacao': { src: '/images/acervo/futedu-summit-formacao.webp', width: 1280, height: 960 },
  'futedu-summit-na-arena': { src: '/images/acervo/futedu-summit-na-arena.webp', width: 2400, height: 1035 },
  'futedu-summit-time-na-arena': { src: '/images/acervo/futedu-summit-time-na-arena.webp', width: 1600, height: 1200 },
  'futedu-summit-torneio': { src: '/images/acervo/futedu-summit-torneio.webp', width: 2400, height: 1600 },
  'futedu-summit-hidratacao': { src: '/images/acervo/futedu-summit-hidratacao.webp', width: 1800, height: 1200 },
  'futedu-summit-jogo-na-quadra': { src: '/images/acervo/futedu-summit-jogo-na-quadra.webp', width: 1800, height: 1200 },
  'futedu-summit-painel-de-marcas': { src: '/images/acervo/futedu-summit-painel-de-marcas.webp', width: 1600, height: 1067 },
  'futsal-na-escola-turma': { src: '/images/acervo/futsal-na-escola-turma.webp', width: 1600, height: 900 },
  'futsal-na-escola-equipe': { src: '/images/acervo/futsal-na-escola-equipe.webp', width: 900, height: 1600 },
  'futsal-na-escola-uniforme': { src: '/images/acervo/futsal-na-escola-uniforme.webp', width: 900, height: 1600 },
  'futsal-na-escola-treino': { src: '/images/acervo/futsal-na-escola-treino.webp', width: 1400, height: 787 },
  'futsal-na-escola-jogo': { src: '/images/acervo/futsal-na-escola-jogo.webp', width: 1400, height: 787 },
  'futsal-na-escola-lateral': { src: '/images/acervo/futsal-na-escola-lateral.webp', width: 1400, height: 787 },
  'futsal-na-escola-professor': { src: '/images/acervo/futsal-na-escola-professor.webp', width: 1400, height: 787 },
  'futsal-na-escola-fim-da-atividade': { src: '/images/acervo/futsal-na-escola-fim-da-atividade.webp', width: 1400, height: 787 },
  'coracao-valente-trofeu': { src: '/images/acervo/coracao-valente-trofeu.webp', width: 719, height: 1280 },
  'coracao-valente-treino': { src: '/images/acervo/coracao-valente-treino.webp', width: 1400, height: 2489 },
  'coracao-valente-corrida': { src: '/images/acervo/coracao-valente-corrida.webp', width: 720, height: 1280 },
  'coracao-valente-encontro': { src: '/images/acervo/coracao-valente-encontro.webp', width: 1400, height: 2489 },
  'coracao-valente-lanche': { src: '/images/acervo/coracao-valente-lanche.webp', width: 1400, height: 2489 },
} satisfies Record<string, ArquivoDeImagem>

export const videosDoAcervo = {
  'instituto-coracao-valente-16-polos': {
    src: '/videos/instituto-coracao-valente-16-polos.mp4',
    poster: '/videos/instituto-coracao-valente-16-polos.webp',
    width: 720,
    height: 1280,
    duration: 96,
  },
  'polo-boquim-comemoracao': {
    src: '/videos/polo-boquim-comemoracao.mp4',
    poster: '/videos/polo-boquim-comemoracao.webp',
    width: 540,
    height: 960,
    duration: 7,
  },
  'polo-porto-dantas-obrigado': {
    src: '/videos/polo-porto-dantas-obrigado.mp4',
    poster: '/videos/polo-porto-dantas-obrigado.webp',
    width: 540,
    height: 960,
    duration: 7,
  },
  'copa-coracao-valente-comemoracao': {
    src: '/videos/copa-coracao-valente-comemoracao.mp4',
    poster: '/videos/copa-coracao-valente-comemoracao.webp',
    width: 540,
    height: 960,
    duration: 10,
  },
  'copa-coracao-valente-partida': {
    src: '/videos/copa-coracao-valente-partida.mp4',
    poster: '/videos/copa-coracao-valente-partida.webp',
    width: 540,
    height: 960,
    duration: 12,
  },
  'polo-tobias-barreto-treino': {
    src: '/videos/polo-tobias-barreto-treino.mp4',
    poster: '/videos/polo-tobias-barreto-treino.webp',
    width: 540,
    height: 960,
    duration: 11,
  },
  'polo-estancia-de-maos-dadas': {
    src: '/videos/polo-estancia-de-maos-dadas.mp4',
    poster: '/videos/polo-estancia-de-maos-dadas.webp',
    width: 540,
    height: 960,
    duration: 16,
  },
  'polo-estancia-aquecimento': {
    src: '/videos/polo-estancia-aquecimento.mp4',
    poster: '/videos/polo-estancia-aquecimento.webp',
    width: 540,
    height: 960,
    duration: 7,
  },
  'polo-estancia-treino-com-cones': {
    src: '/videos/polo-estancia-treino-com-cones.mp4',
    poster: '/videos/polo-estancia-treino-com-cones.webp',
    width: 540,
    height: 960,
    duration: 13,
  },
  'polo-poco-verde-treino-na-quadra': {
    src: '/videos/polo-poco-verde-treino-na-quadra.mp4',
    poster: '/videos/polo-poco-verde-treino-na-quadra.webp',
    width: 540,
    height: 960,
    duration: 15,
  },
} satisfies Record<string, ArquivoDeVideo>

export type ImagemDoAcervo = keyof typeof imagensDoAcervo
export type VideoDoAcervo = keyof typeof videosDoAcervo
