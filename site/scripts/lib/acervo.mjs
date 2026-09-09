/**
 * ACERVO OFICIAL DA AIDEP — SELEÇÃO
 * =================================
 * A lista do que entra no site a partir do acervo bruto entregue pela
 * associação (a pasta "Vídeos e Fotos", com mais de 14 GB de MOV em 4K e
 * HEIC de celular). As entregas seguem chegando por evento: além das
 * inaugurações dos polos em Sergipe, a pasta hoje tem "FUTEDU" (o Summit
 * de Curitiba) e "AIDEP - Futsal" (a quadra do Futsal na Escola).
 *
 * Esta é a curadoria — o que foi escolhido, com que nome e em que tamanho.
 * Quem transforma isso em arquivo de web é `scripts/preparar-acervo.mjs`;
 * quem publica no site é `src/content/media.ts` e `src/content/videos.ts`.
 *
 * Para trocar uma foto: mude o `origem` da chave (ou acrescente uma linha) e
 * rode `npm run acervo`. Nada mais precisa mudar — largura, altura e duração
 * são lidas do arquivo gerado, nunca digitadas à mão.
 *
 * O caminho do acervo bruto vem de ACERVO_ORIGEM, ou do padrão abaixo. A
 * pasta bruta **não** vai para o repositório: o que é versionado é só o
 * resultado em `public/`.
 */

export const ORIGEM_PADRAO = '../Vídeos e Fotos'

/* ------------------------------------------------------------------ */
/* Fotografias                                                        */
/* ------------------------------------------------------------------ */

/**
 * `largura` é o lado maior do arquivo publicado. As faixas de fundo
 * (sangradas na largura toda) pedem 2400; moldura e galeria, 1600.
 */
