/**
 * CONTEÚDO DE EXEMPLO — notícias e documentos de transparência.
 * ============================================================
 * A AIDEP ainda não entregou notícias nem documentos reais. Para que o
 * site possa ser avaliado e apresentado preenchido, ele carrega por padrão
 * um conjunto de demonstração: seis notícias e doze documentos, nos três
 * idiomas (ver `content/news-example.ts` e `content/documents-example.ts`).
 *
 * Ligado (padrão), a página de Notícias e a de Transparência aparecem
 * preenchidas, a Home mostra a seção de notícias e o sitemap gera as URLs.
 * Desligado, as listas voltam a ser vazias e as páginas exibem o estado
 * vazio institucional.
 *
 * Para desligar — quando o conteúdo real entrar no ar, ou para uma build
 * pública sem demonstração:
 *
 *     NEXT_PUBLIC_EXAMPLE_CONTENT=0
 *
 * Nada disso é conteúdo da AIDEP: as notícias não relatam fato ocorrido e
 * cada documento traz a palavra EXEMPLO marcada na página.
 */
export const exampleContentEnabled = process.env.NEXT_PUBLIC_EXAMPLE_CONTENT !== '0'
