/**
 * PRÉ-VISUALIZAÇÃO DE IMAGENS
 * ===========================
 * Ferramenta de trabalho, não é parte do site publicado.
 *
 * Enquanto as fotografias oficiais não chegam, as molduras exibem o painel
 * institucional. Para ver como o site fica *com* imagem, existe um conjunto
 * de imagens de mockup geradas por IA (`content/media-preview.ts`) e um
 * interruptor que alterna entre os dois estados.
 *
 * O interruptor e as imagens de mockup só entram no bundle quando isto é
 * verdadeiro — em produção, nada disso existe, a menos que a variável seja
 * ligada de propósito para uma build de apresentação ao cliente.
 */
export const previewImagesEnabled =
  process.env.NEXT_PUBLIC_PREVIEW_IMAGES === '1' ||
  process.env.NODE_ENV === 'development'

/**
 * CONTEÚDO DE EXEMPLO — notícias e documentos de transparência.
 *
 * Anda junto com as imagens de mockup, na mesma chave: material de
 * demonstração entra e sai de uma vez. Ligado, a página de Notícias e a de
 * Transparência aparecem preenchidas (ver `content/news-example.ts` e
 * `content/documents-example.ts`); desligado, as listas voltam a ser
 * vazias e as páginas exibem o estado vazio institucional — nenhuma
 * notícia ou documento inventado chega à build pública.
 */
export const exampleContentEnabled = previewImagesEnabled

/** Atributo em <html> que comanda o estado. */
export const PREVIEW_ATTRIBUTE = 'data-media-preview'

/** Chave no localStorage — a escolha sobrevive à navegação e ao reload. */
export const PREVIEW_STORAGE_KEY = 'aidep:media-preview'

/**
 * Aplica o estado salvo antes da primeira pintura, evitando o piscar entre
 * painel institucional e fotografia. Injetado como script inline no <head>.
 */
export const previewBootScript = `try{var v=localStorage.getItem(${JSON.stringify(
  PREVIEW_STORAGE_KEY,
)});document.documentElement.setAttribute(${JSON.stringify(
  PREVIEW_ATTRIBUTE,
)},v==="on"?"on":"off")}catch(e){}`
