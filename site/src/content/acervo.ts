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

/**
 * Vídeo horizontal da abertura da Página inicial. Diferente do clipe da
 * fileira, aqui a capa tem medida própria: ela é publicada em 2560 px,
 * porque é ela — e não o vídeo — a primeira imagem que a página mostra.
 */
export type ArquivoDeAbertura = ArquivoDeVideo & {
  capa: { width: number; height: number }
}

export const imagensDoAcervo = {
  'polo-estancia-comemoracao': { src: '/images/acervo/polo-estancia-comemoracao.avif', width: 1620, height: 1080 },
  'polo-estancia-comemoracao-2': { src: '/images/acervo/polo-estancia-comemoracao-2.avif', width: 1620, height: 1080 },
  'polo-estancia-time-no-campo': { src: '/images/acervo/polo-estancia-time-no-campo.avif', width: 2560, height: 1440 },
  'polo-estancia-turma-reunida': { src: '/images/acervo/polo-estancia-turma-reunida.avif', width: 2560, height: 1440 },
  'polo-estancia-roda-no-gramado': { src: '/images/acervo/polo-estancia-roda-no-gramado.avif', width: 2560, height: 1440 },
  'polo-estancia-alegria': { src: '/images/acervo/polo-estancia-alegria.avif', width: 2048, height: 1360 },
  'polo-estancia-atencao': { src: '/images/acervo/polo-estancia-atencao.avif', width: 1080, height: 1620 },
  'polo-estancia-banco': { src: '/images/acervo/polo-estancia-banco.avif', width: 2000, height: 1125 },
  'polo-estancia-entrega-chuteiras': { src: '/images/acervo/polo-estancia-entrega-chuteiras.avif', width: 1800, height: 1012 },
  'polo-estancia-entrega-kit': { src: '/images/acervo/polo-estancia-entrega-kit.avif', width: 1800, height: 1012 },
  'polo-estancia-abertura': { src: '/images/acervo/polo-estancia-abertura.avif', width: 2000, height: 1125 },
  'polo-estancia-caixas-de-chuteiras': { src: '/images/acervo/polo-estancia-caixas-de-chuteiras.avif', width: 1600, height: 900 },
  'polo-estancia-fala-na-abertura': { src: '/images/acervo/polo-estancia-fala-na-abertura.avif', width: 1600, height: 900 },
  'polo-estancia-foto-no-painel': { src: '/images/acervo/polo-estancia-foto-no-painel.avif', width: 1600, height: 900 },
  'polo-estancia-materiais-na-mesa': { src: '/images/acervo/polo-estancia-materiais-na-mesa.avif', width: 1600, height: 1067 },
  'polo-bugio-abertura': { src: '/images/acervo/polo-bugio-abertura.avif', width: 2560, height: 1440 },
  'polo-bugio-comunidade': { src: '/images/acervo/polo-bugio-comunidade.avif', width: 2560, height: 1440 },
  'polo-bugio-na-rua': { src: '/images/acervo/polo-bugio-na-rua.avif', width: 2000, height: 1125 },
  'polo-bugio-turma': { src: '/images/acervo/polo-bugio-turma.avif', width: 1800, height: 1012 },
  'polo-poco-verde-plateia': { src: '/images/acervo/polo-poco-verde-plateia.avif', width: 2560, height: 1440 },
  'polo-poco-verde-plateia-2': { src: '/images/acervo/polo-poco-verde-plateia-2.avif', width: 2000, height: 1125 },
  'polo-poco-verde-time': { src: '/images/acervo/polo-poco-verde-time.avif', width: 2560, height: 1440 },
  'polo-poco-verde-abertura': { src: '/images/acervo/polo-poco-verde-abertura.avif', width: 2000, height: 1125 },
  'polo-poco-verde-cerimonia': { src: '/images/acervo/polo-poco-verde-cerimonia.avif', width: 2560, height: 1440 },
  'polo-poco-verde-plateia-de-perto': { src: '/images/acervo/polo-poco-verde-plateia-de-perto.avif', width: 1400, height: 1050 },
  'futedu-summit-portico': { src: '/images/acervo/futedu-summit-portico.avif', width: 2560, height: 1440 },
  'futedu-summit-delegacoes': { src: '/images/acervo/futedu-summit-delegacoes.avif', width: 2400, height: 1600 },
  'futedu-summit-participantes': { src: '/images/acervo/futedu-summit-participantes.avif', width: 2400, height: 1600 },
  'futedu-summit-certificado': { src: '/images/acervo/futedu-summit-certificado.avif', width: 1800, height: 1200 },
  'futedu-summit-palco': { src: '/images/acervo/futedu-summit-palco.avif', width: 2000, height: 1333 },
  'futedu-summit-formacao': { src: '/images/acervo/futedu-summit-formacao.avif', width: 2000, height: 1325 },
  'futedu-summit-na-arena': { src: '/images/acervo/futedu-summit-na-arena.avif', width: 2560, height: 1104 },
  'futedu-summit-time-na-arena': { src: '/images/acervo/futedu-summit-time-na-arena.avif', width: 1600, height: 1200 },
  'futedu-summit-torneio': { src: '/images/acervo/futedu-summit-torneio.avif', width: 2400, height: 1600 },
  'futedu-summit-hidratacao': { src: '/images/acervo/futedu-summit-hidratacao.avif', width: 1800, height: 1200 },
  'futedu-summit-jogo-na-quadra': { src: '/images/acervo/futedu-summit-jogo-na-quadra.avif', width: 2000, height: 1333 },
  'futedu-summit-roda-de-time': { src: '/images/acervo/futedu-summit-roda-de-time.avif', width: 1800, height: 1318 },
  'futsal-na-escola-turma': { src: '/images/acervo/futsal-na-escola-turma.avif', width: 1600, height: 900 },
  'futsal-na-escola-equipe': { src: '/images/acervo/futsal-na-escola-equipe.avif', width: 900, height: 1600 },
  'futsal-na-escola-uniforme': { src: '/images/acervo/futsal-na-escola-uniforme.avif', width: 900, height: 1600 },
  'futsal-na-escola-treino': { src: '/images/acervo/futsal-na-escola-treino.avif', width: 1400, height: 787 },
  'futsal-na-escola-jogo': { src: '/images/acervo/futsal-na-escola-jogo.avif', width: 1400, height: 787 },
  'futsal-na-escola-lateral': { src: '/images/acervo/futsal-na-escola-lateral.avif', width: 1400, height: 787 },
  'futsal-na-escola-professor': { src: '/images/acervo/futsal-na-escola-professor.avif', width: 1400, height: 787 },
  'futsal-na-escola-fim-da-atividade': { src: '/images/acervo/futsal-na-escola-fim-da-atividade.avif', width: 1400, height: 787 },
  'futsal-na-escola-de-uniforme-na-quadra': { src: '/images/acervo/futsal-na-escola-de-uniforme-na-quadra.avif', width: 900, height: 1600 },
  'futsal-na-escola-atividade-na-quadra': { src: '/images/acervo/futsal-na-escola-atividade-na-quadra.avif', width: 1599, height: 899 },
  'futsal-na-escola-jogo-junto-ao-mural': { src: '/images/acervo/futsal-na-escola-jogo-junto-ao-mural.avif', width: 1599, height: 899 },
  'coracao-valente-trofeu': { src: '/images/acervo/coracao-valente-trofeu.avif', width: 719, height: 1280 },
  'coracao-valente-treino': { src: '/images/acervo/coracao-valente-treino.avif', width: 1400, height: 2489 },
  'coracao-valente-corrida': { src: '/images/acervo/coracao-valente-corrida.avif', width: 720, height: 1280 },
  'coracao-valente-encontro': { src: '/images/acervo/coracao-valente-encontro.avif', width: 1400, height: 2489 },
  'coracao-valente-lanche': { src: '/images/acervo/coracao-valente-lanche.avif', width: 1400, height: 2489 },
  'coracao-valente-campo-da-comunidade': { src: '/images/acervo/coracao-valente-campo-da-comunidade.avif', width: 1600, height: 900 },
  'coracao-valente-professor-no-campo': { src: '/images/acervo/coracao-valente-professor-no-campo.avif', width: 1100, height: 1956 },
  'coracao-valente-esperando-a-vez': { src: '/images/acervo/coracao-valente-esperando-a-vez.avif', width: 1100, height: 1956 },
  'coracao-valente-entrega-do-lanche': { src: '/images/acervo/coracao-valente-entrega-do-lanche.avif', width: 1100, height: 1956 },
  'coracao-valente-turma-sob-a-tenda': { src: '/images/acervo/coracao-valente-turma-sob-a-tenda.avif', width: 1600, height: 900 },
  'coracao-valente-lanche-e-mochila': { src: '/images/acervo/coracao-valente-lanche-e-mochila.avif', width: 964, height: 1600 },
  'coracao-valente-aquecimento-no-gramado': { src: '/images/acervo/coracao-valente-aquecimento-no-gramado.avif', width: 720, height: 1280 },
  'coracao-valente-kits-na-mesa': { src: '/images/acervo/coracao-valente-kits-na-mesa.avif', width: 960, height: 1280 },
  'coracao-valente-mesa-dos-lanches': { src: '/images/acervo/coracao-valente-mesa-dos-lanches.avif', width: 960, height: 1280 },
  'coracao-valente-camisas-do-projeto': { src: '/images/acervo/coracao-valente-camisas-do-projeto.avif', width: 720, height: 1280 },
  'coracao-valente-medalhas-da-copinha': { src: '/images/acervo/coracao-valente-medalhas-da-copinha.avif', width: 1200, height: 1600 },
  'futedu-summit-portico-com-a-equipe': { src: '/images/acervo/futedu-summit-portico-com-a-equipe.avif', width: 1280, height: 720 },
  'futedu-summit-portico-time-feminino': { src: '/images/acervo/futedu-summit-portico-time-feminino.avif', width: 1040, height: 585 },
  'futedu-summit-comissoes-no-palco': { src: '/images/acervo/futedu-summit-comissoes-no-palco.avif', width: 1320, height: 824 },
  'futedu-summit-credenciamento': { src: '/images/acervo/futedu-summit-credenciamento.avif', width: 1600, height: 1280 },
  'futedu-summit-feira-atendimento': { src: '/images/acervo/futedu-summit-feira-atendimento.avif', width: 1600, height: 1060 },
  'futedu-summit-feira-com-as-criancas': { src: '/images/acervo/futedu-summit-feira-com-as-criancas.avif', width: 1600, height: 1060 },
  'futedu-summit-chuteiras-na-feira': { src: '/images/acervo/futedu-summit-chuteiras-na-feira.avif', width: 1600, height: 1060 },
  'futedu-summit-a-caminho-da-quadra': { src: '/images/acervo/futedu-summit-a-caminho-da-quadra.avif', width: 1600, height: 1060 },
  'futedu-summit-plateia-no-auditorio': { src: '/images/acervo/futedu-summit-plateia-no-auditorio.avif', width: 1600, height: 1067 },
  'futedu-summit-plateia-atenta': { src: '/images/acervo/futedu-summit-plateia-atenta.avif', width: 1600, height: 1060 },
  'futedu-summit-mediacao-no-palco': { src: '/images/acervo/futedu-summit-mediacao-no-palco.avif', width: 1600, height: 1280 },
  'futedu-summit-cerimonia-de-abertura': { src: '/images/acervo/futedu-summit-cerimonia-de-abertura.avif', width: 1400, height: 1400 },
  'futedu-summit-sala-de-aula': { src: '/images/acervo/futedu-summit-sala-de-aula.avif', width: 1280, height: 960 },
  'futedu-summit-oficina-de-saude': { src: '/images/acervo/futedu-summit-oficina-de-saude.avif', width: 1600, height: 1200 },
  'futedu-summit-apresentacao-de-pesquisa': { src: '/images/acervo/futedu-summit-apresentacao-de-pesquisa.avif', width: 1200, height: 1600 },
  'futedu-summit-bola-na-linha': { src: '/images/acervo/futedu-summit-bola-na-linha.avif', width: 1600, height: 1067 },
  'futedu-summit-jogada-na-partida': { src: '/images/acervo/futedu-summit-jogada-na-partida.avif', width: 1600, height: 1067 },
  'futedu-summit-gol-comemorado': { src: '/images/acervo/futedu-summit-gol-comemorado.avif', width: 1600, height: 1067 },
  'futedu-summit-corrida-de-comemoracao': { src: '/images/acervo/futedu-summit-corrida-de-comemoracao.avif', width: 1100, height: 1655 },
  'futedu-summit-goleiro-comemora': { src: '/images/acervo/futedu-summit-goleiro-comemora.avif', width: 1100, height: 1650 },
  'futedu-summit-coracao-para-a-torcida': { src: '/images/acervo/futedu-summit-coracao-para-a-torcida.avif', width: 1100, height: 1650 },
  'futedu-summit-chute-da-atleta': { src: '/images/acervo/futedu-summit-chute-da-atleta.avif', width: 1277, height: 1600 },
  'futedu-summit-abraco-no-fim-do-jogo': { src: '/images/acervo/futedu-summit-abraco-no-fim-do-jogo.avif', width: 1200, height: 1595 },
  'futedu-summit-abraco-do-treinador': { src: '/images/acervo/futedu-summit-abraco-do-treinador.avif', width: 1100, height: 1650 },
  'futedu-summit-dupla-comemora': { src: '/images/acervo/futedu-summit-dupla-comemora.avif', width: 1100, height: 1650 },
  'futedu-summit-comemoracao-em-campo': { src: '/images/acervo/futedu-summit-comemoracao-em-campo.avif', width: 1100, height: 1650 },
  'futedu-summit-comemoracao-com-a-comissao': { src: '/images/acervo/futedu-summit-comemoracao-com-a-comissao.avif', width: 1100, height: 1650 },
  'futedu-summit-comemoracao-com-o-tecnico': { src: '/images/acervo/futedu-summit-comemoracao-com-o-tecnico.avif', width: 1600, height: 1067 },
  'futedu-summit-cumprimento-no-fim': { src: '/images/acervo/futedu-summit-cumprimento-no-fim.avif', width: 1600, height: 1188 },
  'futedu-summit-conversa-antes-do-jogo': { src: '/images/acervo/futedu-summit-conversa-antes-do-jogo.avif', width: 1600, height: 1067 },
  'futedu-summit-professor-na-trave': { src: '/images/acervo/futedu-summit-professor-na-trave.avif', width: 1060, height: 1598 },
  'futedu-summit-medalhas-no-podio': { src: '/images/acervo/futedu-summit-medalhas-no-podio.avif', width: 1600, height: 1066 },
  'futedu-summit-time-no-gramado': { src: '/images/acervo/futedu-summit-time-no-gramado.avif', width: 1600, height: 1067 },
  'futedu-summit-time-feminino-em-roda': { src: '/images/acervo/futedu-summit-time-feminino-em-roda.avif', width: 1600, height: 1063 },
  'futedu-summit-roda-no-gramado': { src: '/images/acervo/futedu-summit-roda-no-gramado.avif', width: 1600, height: 1067 },
  'futedu-summit-roda-antes-da-partida': { src: '/images/acervo/futedu-summit-roda-antes-da-partida.avif', width: 1600, height: 1067 },
  'futedu-summit-delegacao-no-campo': { src: '/images/acervo/futedu-summit-delegacao-no-campo.avif', width: 905, height: 679 },
  'futedu-summit-jovem-com-as-bolas': { src: '/images/acervo/futedu-summit-jovem-com-as-bolas.avif', width: 1600, height: 1067 },
  'futedu-summit-drible-na-quadra': { src: '/images/acervo/futedu-summit-drible-na-quadra.avif', width: 1100, height: 1661 },
  'futedu-summit-atleta-na-quadra': { src: '/images/acervo/futedu-summit-atleta-na-quadra.avif', width: 1100, height: 1661 },
  'futedu-summit-time-feminino-na-quadra': { src: '/images/acervo/futedu-summit-time-feminino-na-quadra.avif', width: 1600, height: 1067 },
  'futedu-summit-times-na-quadra': { src: '/images/acervo/futedu-summit-times-na-quadra.avif', width: 1207, height: 679 },
  'futedu-summit-grupo-na-quadra': { src: '/images/acervo/futedu-summit-grupo-na-quadra.avif', width: 1080, height: 762 },
  'futedu-summit-times-reunidos-na-quadra': { src: '/images/acervo/futedu-summit-times-reunidos-na-quadra.avif', width: 905, height: 679 },
  'futedu-summit-conversa-na-arena': { src: '/images/acervo/futedu-summit-conversa-na-arena.avif', width: 1600, height: 1067 },
  'futedu-summit-time-inclusivo-na-arena': { src: '/images/acervo/futedu-summit-time-inclusivo-na-arena.avif', width: 1600, height: 1067 },
  'futedu-summit-delegacao-na-arena': { src: '/images/acervo/futedu-summit-delegacao-na-arena.avif', width: 1600, height: 1067 },
  'futedu-summit-sala-de-trofeus': { src: '/images/acervo/futedu-summit-sala-de-trofeus.avif', width: 1600, height: 1067 },
  'futedu-summit-delegacao-internacional': { src: '/images/acervo/futedu-summit-delegacao-internacional.avif', width: 1600, height: 892 },
  'futedu-summit-time-inclusivo-perfilado': { src: '/images/acervo/futedu-summit-time-inclusivo-perfilado.avif', width: 1600, height: 663 },
  'futedu-summit-encontro-com-o-atleta': { src: '/images/acervo/futedu-summit-encontro-com-o-atleta.avif', width: 1200, height: 1600 },
  'futedu-summit-atletas-comemoram': { src: '/images/acervo/futedu-summit-atletas-comemoram.avif', width: 1600, height: 1060 },
  'futedu-summit-time-inclusivo-no-palco': { src: '/images/acervo/futedu-summit-time-inclusivo-no-palco.avif', width: 1600, height: 1060 },
  'futedu-summit-time-inclusivo-saudacao': { src: '/images/acervo/futedu-summit-time-inclusivo-saudacao.avif', width: 1600, height: 1060 },
  'futedu-summit-camisa-do-futsal-inclusivo': { src: '/images/acervo/futedu-summit-camisa-do-futsal-inclusivo.avif', width: 1600, height: 1060 },
  'futedu-summit-atleta-na-plateia': { src: '/images/acervo/futedu-summit-atleta-na-plateia.avif', width: 1600, height: 1060 },
  'futedu-summit-entrega-de-certificado': { src: '/images/acervo/futedu-summit-entrega-de-certificado.avif', width: 1600, height: 1060 },
  'futedu-summit-professoras-com-certificado': { src: '/images/acervo/futedu-summit-professoras-com-certificado.avif', width: 1600, height: 1060 },
  'futedu-summit-educadoras-no-palco': { src: '/images/acervo/futedu-summit-educadoras-no-palco.avif', width: 1600, height: 1060 },
  'futedu-summit-trofeu-no-palco': { src: '/images/acervo/futedu-summit-trofeu-no-palco.avif', width: 1400, height: 1400 },
  'futedu-summit-chute-a-gol': { src: '/images/acervo/futedu-summit-chute-a-gol.avif', width: 2560, height: 1707 },
  'futedu-summit-comemoracao-no-gol': { src: '/images/acervo/futedu-summit-comemoracao-no-gol.avif', width: 2560, height: 1706 },
  'futedu-summit-campos-do-alto': { src: '/images/acervo/futedu-summit-campos-do-alto.avif', width: 2560, height: 1440 },
  'futedu-summit-pavilhao-do-alto': { src: '/images/acervo/futedu-summit-pavilhao-do-alto.avif', width: 2560, height: 1440 },
  'futedu-summit-fila-da-hidratacao': { src: '/images/acervo/futedu-summit-fila-da-hidratacao.avif', width: 2400, height: 1600 },
} satisfies Record<string, ArquivoDeImagem>

