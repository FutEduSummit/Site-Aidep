/**
 * CONTEÚDO DE EXEMPLO — documentos de transparência.
 * =================================================
 * A AIDEP ainda não entregou os documentos reais. Para que a página de
 * Transparência possa ser avaliada e apresentada preenchida, o site carrega
 * por padrão doze documentos de demonstração, nos três idiomas (ver
 * `content/documents-example.ts`).
 *
 * Ligado (padrão), a página de Transparência aparece preenchida.
 * Desligado, a lista volta a ser vazia e a página exibe o estado vazio
 * institucional.
 *
 * Para desligar — quando os documentos reais entrarem no ar, ou para uma
 * build pública sem demonstração:
 *
 *     NEXT_PUBLIC_EXAMPLE_CONTENT=0
 *
 * Nada disso é conteúdo da AIDEP: cada documento traz a palavra EXEMPLO
 * marcada na página.
 *
 * As notícias não passam mais por aqui: a página de Notícias mostra
 * exclusivamente o que está publicado no banco (ver `content/news.ts`).
 */
export const exampleContentEnabled = process.env.NEXT_PUBLIC_EXAMPLE_CONTENT !== '0'