export const fotos = [
  /* Polo Estância (SE) */
  { nome: 'polo-estancia-comemoracao', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_1074.JPG', largura: 2400 },
  { nome: 'polo-estancia-comemoracao-2', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_1072.JPG', largura: 2400 },
  { nome: 'polo-estancia-time-no-campo', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0858.heic', largura: 2400 },
  { nome: 'polo-estancia-turma-reunida', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0855.heic', largura: 2000 },
  { nome: 'polo-estancia-roda-no-gramado', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0897.heic', largura: 2400 },
  { nome: 'polo-estancia-alegria', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_1070.JPG', largura: 1800 },
  { nome: 'polo-estancia-atencao', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_1073.JPG', largura: 1800 },
  { nome: 'polo-estancia-banco', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0848.heic', largura: 2000 },
  { nome: 'polo-estancia-entrega-chuteiras', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0827.heic', largura: 1800 },
  { nome: 'polo-estancia-entrega-kit', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0833.heic', largura: 1800 },
  { nome: 'polo-estancia-abertura', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0890.heic', largura: 2000 },

  /* Polo Bugio — Aracaju (SE) */
  { nome: 'polo-bugio-abertura', origem: 'Polo Bugio Inauguração-20260907T135227Z-1-001/Polo Bugio Inauguração/IMG_6665.heic', largura: 2400 },
  { nome: 'polo-bugio-comunidade', origem: 'Polo Bugio Inauguração-20260907T135227Z-1-001/Polo Bugio Inauguração/IMG_6633.heic', largura: 2400 },
  { nome: 'polo-bugio-na-rua', origem: 'Polo Bugio Inauguração-20260907T135227Z-1-001/Polo Bugio Inauguração/IMG_6625.heic', largura: 2000 },
  { nome: 'polo-bugio-turma', origem: 'Polo Bugio Inauguração-20260907T135227Z-1-001/Polo Bugio Inauguração/IMG_6623.heic', largura: 1800 },

  /* Polo Poço Verde (SE) */
  { nome: 'polo-poco-verde-plateia', origem: 'Polo Poço Verde-20260907T134819Z-1-001/Polo Poço Verde/IMG_1015.heic', largura: 2400 },
  { nome: 'polo-poco-verde-plateia-2', origem: 'Polo Poço Verde-20260907T134819Z-1-001/Polo Poço Verde/IMG_1013.heic', largura: 2000 },
  { nome: 'polo-poco-verde-time', origem: 'Polo Poço Verde-20260907T134819Z-1-001/Polo Poço Verde/IMG_0985.heic', largura: 2400 },
  { nome: 'polo-poco-verde-abertura', origem: 'Polo Poço Verde-20260907T134819Z-1-001/Polo Poço Verde/IMG_1028.heic', largura: 2000 },
  { nome: 'polo-poco-verde-cerimonia', origem: 'Polo Poço Verde-20260907T134819Z-1-001/Polo Poço Verde/IMG_1030.heic', largura: 2400 },

  /* FutEdu Summit — Curitiba (PR)
     O acervo do evento: o pórtico de entrada, a formação na universidade,
     o palco com a entrega dos certificados, o torneio e as delegações. */
  { nome: 'futedu-summit-portico', origem: 'FUTEDU/DJI_0005.JPG', largura: 2400 },
  { nome: 'futedu-summit-delegacoes', origem: 'FUTEDU/IMG_8475.JPG', largura: 2400 },
  { nome: 'futedu-summit-participantes', origem: 'FUTEDU/IMG_8463.JPG', largura: 2400 },
  { nome: 'futedu-summit-certificado', origem: 'FUTEDU/IMG_8352.JPG', largura: 1800 },
  { nome: 'futedu-summit-palco', origem: 'FUTEDU/IMG_8341.JPG', largura: 2000 },
  { nome: 'futedu-summit-formacao', origem: 'FUTEDU/IMG_1043.JPG', largura: 1280 },
  { nome: 'futedu-summit-na-arena', origem: 'FUTEDU/IMG_4249.JPG.jpeg', largura: 2400 },
  { nome: 'futedu-summit-time-na-arena', origem: 'FUTEDU/IMG_4311.JPG.jpeg', largura: 1600 },
  { nome: 'futedu-summit-torneio', origem: 'FUTEDU/IMG_8550.JPG', largura: 2400 },
  { nome: 'futedu-summit-hidratacao', origem: 'FUTEDU/IMG_8564.JPG', largura: 1800 },
  { nome: 'futedu-summit-jogo-na-quadra', origem: 'FUTEDU/IMG_8530.JPG', largura: 1800 },
  { nome: 'futedu-summit-painel-de-marcas', origem: 'FUTEDU/IMG_9544.JPG', largura: 1600 },

  /* Futsal na Escola — quadra coberta
     Chegaram por WhatsApp e por isso já vêm em 1600 px no lado maior: a
     `largura` aqui nunca pede mais do que o original tem (o `resize` não
     amplia), então a capa fica em 1600 e a galeria em 1400. */
  { nome: 'futsal-na-escola-turma', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.23.18.jpeg', largura: 1600 },
  { nome: 'futsal-na-escola-equipe', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.23.19 (2).jpeg', largura: 1400 },
  { nome: 'futsal-na-escola-uniforme', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.23.18 (1).jpeg', largura: 1400 },
  { nome: 'futsal-na-escola-treino', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.42.43 (1).jpeg', largura: 1400 },
  { nome: 'futsal-na-escola-jogo', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.42.44 (2).jpeg', largura: 1400 },
  { nome: 'futsal-na-escola-lateral', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.42.43.jpeg', largura: 1400 },
  { nome: 'futsal-na-escola-professor', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.42.44 (3).jpeg', largura: 1400 },
  { nome: 'futsal-na-escola-fim-da-atividade', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.42.45 (1).jpeg', largura: 1400 },

  /* Atividades e entrega de lanches */
  { nome: 'coracao-valente-trofeu', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 18.33.59 (2).jpeg', largura: 1400 },
  { nome: 'coracao-valente-treino', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 17.13.59 (3).jpeg', largura: 1400 },
  { nome: 'coracao-valente-corrida', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 18.34.02.jpeg', largura: 1400 },
  { nome: 'coracao-valente-encontro', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 17.14.04 (1).jpeg', largura: 1400 },
  { nome: 'coracao-valente-lanche', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 17.14.01.jpeg', largura: 1400 },
]

/* ------------------------------------------------------------------ */
/* Vídeos                                                             */
/* ------------------------------------------------------------------ */

/**
 * Todo o acervo de vídeo é vertical, gravado em celular. Publicamos em
 * 9/16, no máximo 720 px de largura — é a medida em que o vídeo aparece
 * na tela, e o que evita subir 4K para exibir um retrato de 400 px.
 *
 * `poster` é o instante (em segundos) do quadro de capa. `destaque` marca
 * o filme institucional, que é publicado com um pouco mais de qualidade.
 */
export const videos = [
  {
    nome: 'instituto-coracao-valente-16-polos',
    origem: 'VÍDEO INAUGURAÇÃO 16 POLOS-20260907T133750Z-1-001/VÍDEO INAUGURAÇÃO 16 POLOS/Editado/copy_6F8DF42A-2222-417C-91DC-5BAE8198D09B.mov',
    poster: 14.4,
    destaque: true,
  },
  { nome: 'polo-boquim-comemoracao', origem: 'VÍDEO INAUGURAÇÃO 16 POLOS-20260907T133750Z-1-001/VÍDEO INAUGURAÇÃO 16 POLOS/BOQUIM(4).MOV', poster: 3.5 },
  { nome: 'polo-porto-dantas-obrigado', origem: 'VÍDEO INAUGURAÇÃO 16 POLOS-20260907T133750Z-1-001/VÍDEO INAUGURAÇÃO 16 POLOS/PORTO DANTAS(2).MOV', poster: 3.4 },
  { nome: 'copa-coracao-valente-comemoracao', origem: 'Copa coração valente -20260907T135918Z-1-002/Copa coração valente/IMG_3943.MOV', poster: 5 },
  { nome: 'copa-coracao-valente-partida', origem: 'Copa coração valente -20260907T135918Z-1-002/Copa coração valente/IMG_3852.MOV', poster: 4 },
  { nome: 'polo-tobias-barreto-treino', origem: 'Copa coração valente -20260907T135918Z-1-002/Copa coração valente/Polo Tobias Barreto/IMG_3148.MOV', poster: 5 },
  { nome: 'polo-estancia-de-maos-dadas', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0863.MOV', poster: 7 },
  { nome: 'polo-estancia-aquecimento', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0867.MOV', poster: 3.4 },
  { nome: 'polo-estancia-treino-com-cones', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0872.MOV', poster: 6 },
  { nome: 'polo-poco-verde-treino-na-quadra', origem: 'Polo Poço Verde-20260907T134819Z-1-001/Polo Poço Verde/IMG_1008.MOV', poster: 7 },
]