export const videosDoAcervo = {
  'instituto-coracao-valente-16-polos': {
    src: '/videos/instituto-coracao-valente-16-polos.mp4',
    poster: '/videos/instituto-coracao-valente-16-polos.avif',
    width: 720,
    height: 1280,
    duration: 96,
  },
  'polo-boquim-comemoracao': {
    src: '/videos/polo-boquim-comemoracao.mp4',
    poster: '/videos/polo-boquim-comemoracao.avif',
    width: 540,
    height: 960,
    duration: 7,
  },
  'polo-porto-dantas-obrigado': {
    src: '/videos/polo-porto-dantas-obrigado.mp4',
    poster: '/videos/polo-porto-dantas-obrigado.avif',
    width: 540,
    height: 960,
    duration: 7,
  },
  'copa-coracao-valente-comemoracao': {
    src: '/videos/copa-coracao-valente-comemoracao.mp4',
    poster: '/videos/copa-coracao-valente-comemoracao.avif',
    width: 540,
    height: 960,
    duration: 10,
  },
  'copa-coracao-valente-partida': {
    src: '/videos/copa-coracao-valente-partida.mp4',
    poster: '/videos/copa-coracao-valente-partida.avif',
    width: 540,
    height: 960,
    duration: 12,
  },
  'polo-tobias-barreto-treino': {
    src: '/videos/polo-tobias-barreto-treino.mp4',
    poster: '/videos/polo-tobias-barreto-treino.avif',
    width: 540,
    height: 960,
    duration: 11,
  },
  'polo-estancia-de-maos-dadas': {
    src: '/videos/polo-estancia-de-maos-dadas.mp4',
    poster: '/videos/polo-estancia-de-maos-dadas.avif',
    width: 540,
    height: 960,
    duration: 16,
  },
  'polo-estancia-aquecimento': {
    src: '/videos/polo-estancia-aquecimento.mp4',
    poster: '/videos/polo-estancia-aquecimento.avif',
    width: 540,
    height: 960,
    duration: 7,
  },
  'polo-estancia-treino-com-cones': {
    src: '/videos/polo-estancia-treino-com-cones.mp4',
    poster: '/videos/polo-estancia-treino-com-cones.avif',
    width: 540,
    height: 960,
    duration: 13,
  },
  'polo-poco-verde-treino-na-quadra': {
    src: '/videos/polo-poco-verde-treino-na-quadra.mp4',
    poster: '/videos/polo-poco-verde-treino-na-quadra.avif',
    width: 540,
    height: 960,
    duration: 15,
  },
} satisfies Record<string, ArquivoDeVideo>

