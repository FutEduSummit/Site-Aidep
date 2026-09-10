/**
 * LEVA NOTÍCIAS E DOCUMENTOS DO CÓDIGO PARA O PAINEL
 * ==================================================
 *   npm run conteudo:publicar
 *   npm run conteudo:publicar -- --so-noticias
 *   npm run conteudo:publicar -- --so-documentos
 *
 * Irmão de `publicar-projetos.mjs`, e existe pela mesma razão: assim que
 * as tabelas do Supabase têm linha, é delas que o site lê — escrever no
 * arquivo e recarregar a página não muda nada (ver `content/news.ts` e
 * `content/documents.ts`).
 *
 * O QUE ELE LEVA
 * --------------
 * - **As nove notícias de `content/news-real.ts`** — três por projeto,
 *   escritas a partir do briefing e do acervo. Sobem sem capa enviada: a
 *   fotografia de cada uma já está registrada em `content/media.ts` na
 *   chave `noticia.<slug>`, e é de lá que a página a busca.
 * - **Os dois documentos de `content/documents-real.ts`** — o painel do
 *   Transferegov e a planilha dos instrumentos assinados. Os arquivos
 *   ficam em `public/documentos/reais/`, versionados: não passam pelo
 *   Storage porque não foram enviados pelo painel.
 *
 * O QUE ELE APAGA — E O QUE NÃO
 * -----------------------------
 * Nada é apagado. O conteúdo de demonstração que estava no ar (as três
 * notícias e os doze documentos com a palavra EXEMPLO impressa) é apenas
 * **despublicado**: `publicado = false`. As linhas continuam no banco e o
 * cliente pode voltar qualquer uma pelo painel, com um clique.
 *
 * A razão de despublicar em vez de deixar convivendo é a página de
 * Transparência: prestação de contas real ao lado de prestação de contas
 * inventada é a única combinação que não se pode publicar, mesmo com a
 * segunda carimbada como exemplo.
 *
 * `--manter-exemplos` pula essa parte.
 */
import { register } from 'node:module'
import { conectar } from './lib/conexao.mjs'

register('./lib/alias.mjs', import.meta.url)

const { realNews } = await import('../src/content/news-real.ts')
const { realDocuments } = await import('../src/content/documents-real.ts')

const so = process.argv.includes('--so-noticias')
  ? 'noticias'
  : process.argv.includes('--so-documentos')
    ? 'documentos'
    : 'tudo'
const manterExemplos = process.argv.includes('--manter-exemplos')

const cliente = await conectar()

/* ------------------------------------------------------------------ */
/* Notícias                                                           */
/* ------------------------------------------------------------------ */

if (so === 'tudo' || so === 'noticias') {
  console.log(`\nNotícias (${realNews.length})`)

  for (const noticia of realNews) {
    await cliente.query(
      `insert into public.noticias
         (slug, titulo, resumo, corpo, categoria, data, autor,
          projetos_relacionados, publicado)
       values ($1,$2,$3,$4,$5,$6,$7,$8,true)
       on conflict (slug) do update set
         titulo    = excluded.titulo,
         resumo    = excluded.resumo,
         corpo     = excluded.corpo,
         categoria = excluded.categoria,
         data      = excluded.data,
         autor     = excluded.autor,
         projetos_relacionados = excluded.projetos_relacionados,
         publicado = true`,
      [
        noticia.slug,
        JSON.stringify(noticia.title),
        JSON.stringify(noticia.excerpt),
        JSON.stringify(noticia.body),
        JSON.stringify(noticia.category),
        noticia.date,
        noticia.author ?? null,
        noticia.relatedProjectSlugs,
      ],
    )
    console.log(`  ✓ ${noticia.slug}`)
  }

  if (!manterExemplos) {
    const slugs = realNews.map((n) => n.slug)
    const { rowCount } = await cliente.query(
      'update public.noticias set publicado = false where publicado = true and not (slug = any($1))',
      [slugs],
    )
    console.log(`  · ${rowCount} notícia(s) de demonstração despublicada(s)`)
  }
}

/* ------------------------------------------------------------------ */
/* Documentos                                                         */
/* ------------------------------------------------------------------ */

if (so === 'tudo' || so === 'documentos') {
  console.log(`\nDocumentos (${realDocuments.length})`)

  for (const documento of realDocuments) {
    await cliente.query(
      `insert into public.documentos
         (id, titulo, conteudo, categoria_id, ano, publicado_em,
          arquivo_url, arquivo_nome, formato, publicado)
       values (
         md5($1)::uuid, $2,$3,$4,$5,$6,$7,$8,$9,true)
       on conflict (id) do update set
         titulo       = excluded.titulo,
         conteudo     = excluded.conteudo,
         categoria_id = excluded.categoria_id,
         ano          = excluded.ano,
         publicado_em = excluded.publicado_em,
         arquivo_url  = excluded.arquivo_url,
         arquivo_nome = excluded.arquivo_nome,
         formato      = excluded.formato,
         publicado    = true`,
      [
        /* O id da tabela é uuid e o do código é um nome legível; o md5 do
           nome dá o mesmo uuid toda vez, e é o que faz rodar de novo
           atualizar em vez de duplicar. */
        documento.id,
        JSON.stringify(documento.title),
        JSON.stringify(documento.description ?? {}),
        documento.category,
        documento.year,
        documento.publishedAt,
        documento.file,
        documento.fileName ?? null,
        documento.format,
      ],
    )
    console.log(`  ✓ ${documento.id}`)
  }

  if (!manterExemplos) {
    const ids = realDocuments.map((d) => d.id)
    const { rowCount } = await cliente.query(
      `update public.documentos set publicado = false
        where publicado = true
          and not (id = any(select md5(x)::uuid from unnest($1::text[]) as x))`,
      [ids],
    )
    console.log(`  · ${rowCount} documento(s) de demonstração despublicado(s)`)
  }
}

await cliente.end()
console.log('\nPronto.\n')
