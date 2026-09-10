/**
 * QUALIDADE DE ENTREGA DAS IMAGENS
 * ================================
 * O número que vai no `quality` de toda `next/image` que mostra fotografia
 * ou logomarca no site. Mora aqui, e não solto em cada componente, porque
 * ele precisa bater com `images.qualities` no `next.config.ts`: o
 * otimizador recusa com 400 qualquer valor que não esteja naquela lista.
 *
 * O ARQUIVO PUBLICADO NÃO É O ARQUIVO ENTREGUE
 * --------------------------------------------
 * `scripts/preparar-acervo.mjs` grava o acervo em AVIF q78 4:4:4. Nada
 * disso chega ao visitante como está: o `next/image` recomprime cada foto
 * no servidor, na largura que a tela pediu. É essa segunda passagem que
 * decide o que se vê — e é ela que este número governa.
 *
 * POR QUE 90, E NÃO O PADRÃO 75
 * -----------------------------
 * Porque 75 não quer dizer a mesma coisa nos dois formatos que o site
 * serve. O WebP recebe o número como está; o AVIF recebe `quality × 50/80`,
 * conversão do próprio Next (`server/image-optimizer.js`, calibrada por
 * dssim e ssimulacra2 para casar as duas escalas). Então:
 *
 *   quality 75  →  AVIF q47      (o que o site servia)
 *   quality 90  →  AVIF q56
 *
 * E AVIF é o que quase todo visitante recebe, porque é o primeiro da lista
 * em `formats`. Medido no quadro de abertura da Página inicial — a imagem
 * de LCP, a maior da página:
 *
 *   2560 px (monitor grande, DPR 2)   190 kB  →  264 kB
 *   1280 px (notebook comum)           58 kB  →   81 kB
 *
 * São 74 kB a mais na maior imagem da página, e é onde o acervo deixava de
 * ser o que foi preparado: gravado com croma completo e devolvido em q47.
 *
 * UM NÚMERO SÓ
 * ------------
 * A tentação é dar mais qualidade à faixa sangrada e menos ao cartão, ou o
 * contrário. Não vale a régua: o peso de uma imagem acompanha a área que
 * ela ocupa, então o cartão de 400 px já é barato em qualquer qualidade e a
 * faixa de 2560 px é caro em qualquer uma. O que sobra da divisão são dois
 * números para explicar e uma lista maior em `next.config.ts`.
 */
export const QUALIDADE_DA_IMAGEM = 90
