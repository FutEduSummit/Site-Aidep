/**
 * VÉU DAS FAIXAS DE FOTOGRAFIA
 * ============================
 * O véu que cobre a fotografia sangrada de uma seção não é decoração: sem
 * ele o contraste do texto passaria a depender da foto que estivesse no ar.
 *
 * Os valores moram aqui — e não em cada componente — porque duas peças
 * exibem a mesma faixa: a fotografia única (`ui/section-banner.tsx`) e o
 * carrossel do Hero (`ui/banner-carousel.tsx`). Um véu calibrado em um
 * lugar e esquecido no outro deixaria o Hero com contraste diferente do
 * resto do site.
 *
 * O VÉU É MOLDADO, NÃO UNIFORME
 * -----------------------------
 * Escurecer a faixa inteira por igual resolve o contraste e mata a
 * fotografia: no valor que segura texto miúdo sobre um realce estourado
 * (uma luz de ginásio, um céu claro), a imagem chega ao olho como uma
 * mancha cinza e não se distingue mais nada nela.
 *
 * Então cada faixa recebe **camadas empilhadas**: um véu de base baixo,
 * que só assenta a foto, e degradês que devolvem o escurecimento ao lugar
 * onde o texto realmente está. O que o texto não ocupa fica claro, e é
 * onde a fotografia aparece.
 *
 * As camadas saem na ordem de pintura e se compõem multiplicando o que
 * cada uma deixa passar: 30% e 60% empilhados não dão 90%, dão
 * 1 − (0,70 × 0,40) = 72%. É por isso que os números de cada camada
 * parecem baixos para o resultado que produzem.
 *
 * COMO CADA INTENSIDADE É MOLDADA
 * -------------------------------
 * - `base` — texto numa coluna à esquerda (Hero da Home, faixa de chamada).
 *   Escurece a esquerda, solta a direita, e reforça a beirada de baixo,
 *   onde ficam a chamada de rolagem e os indicadores do carrossel.
 * - `strong` — texto nas duas pontas (Hero das páginas, com título à
 *   esquerda e números no apoio à direita; faixa de indicadores, com
 *   cabeçalho em cima e a grade embaixo). Escurece topo e base, alivia a
 *   faixa do meio, e reforça a esquerda por baixo de tudo.
 *
 * QUEM MANDA NO LIMITE
 * --------------------
 * Não é o título: ele é branco e enorme, e passa folgado. É o **texto de
 * apoio miúdo** — o rótulo de 12px e a linha de apoio — que, no cinza da
 * superfície escura, obrigava o véu a chegar perto do preto. Por isso as
 * faixas escuras com fotografia sobem esse cinza para quase branco
 * (`[data-surface='dark'][data-sobre-foto]` em `globals.css`): é o que
 * libera o véu a clarear sem perder legibilidade.
 *
 * Ao mexer nestes números, confira o resultado sobre uma fotografia com
 * realce estourado — é ela que manda no contraste, não a foto média.
 */

export type BannerTone = 'dark' | 'brand' | 'light'
export type BannerStrength = 'base' | 'strong'

/**
 * As camadas de cada combinação, da mais ao fundo para a mais à frente.
 * Cada string é uma classe de fundo aplicada a um `absolute inset-0`.
 */
const layers = {
  dark: {
    /* A coluna de texto vai até cerca de metade da largura: o degradê
       segura ali e abre de vez no último terço, que é onde a fotografia
       aparece cheia. A camada de baixo é pela chamada de rolagem e pelos
       indicadores do carrossel, que ficam na beirada inferior. */
    base: [
      'bg-ink-950/26',
      'bg-linear-to-r from-ink-950/88 from-0% via-ink-950/70 via-50% to-transparent to-90%',
      'bg-linear-to-t from-ink-950/42 from-0% to-transparent to-38%',
    ],
    strong: [
      'bg-ink-950/34',
      'bg-linear-to-b from-ink-950/50 from-0% via-ink-950/18 via-42% to-ink-950/74 to-100%',
      'bg-linear-to-r from-ink-950/56 from-0% via-ink-950/18 via-62% to-transparent to-100%',
    ],
  },
  brand: {
    base: [
      'bg-brand-500/62',
      'bg-linear-to-r from-brand-600/72 from-0% via-brand-500/34 via-46% to-transparent to-92%',
    ],
    strong: [
      'bg-brand-500/70',
      'bg-linear-to-b from-brand-600/48 from-0% via-brand-500/14 via-46% to-brand-600/54 to-100%',
    ],
  },
  /* Tom claro: aqui o texto é escuro, então quem garante o contraste é o
     véu continuar opaco o bastante — o alívio vai para o lado sem texto,
     nunca para baixo dele. */
  light: {
    base: [
      'bg-paper/58',
      'bg-linear-to-r from-paper/90 from-0% via-paper/64 via-44% to-transparent to-90%',
    ],
    strong: [
      'bg-paper/66',
      'bg-linear-to-b from-paper/78 from-0% via-paper/42 via-46% to-paper/82 to-100%',
    ],
  },
} as const satisfies Record<BannerTone, Record<BannerStrength, readonly string[]>>

/**
 * As camadas do véu, na ordem em que devem ser pintadas. Quem chama
 * renderiza uma `<div absolute inset-0>` por item.
 */
export function bannerLayers(
  tone: BannerTone,
  strength: BannerStrength,
): readonly string[] {
  return layers[tone][strength]
}