export const aberturasDoAcervo = {
  'futedu-summit-vista-aerea': {
    src: '/videos/futedu-summit-vista-aerea.mp4',
    poster: '/videos/futedu-summit-vista-aerea.avif',
    width: 1920,
    height: 1080,
    duration: 6,
    capa: { width: 2560, height: 1440 },
  },
  'futedu-summit-arena-do-alto': {
    src: '/videos/futedu-summit-arena-do-alto.mp4',
    poster: '/videos/futedu-summit-arena-do-alto.avif',
    width: 1920,
    height: 1080,
    duration: 5,
    capa: { width: 2560, height: 1440 },
  },
  'futedu-summit-feira-do-alto': {
    src: '/videos/futedu-summit-feira-do-alto.mp4',
    poster: '/videos/futedu-summit-feira-do-alto.avif',
    width: 1920,
    height: 1080,
    duration: 5,
    capa: { width: 2560, height: 1440 },
  },
  'futedu-summit-alameda-do-alto': {
    src: '/videos/futedu-summit-alameda-do-alto.mp4',
    poster: '/videos/futedu-summit-alameda-do-alto.avif',
    width: 1920,
    height: 1080,
    duration: 5,
    capa: { width: 2560, height: 1440 },
  },
  'futedu-summit-arena-inflavel-do-alto': {
    src: '/videos/futedu-summit-arena-inflavel-do-alto.mp4',
    poster: '/videos/futedu-summit-arena-inflavel-do-alto.avif',
    width: 1920,
    height: 1080,
    duration: 4,
    capa: { width: 2560, height: 1440 },
  },
  'futedu-summit-campus-do-alto': {
    src: '/videos/futedu-summit-campus-do-alto.mp4',
    poster: '/videos/futedu-summit-campus-do-alto.avif',
    width: 1920,
    height: 1080,
    duration: 7,
    capa: { width: 2560, height: 1440 },
  },
} satisfies Record<string, ArquivoDeAbertura>

export type ImagemDoAcervo = keyof typeof imagensDoAcervo
export type VideoDoAcervo = keyof typeof videosDoAcervo
export type AberturaDoAcervo = keyof typeof aberturasDoAcervo
