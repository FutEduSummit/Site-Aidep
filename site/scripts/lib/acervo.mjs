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
 * (sangradas na largura toda) pedem 2560 — a largura de um monitor
 * grande com folga para o corte; moldura e galeria, 1600.
 *
 * Nenhuma `largura` amplia o original: o `resize` do sharp trabalha com
 * `withoutEnlargement`, então pedir 2560 de uma foto que chegou com 1600
 * publica 1600, e não 1600 esticado.
 */
export const fotos = [
  /* Polo Estância (SE) */
  { nome: 'polo-estancia-comemoracao', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_1074.JPG', largura: 2560 },
  { nome: 'polo-estancia-comemoracao-2', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_1072.JPG', largura: 2560 },
  { nome: 'polo-estancia-time-no-campo', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0858.heic', largura: 2560 },
  /* Capa do Coração Valente, e por isso 2560 em vez dos 2000 da régua de
     galeria: na Página inicial esta moldura ocupa 56% da largura da tela
     (`sections/projects-showcase.tsx`) e é 16/10 contra os 16/9 da foto —
     em monitor grande com DPR 2, o recorte pede 2150 px de arquivo. Em 2000
     a capa chegava esticada 1,19×. O original tem 5712×3212, a folga
     existe. */
  { nome: 'polo-estancia-turma-reunida', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0855.heic', largura: 2560 },
  { nome: 'polo-estancia-roda-no-gramado', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0897.heic', largura: 2560 },
  /* A foto do professor com o menino no colo abre a faixa do esporte na
     Página inicial, e o original é o menor arquivo do lote de Estância:
     1620×1080. Ampliada para 2048×1360, a mesma cena aguenta a faixa
     sangrada sem chegar macia. A `largura` é a medida exata do arquivo
     ampliado — `withoutEnlargement` não inventaria pixel nenhum além. */
  { nome: 'polo-estancia-alegria', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_1070-upscale.png', largura: 2048 },
  { nome: 'polo-estancia-atencao', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_1073.JPG', largura: 1800 },
  { nome: 'polo-estancia-banco', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0848.heic', largura: 2000 },
  { nome: 'polo-estancia-entrega-chuteiras', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0827.heic', largura: 1800 },
  { nome: 'polo-estancia-entrega-kit', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0833.heic', largura: 1800 },
  { nome: 'polo-estancia-abertura', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0890.heic', largura: 2000 },
  /* A pasta de Estância tem 42 fotografias e onze estavam publicadas. As
     quatro abaixo são as cenas que faltavam, não outro ângulo do que já
     está no site: a pilha de caixas de chuteira antes da entrega, a fala
     de abertura ao microfone, a criança fotografada com a equipe no painel
     dos patrocinadores e a mesa com cone, colete e chuteira.

     As outras 27 são sequência de câmera — a mesma pose fotografada três,
     quatro, cinco vezes. `polo-estancia-banco`, `roda-no-gramado`,
     `turma-reunida`, `entrega-kit` e `entrega-chuteiras` já publicam esses
     instantes; repetir o quadro seguinte da mesma pose só faria a galeria
     parecer defeito. */
  { nome: 'polo-estancia-caixas-de-chuteiras', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0832.heic', largura: 1600 },
  { nome: 'polo-estancia-fala-na-abertura', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0889.heic', largura: 1600 },
  { nome: 'polo-estancia-foto-no-painel', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_0912.heic', largura: 1600 },
  { nome: 'polo-estancia-materiais-na-mesa', origem: 'Polo Estância -20260907T135055Z-1-001/Polo Estância/IMG_1071.JPG', largura: 1600 },

  /* Polo Bugio — Aracaju (SE) */
  { nome: 'polo-bugio-abertura', origem: 'Polo Bugio Inauguração-20260907T135227Z-1-001/Polo Bugio Inauguração/IMG_6665.heic', largura: 2560 },
  { nome: 'polo-bugio-comunidade', origem: 'Polo Bugio Inauguração-20260907T135227Z-1-001/Polo Bugio Inauguração/IMG_6633.heic', largura: 2560 },
  { nome: 'polo-bugio-na-rua', origem: 'Polo Bugio Inauguração-20260907T135227Z-1-001/Polo Bugio Inauguração/IMG_6625.heic', largura: 2000 },
  { nome: 'polo-bugio-turma', origem: 'Polo Bugio Inauguração-20260907T135227Z-1-001/Polo Bugio Inauguração/IMG_6623.heic', largura: 1800 },

  /* Polo Poço Verde (SE) */
  { nome: 'polo-poco-verde-plateia', origem: 'Polo Poço Verde-20260907T134819Z-1-001/Polo Poço Verde/IMG_1015.heic', largura: 2560 },
  { nome: 'polo-poco-verde-plateia-2', origem: 'Polo Poço Verde-20260907T134819Z-1-001/Polo Poço Verde/IMG_1013.heic', largura: 2000 },
  { nome: 'polo-poco-verde-time', origem: 'Polo Poço Verde-20260907T134819Z-1-001/Polo Poço Verde/IMG_0985.heic', largura: 2560 },
  { nome: 'polo-poco-verde-abertura', origem: 'Polo Poço Verde-20260907T134819Z-1-001/Polo Poço Verde/IMG_1028.heic', largura: 2000 },
  { nome: 'polo-poco-verde-cerimonia', origem: 'Polo Poço Verde-20260907T134819Z-1-001/Polo Poço Verde/IMG_1030.heic', largura: 2560 },
  /* A plateia de perto — a única cena de Poço Verde que a curadoria
     anterior não tinha, e vem de outra sessão (IMG_0219, e não da série
     IMG_098x/IMG_10xx). Onde `polo-poco-verde-plateia` mostra as fileiras
     inteiras, aqui a fotografia chega perto de quem está ouvindo. O
     arquivo é 4:3, e por isso pede 1400 e não 1600: a régua da galeria
     está no cabeçalho da segunda entrega do Summit, adiante. */
  { nome: 'polo-poco-verde-plateia-de-perto', origem: 'Polo Poço Verde-20260907T134819Z-1-001/Polo Poço Verde/IMG_0219.HEIC', largura: 1400 },

  /* FutEdu Summit — Curitiba (PR)
     O acervo do evento: o pórtico de entrada, a formação na universidade,
     o palco com a entrega dos certificados, o torneio e as delegações. */
  { nome: 'futedu-summit-portico', origem: 'FUTEDU/DJI_0005.JPG', largura: 2560 },
  { nome: 'futedu-summit-delegacoes', origem: 'FUTEDU/IMG_8475.JPG', largura: 2560 },
  { nome: 'futedu-summit-participantes', origem: 'FUTEDU/IMG_8463.JPG', largura: 2560 },
  { nome: 'futedu-summit-certificado', origem: 'FUTEDU/IMG_8352.JPG', largura: 1800 },
  { nome: 'futedu-summit-palco', origem: 'FUTEDU/IMG_8341.JPG', largura: 2000 },
  /* A única troca de `origem` desta rodada. A chave é a mesma — ela também
     é o cartão do público adulto na Página inicial (`home.audience.adults`
     em `content/media.ts`) —, mas o arquivo mudou: era IMG_1040.JPG, um
     1280×960 de celular com o formador diante de uma sala vazia. É pouco
     para ilustrar "formação de professores e treinadores" e era a foto de
     menor resolução do acervo. No lugar entra a sessão de fato, em
     4928×3264 da câmera do evento. O texto alternativo mudou junto, nos
     dois lugares em que a chave aparece. */
  { nome: 'futedu-summit-formacao', origem: 'FOTOS FUTEDU NOVAS MELHORES/SIGA @MDZ7DESIGN-106.jpg', largura: 2000 },
  { nome: 'futedu-summit-na-arena', origem: 'FUTEDU/IMG_4249.JPG.jpeg', largura: 2560 },
  { nome: 'futedu-summit-time-na-arena', origem: 'FUTEDU/IMG_4311.JPG.jpeg', largura: 1600 },
  { nome: 'futedu-summit-torneio', origem: 'FUTEDU/IMG_8550.JPG', largura: 2560 },
  { nome: 'futedu-summit-hidratacao', origem: 'FUTEDU/IMG_8564.JPG', largura: 1800 },
  { nome: 'futedu-summit-jogo-na-quadra', origem: 'FUTEDU/IMG_8511.JPG', largura: 2000 },
  { nome: 'futedu-summit-roda-de-time', origem: 'FUTEDU/IMG_4253.JPG.jpeg', largura: 1800 },

  /* Futsal na Escola — quadra coberta
     Chegaram por WhatsApp e por isso já vêm em 1600 px no lado maior: a
     `largura` aqui nunca pede mais do que o original tem (o `resize` não
     amplia), então a capa fica em 1600 e a galeria em 1400. */
  { nome: 'futsal-na-escola-turma', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.23.18.jpeg', largura: 1600 },
  { nome: 'futsal-na-escola-equipe', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.23.19 (2).jpeg', largura: 1400 },
  { nome: 'futsal-na-escola-uniforme', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.23.18 (1).jpeg', largura: 1400 },
  { nome: 'futsal-na-escola-treino', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.42.43 (1).jpeg', largura: 1400 },
  { nome: 'futsal-na-escola-jogo', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.42.45.jpeg', largura: 1400 },
  { nome: 'futsal-na-escola-lateral', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.42.43.jpeg', largura: 1400 },
  { nome: 'futsal-na-escola-professor', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.42.44.jpeg', largura: 1400 },
  { nome: 'futsal-na-escola-fim-da-atividade', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.42.45 (1).jpeg', largura: 1400 },

  /* O QUE SOBROU DA PASTA DO FUTSAL, E O QUE FICOU DE FORA
     ------------------------------------------------------
     A pasta "AIDEP - Futsal" tem catorze arquivos, de uma tarde só na
     mesma quadra. Oito já estavam publicados; destes seis, três entram e
     três não:

     - `14.23.19 (1)` é a mesma foto de turma que já está acima como
       `futsal-na-escola-turma` — o quadro seguinte da mesma pose.
     - `14.42.44 (1)` tem um jogador passando rente à lente: metade do
       quadro é borrão de movimento.
     - `14.42.44 (3)` repete o enquadramento de `jogo-junto-ao-mural`
       abaixo, com a quadra vazia à frente.

     Vale dizer o que isto significa: o acervo de fotografia deste projeto
     é uma sessão única. Enriquecer a galeria além daqui depende de nova
     entrega da associação — os vídeos da pasta bruta são todos do Coração
     Valente (Copinha no campo de terra e Copa no ginásio), nenhum desta
     quadra. */
  { nome: 'futsal-na-escola-de-uniforme-na-quadra', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.23.19.jpeg', largura: 900 },
  { nome: 'futsal-na-escola-atividade-na-quadra', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.42.43 (2).jpeg', largura: 1600 },
  { nome: 'futsal-na-escola-jogo-junto-ao-mural', origem: 'AIDEP - Futsal/WhatsApp Image 2026-09-03 at 14.42.44 (2).jpeg', largura: 1600 },

  /* Atividades e entrega de lanches */
  { nome: 'coracao-valente-trofeu', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 18.33.59 (2).jpeg', largura: 1400 },
  { nome: 'coracao-valente-treino', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 17.13.59 (3).jpeg', largura: 1400 },
  { nome: 'coracao-valente-corrida', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 18.34.02.jpeg', largura: 1400 },
  { nome: 'coracao-valente-encontro', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 17.14.04 (1).jpeg', largura: 1400 },
  { nome: 'coracao-valente-lanche', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 17.14.01.jpeg', largura: 1400 },

  /* O DIA DE ATIVIDADE NO DISTRITO FEDERAL — SEGUNDA LEVA
     =====================================================
     A pasta "Fotos Recebidas" tem 73 arquivos e só cinco estavam
     publicados. Os sete abaixo são os que contam o dia inteiro e não
     repetem quadro já publicado: o campo de terra da comunidade, o
     professor acompanhando o jogo, quem espera a vez sentado no muro, a
     entrega do lanche, a foto da turma sob a tenda e o aquecimento no
     gramado sintético.

     A `largura` cai para 1100 nos retratos: são 2268×4032 de celular, e
     pedir 1600 daria 2844 px de altura para aparecer numa coluna de 400
     px da galeria. Onde o arquivo já chega menor — 964 e 720 px, que é
     como o WhatsApp entregou —, a `largura` é a medida dele.

     Muita coisa ficou fora, e por dois motivos que se repetem: metade da
     pasta é o mesmo instante fotografado quatro ou cinco vezes (a leva
     "2026-08-18 10.46" é cópia byte a byte da "18.33/18.34", e o
     `md5` confirma), e vários quadros são a nuca de quem estava na frente
     da lente. */
  { nome: 'coracao-valente-campo-da-comunidade', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 17.13.58.jpeg', largura: 1600 },
  { nome: 'coracao-valente-professor-no-campo', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 17.13.59 (2).jpeg', largura: 1100 },
  { nome: 'coracao-valente-esperando-a-vez', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 17.14.02 (1).jpeg', largura: 1100 },
  { nome: 'coracao-valente-entrega-do-lanche', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 17.14.03.jpeg', largura: 1100 },
  { nome: 'coracao-valente-turma-sob-a-tenda', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 17.14.04 (3).jpeg', largura: 1600 },
  { nome: 'coracao-valente-lanche-e-mochila', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 17.14.27(2).jpeg', largura: 964 },
  { nome: 'coracao-valente-aquecimento-no-gramado', origem: 'Fotos Recebidas/Atividades e Entrega dos Lanches/WhatsApp Image 2026-08-17 at 18.34.00 (2).jpeg', largura: 720 },

  /* OS MATERIAIS ANTES DE CHEGAREM À CRIANÇA
     ----------------------------------------
     A subpasta "Materiais" estava inteira de fora — dez arquivos, nenhum
     publicado. É o outro lado da prestação de contas: a mochila, a
     camisa, o cone e a bola sobre a mesa, com o painel de patrocinador na
     frente. Três entram; as outras sete são saco preto e caixa fechada em
     depósito, que não dizem nada a quem visita.

     A quarta é da Copinha: as medalhas de fita azul na mesa, ao lado do
     leite em pó e das mochilas, antes da entrega. */
  { nome: 'coracao-valente-kits-na-mesa', origem: 'Fotos Recebidas/Materiais/WhatsApp Image 2026-08-17 at 17.02.01 (1).jpeg', largura: 960 },
  { nome: 'coracao-valente-mesa-dos-lanches', origem: 'Fotos Recebidas/Materiais/WhatsApp Image 2026-08-17 at 17.02.01.jpeg', largura: 960 },
  { nome: 'coracao-valente-camisas-do-projeto', origem: 'Fotos Recebidas/Materiais/WhatsApp Image 2026-08-17 at 17.02.44.jpeg', largura: 720 },
  { nome: 'coracao-valente-medalhas-da-copinha', origem: 'Copinha-20260907T135548Z-1-001/Copinha/IMG_9486.HEIC', largura: 1200 },

  /* FUTEDU SUMMIT — SEGUNDA ENTREGA, A DO FOTÓGRAFO DO EVENTO
     =========================================================
     A pasta "FOTOS FUTEDU NOVAS MELHORES" é outro acervo, não uma cópia
     melhor do primeiro: 4928×3264 de câmera profissional contra os
     2400×1600 do lote anterior, e sobretudo outras cenas — o torneio no
     gramado, a quadra coberta, a Arena da Baixada, o futsal inclusivo da
     CBDI e a feira. O primeiro lote era quase todo foto de grupo posada.

     SOBRE A `largura` DAQUI
     -----------------------
     O `resize` do sharp recebe uma LARGURA, não o lado maior. Retrato
     por isso pede número menor que paisagem: um 3264×4928 pedido em 1600
     sairia com 2415 px de altura para aparecer numa coluna de 400 px da
     galeria. A régua usada abaixo é paisagem 1600, quadrada 1400, retrato
     1060–1280 — e sangrada na tela 2560. Onde o original é menor que
     isso, a `largura` é a medida dele: `withoutEnlargement` não amplia,
     então pedir 1600 de um arquivo de 905 px publicaria 905 px, e deixar
     o número exato é o que deixa a curadoria honesta sobre o que existe. */

  /* Chegada e sede */
  { nome: 'futedu-summit-portico-com-a-equipe', origem: 'FOTOS FUTEDU NOVAS MELHORES/PHOTO-2025-07-02-20-59-23.jpg', largura: 1280 },
  { nome: 'futedu-summit-portico-time-feminino', origem: 'FOTOS FUTEDU NOVAS MELHORES/cd849257-965e-45dc-b9a5-5b27782c54a0.jpeg', largura: 1040 },
  { nome: 'futedu-summit-comissoes-no-palco', origem: 'FOTOS FUTEDU NOVAS MELHORES/IMG_5733.jpg', largura: 1320 },
  { nome: 'futedu-summit-credenciamento', origem: 'FOTOS FUTEDU NOVAS MELHORES/2Q0A6354.jpg', largura: 1600 },

  /* Feira do evento */
  { nome: 'futedu-summit-feira-atendimento', origem: 'FOTOS FUTEDU NOVAS MELHORES/SIGA @MDZ7DESIGN-118.jpg', largura: 1600 },
  { nome: 'futedu-summit-feira-com-as-criancas', origem: 'FOTOS FUTEDU NOVAS MELHORES/SIGA @MDZ7DESIGN-13.jpg', largura: 1600 },
  { nome: 'futedu-summit-chuteiras-na-feira', origem: 'FOTOS FUTEDU NOVAS MELHORES/SIGA @MDZ7DESIGN-40.jpg', largura: 1600 },
  { nome: 'futedu-summit-a-caminho-da-quadra', origem: 'FOTOS FUTEDU NOVAS MELHORES/SIGA @MDZ7DESIGN-33.jpg', largura: 1600 },

  /* Formação, palestras e plateia */
  { nome: 'futedu-summit-plateia-no-auditorio', origem: 'FOTOS FUTEDU NOVAS MELHORES/2Q0A8422.jpg', largura: 1600 },
  { nome: 'futedu-summit-plateia-atenta', origem: 'FOTOS FUTEDU NOVAS MELHORES/SIGA @MDZ7DESIGN-176.jpg', largura: 1600 },
  { nome: 'futedu-summit-mediacao-no-palco', origem: 'FOTOS FUTEDU NOVAS MELHORES/2Q0A6364.jpg', largura: 1600 },
  { nome: 'futedu-summit-cerimonia-de-abertura', origem: 'FOTOS FUTEDU NOVAS MELHORES/2Q0A8183.jpg', largura: 1400 },
  { nome: 'futedu-summit-sala-de-aula', origem: 'FOTOS FUTEDU NOVAS MELHORES/IMG_1043.JPG', largura: 1280 },
  { nome: 'futedu-summit-oficina-de-saude', origem: 'FOTOS FUTEDU NOVAS MELHORES/PHOTO-2025-06-21-16-57-37 2.jpg', largura: 1600 },
  { nome: 'futedu-summit-apresentacao-de-pesquisa', origem: 'FOTOS FUTEDU NOVAS MELHORES/f465abe5-f0cf-4187-8b1d-d38f0ea9e517.JPG', largura: 1200 },

  /* Torneio no gramado */
  { nome: 'futedu-summit-bola-na-linha', origem: 'FOTOS FUTEDU NOVAS MELHORES/0e378e61-72d5-488f-afca-e6f384e99ae7.JPG', largura: 1600 },
  { nome: 'futedu-summit-jogada-na-partida', origem: 'FOTOS FUTEDU NOVAS MELHORES/58111030-6521-43e8-9518-8771bbe1ea51.JPG', largura: 1600 },
  { nome: 'futedu-summit-gol-comemorado', origem: 'FOTOS FUTEDU NOVAS MELHORES/9d483511-e3c7-4f3f-b183-e1c6b5e6c151.JPG', largura: 1600 },
  { nome: 'futedu-summit-corrida-de-comemoracao', origem: 'FOTOS FUTEDU NOVAS MELHORES/9ebd9930-6eee-49a8-a7ec-7ffeb8ced334.JPG', largura: 1100 },
  { nome: 'futedu-summit-goleiro-comemora', origem: 'FOTOS FUTEDU NOVAS MELHORES/75a8635d-4469-4f2e-8ee6-3e9c5e369552.JPG', largura: 1100 },
  { nome: 'futedu-summit-coracao-para-a-torcida', origem: 'FOTOS FUTEDU NOVAS MELHORES/94bd48f1-d87b-4ea6-8226-f96b67d5d740.JPG', largura: 1100 },
  { nome: 'futedu-summit-chute-da-atleta', origem: 'FOTOS FUTEDU NOVAS MELHORES/a802a44f-ad69-42a2-a0b1-3963917911fb.JPG', largura: 1280 },
  { nome: 'futedu-summit-abraco-no-fim-do-jogo', origem: 'FOTOS FUTEDU NOVAS MELHORES/69fc580a-98c1-48a9-a097-d0ea908134b8.JPG', largura: 1200 },
  { nome: 'futedu-summit-abraco-do-treinador', origem: 'FOTOS FUTEDU NOVAS MELHORES/ebd8042d-0e49-487d-b57d-c2d882b75779.JPG', largura: 1100 },
  { nome: 'futedu-summit-dupla-comemora', origem: 'FOTOS FUTEDU NOVAS MELHORES/e0a8e409-9039-4238-8b5b-d15bb45748d8.JPG', largura: 1100 },
  { nome: 'futedu-summit-comemoracao-em-campo', origem: 'FOTOS FUTEDU NOVAS MELHORES/3b7616bc-b1d8-4edf-b910-61ba304dc116.JPG', largura: 1100 },
  { nome: 'futedu-summit-comemoracao-com-a-comissao', origem: 'FOTOS FUTEDU NOVAS MELHORES/7ea5c7eb-cdea-47f4-8d18-9acfaf9db6fb.JPG', largura: 1100 },
  { nome: 'futedu-summit-comemoracao-com-o-tecnico', origem: 'FOTOS FUTEDU NOVAS MELHORES/34d19c69-478b-47fb-a8e4-dbd4560e409a.JPG', largura: 1600 },
  { nome: 'futedu-summit-cumprimento-no-fim', origem: 'FOTOS FUTEDU NOVAS MELHORES/814efe3a-2887-4296-9e96-f441fbeb4922.JPG', largura: 1600 },
  /* Esta é a fotografia da tela de entrada do painel (`admin/componentes/
     moldura-de-entrada.tsx`), e por isso 2560 em vez dos 1600 da régua de
     galeria: lá ela é a coluna inteira, de altura de tela cheia, e o
     `object-cover` recorta pelos lados — em 1920×1080 com DPR 2 o recorte
     pede 3240 px de arquivo e o teto de entrega do site é 2560. O original
     tem 4160×2773, a folga existe. */
  { nome: 'futedu-summit-conversa-antes-do-jogo', origem: 'FOTOS FUTEDU NOVAS MELHORES/b3d1f2d4-fd82-4d8d-ad08-ab7d98e861ff.JPG', largura: 2560 },
  { nome: 'futedu-summit-professor-na-trave', origem: 'FOTOS FUTEDU NOVAS MELHORES/c11a96a4-5d8d-4bfe-8ec6-6b65f3809372.JPG', largura: 1060 },
  { nome: 'futedu-summit-medalhas-no-podio', origem: 'FOTOS FUTEDU NOVAS MELHORES/38ce5007-0e30-4eb4-9975-f054e8c01661.JPG', largura: 1600 },
  { nome: 'futedu-summit-time-no-gramado', origem: 'FOTOS FUTEDU NOVAS MELHORES/c96bfccf-a653-460d-9282-7d91f1375aec.JPG', largura: 1600 },
  { nome: 'futedu-summit-time-feminino-em-roda', origem: 'FOTOS FUTEDU NOVAS MELHORES/4eff1112-6f3e-4c51-b176-52de51ef06be.JPG', largura: 1600 },
  { nome: 'futedu-summit-roda-no-gramado', origem: 'FOTOS FUTEDU NOVAS MELHORES/IMG_0114.JPG', largura: 1600 },
  { nome: 'futedu-summit-roda-antes-da-partida', origem: 'FOTOS FUTEDU NOVAS MELHORES/IMG_0415.JPG', largura: 1600 },
  { nome: 'futedu-summit-delegacao-no-campo', origem: 'FOTOS FUTEDU NOVAS MELHORES/31a2d605-85cb-4952-8c65-153b38cb4834.jpg', largura: 905 },
  /* O cartão do público jovem na Página inicial (`home.audience.youth` em
     `content/media.ts`): um jovem da organização com as duas bolas do
     torneio, o gramado e as tendas do evento atrás. É o que o cartão
     promete — o caminho de formação para além de atleta. */
  { nome: 'futedu-summit-jovem-com-as-bolas', origem: 'FOTOS FUTEDU NOVAS MELHORES/IMG_0057.JPG', largura: 1600 },

  /* Quadra coberta */
  { nome: 'futedu-summit-drible-na-quadra', origem: 'FOTOS FUTEDU NOVAS MELHORES/SIGA @MDZ7DESIGN-32.jpg', largura: 1100 },
  { nome: 'futedu-summit-atleta-na-quadra', origem: 'FOTOS FUTEDU NOVAS MELHORES/SIGA @MDZ7DESIGN-22.jpg', largura: 1100 },
  { nome: 'futedu-summit-time-feminino-na-quadra', origem: 'FOTOS FUTEDU NOVAS MELHORES/IMG_0025.JPG', largura: 1600 },
  { nome: 'futedu-summit-times-na-quadra', origem: 'FOTOS FUTEDU NOVAS MELHORES/c1d58377-0d9a-4f2e-a31f-c464f20840ff.jpg', largura: 1207 },
  { nome: 'futedu-summit-grupo-na-quadra', origem: 'FOTOS FUTEDU NOVAS MELHORES/b1641343-9b6f-459f-b9d6-a287fd0bd91d.jpeg', largura: 1080 },
  { nome: 'futedu-summit-times-reunidos-na-quadra', origem: 'FOTOS FUTEDU NOVAS MELHORES/eefbf5b8-aa01-48a6-94a7-6ff885ade553.jpg', largura: 905 },

  /* Arena da Baixada */
  { nome: 'futedu-summit-conversa-na-arena', origem: 'FOTOS FUTEDU NOVAS MELHORES/CAP_6833.jpg', largura: 1600 },
  { nome: 'futedu-summit-time-inclusivo-na-arena', origem: 'FOTOS FUTEDU NOVAS MELHORES/CAP_6838.jpg', largura: 1600 },
  { nome: 'futedu-summit-delegacao-na-arena', origem: 'FOTOS FUTEDU NOVAS MELHORES/CAP_6845.jpg', largura: 1600 },
  { nome: 'futedu-summit-sala-de-trofeus', origem: 'FOTOS FUTEDU NOVAS MELHORES/CAP_6872.jpg', largura: 1600 },
  { nome: 'futedu-summit-delegacao-internacional', origem: 'FOTOS FUTEDU NOVAS MELHORES/PHOTO-2025-06-21-01-46-37(1).jpg', largura: 1600 },
  { nome: 'futedu-summit-time-inclusivo-perfilado', origem: 'FOTOS FUTEDU NOVAS MELHORES/PHOTO-2025-06-21-01-46-37.jpg', largura: 1600 },
  { nome: 'futedu-summit-encontro-com-o-atleta', origem: 'FOTOS FUTEDU NOVAS MELHORES/35d395a9-11f1-4c41-aede-ef853c81562e.jpeg', largura: 1200 },

  /* Futsal inclusivo — a delegação da CBDI no Summit */
  { nome: 'futedu-summit-atletas-comemoram', origem: 'FOTOS FUTEDU NOVAS MELHORES/SIGA @MDZ7DESIGN-189.jpg', largura: 1600 },
  { nome: 'futedu-summit-time-inclusivo-no-palco', origem: 'FOTOS FUTEDU NOVAS MELHORES/Cópia de SIGA @MDZ7DESIGN-317.jpg', largura: 1600 },
  { nome: 'futedu-summit-time-inclusivo-saudacao', origem: 'FOTOS FUTEDU NOVAS MELHORES/Cópia de SIGA @MDZ7DESIGN-320.jpg', largura: 1600 },
  { nome: 'futedu-summit-camisa-do-futsal-inclusivo', origem: 'FOTOS FUTEDU NOVAS MELHORES/SIGA @MDZ7DESIGN-264.jpg', largura: 1600 },
  { nome: 'futedu-summit-atleta-na-plateia', origem: 'FOTOS FUTEDU NOVAS MELHORES/SIGA @MDZ7DESIGN-53.jpg', largura: 1600 },

  /* Certificados e troféus */
  { nome: 'futedu-summit-entrega-de-certificado', origem: 'FOTOS FUTEDU NOVAS MELHORES/SIGA @MDZ7DESIGN-525.jpg', largura: 1600 },
  { nome: 'futedu-summit-professoras-com-certificado', origem: 'FOTOS FUTEDU NOVAS MELHORES/SIGA @MDZ7DESIGN-471.jpg', largura: 1600 },
  { nome: 'futedu-summit-educadoras-no-palco', origem: 'FOTOS FUTEDU NOVAS MELHORES/SIGA @MDZ7DESIGN-459.jpg', largura: 1600 },
  { nome: 'futedu-summit-trofeu-no-palco', origem: 'FOTOS FUTEDU NOVAS MELHORES/2Q0A8203.jpg', largura: 1400 },

  /* AS FOTOGRAFIAS DA ABERTURA DA PÁGINA INICIAL
     --------------------------------------------
     Estas cinco vão sangradas na largura da tela, atrás do título, e por
     isso pedem 2560 — as demais desta entrega aparecem na galeria do
     projeto, em coluna estreita.

     As duas de drone vêm de `Conteudo-HERO`, a pasta que o cliente montou
     só com material de abertura. O `..` do caminho sai de "Vídeos e Fotos"
     e entra nela: as duas são irmãs na raiz do projeto, e nenhuma das duas
     é versionada — o que vai para o repositório é só o resultado em
     `public/`. */
  { nome: 'futedu-summit-chute-a-gol', origem: 'FOTOS FUTEDU NOVAS MELHORES/6fc109cc-7d99-4a76-b1a4-876b4261e089.JPG', largura: 2560 },
  { nome: 'futedu-summit-comemoracao-no-gol', origem: 'FOTOS FUTEDU NOVAS MELHORES/c2f2ced6-8917-41bf-a128-a603c3839df0.JPG', largura: 2560 },
  { nome: 'futedu-summit-campos-do-alto', origem: '../Conteudo-HERO/DJI_0018.JPG', largura: 2560 },
  { nome: 'futedu-summit-pavilhao-do-alto', origem: '../Conteudo-HERO/DJI_0062.JPG', largura: 2560 },
  { nome: 'futedu-summit-fila-da-hidratacao', origem: 'FUTEDU/IMG_8560.JPG', largura: 2400 },
]

/* ------------------------------------------------------------------ */
/* Vídeos                                                             */
/* ------------------------------------------------------------------ */

/**
 * Quase todo o acervo de vídeo é vertical, gravado em celular — o que
 * chega em 1920×1080 vem com `rotation: -90` no metadado e é retrato na
 * tela. Esses são publicados em 9/16, no máximo 720 px de largura: é a
 * medida em que aparecem no site, e o que evita subir 4K para exibir um
 * retrato de 400 px.
 *
 * A exceção é o drone do FutEdu Summit, e é dele que sai a abertura da
 * Página inicial — ver `aberturas` adiante.
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

/* ------------------------------------------------------------------ */
/* Vídeos da abertura                                                 */
/* ------------------------------------------------------------------ */

/**
 * OS ÚNICOS VÍDEOS HORIZONTAIS DO ACERVO
 * ======================================
 * A abertura da Página inicial é sangrada na largura da tela, e vídeo em
 * pé não serve para ela: sobraria uma tira do meio, esticada. De todo o
 * acervo entregue, só as filmagens de drone do FutEdu Summit em Curitiba
 * são horizontais de verdade — o resto chega em 1920×1080 mas com
 * `rotation: -90`, isto é, retrato.
 *
 * Das quatro do drone, três entram. A quarta (DJI_0016) é uma caminhada
 * com o gimbal na mão: o braço de quem filma aparece no quadro e a
 * imagem embaça na virada. Não serve para ficar dez segundos no ar como
 * primeira coisa que alguém vê do site.
 *
 * COMO SÃO PUBLICADOS
 * -------------------
 * - **1920×1080.** Diferente dos clipes verticais, aqui a largura da tela
 *   é a largura do vídeo, e 540 px viraria um borrão.
 * - **Sem faixa de áudio.** A abertura toca muda e em laço; a trilha
 *   seria peso puro, e é o que permite gastar o orçamento todo em imagem.
 * - **Cortados.** `inicio` e `duracao` recortam o trecho que se sustenta
 *   em laço, sem o tranco do começo e do fim da tomada.
 *
 * `poster` é o instante do quadro de capa, contado a partir de `inicio` —
 * é a fotografia que abre a página enquanto o vídeo carrega, e a que fica
 * no ar para quem pediu menos movimento.
 */
export const aberturas = [
  {
    nome: 'futedu-summit-vista-aerea',
    origem: 'FUTEDU/DJI_0017.MP4',
    inicio: 0.4,
    duracao: 6.4,
    poster: 2,
  },
  {
    nome: 'futedu-summit-arena-do-alto',
    origem: 'FUTEDU/DJI_0064.MP4',
    inicio: 0.3,
    duracao: 4.5,
    poster: 1.6,
  },
  {
    nome: 'futedu-summit-feira-do-alto',
    origem: 'FUTEDU/DJI_0045.MP4',
    inicio: 0.3,
    duracao: 5.4,
    poster: 2,
  },

  /* AS TOMADAS DE `Conteudo-HERO`
     -----------------------------
     A pasta de abertura trouxe mais quatro arquivos de drone. Três entram
     aqui; a quarta, DJI_0017.MP4, é byte a byte a mesma tomada que já
     está publicada acima como `futedu-summit-vista-aerea` (mesmo md5), e
     republicá-la com outro nome poria a mesma imagem duas vezes no
     rodízio.

     Duas peças da pasta ficaram de fora, e não por curadoria:

     - **IMG_4244.MOV** chega em 3840×2160 mas com `rotation: -90` no
       metadado — é retrato. Numa faixa sangrada na largura da tela
       sobraria uma tira do meio, esticada; é o mesmo motivo que mantém
       todo o acervo vertical fora da abertura.
     - **e4bcc836-…-90462.mp4** é 848×478. A abertura publica em 1920, e
       subir de 848 para 1920 não devolve detalhe nenhum: entregaria um
       borrão como primeira imagem do site.

     As duas continuam no acervo bruto, prontas para a fileira de vídeos
     se um dia servirem a ela. */
  {
    nome: 'futedu-summit-alameda-do-alto',
    origem: '../Conteudo-HERO/DJI_0011.MP4',
    inicio: 0.3,
    duracao: 4.8,
    poster: 2,
  },
  {
    nome: 'futedu-summit-arena-inflavel-do-alto',
    origem: '../Conteudo-HERO/DJI_0029.MP4',
    inicio: 0.2,
    duracao: 3.9,
    poster: 1.5,
  },
  {
    nome: 'futedu-summit-campus-do-alto',
    origem: '../Conteudo-HERO/DJI_0994.MP4',
    inicio: 0.4,
    duracao: 6.8,
    poster: 2.5,
  },
]
