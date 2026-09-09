/**
 * SEMEIA O PAINEL COM CONTEÚDO INICIAL
 * ====================================
 *   npm run conteudo:semear -- <email> <senha>
 *
 * Leva para o Supabase o conteúdo que hoje mora no código:
 *
 *   • as 3 notícias mais recentes de `content/news-example.ts` — sem capa
 *     enviada, porque a fotografia de cada uma já está registrada no
 *     acervo (`content/media.ts`, chave `noticia.<slug>`);
 *   • os 12 documentos de `content/documents-example.ts` — o arquivo sobe
 *     para o Storage e a miniatura da primeira página é gerada aqui, do
 *     mesmo jeito que o painel faz quando o cliente envia um PDF.
 *
 * A partir daí o site passa a ler do banco e o cliente edita tudo pelo
 * painel. As listas de exemplo em `src/content` deixam de ser usadas
 * sozinhas: elas só voltam se as tabelas ficarem vazias de novo.
 *
 * ATENÇÃO — este é conteúdo de DEMONSTRAÇÃO. As notícias não relatam fato
 * ocorrido e cada documento traz a palavra EXEMPLO impressa na página.
 * Serve para o cliente ver o painel e o site preenchidos; tem de ser
 * substituído pelo conteúdo real antes do lançamento.
 *
 * Rodar de novo é seguro: atualiza pelo `slug` (notícias) e pelo `id`
 * (documentos) em vez de duplicar.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer-core'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publico = path.join(raiz, 'public')

const QUANTAS_NOTICIAS = 3

const [email, senha] = process.argv.slice(2)

if (!email || !senha) {
  console.error(
    'Uso: npm run conteudo:semear -- <email-do-admin> <senha>\n' +
      'A conta precisa estar liberada em public.admins (ver npm run admin:criar).',
  )
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const chave =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !chave) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL e a chave publicável no .env.')
  process.exit(1)
}

/* Endereço do site local — usado só para o Chrome abrir os PDFs e render a
   primeira página. Sem ele, os documentos entram sem miniatura. */
const SITE = process.env.SITE_LOCAL ?? 'http://localhost:3000'
const CHROME =
  process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const supabase = createClient(url, chave, {
  auth: { persistSession: false, autoRefreshToken: false },
})

/* ------------------------------------------------------------------ */
/* Miniaturas                                                          */
/* ------------------------------------------------------------------ */

/**
 * Renderiza a primeira página do PDF pelo visualizador do próprio Chrome.
 *
 * No painel isso acontece no navegador do cliente, com pdf.js. Aqui não há
 * navegador, então o Chrome headless faz o papel: abre o arquivo servido
 * pelo site local com a barra do visualizador escondida e fotografa a
 * página. O recorte tira a moldura escura que o visualizador desenha em
 * volta do papel.
 */
async function abrirNavegador() {
  try {
    return await puppeteer.launch({
      executablePath: CHROME,
      headless: 'new',
      args: ['--no-sandbox'],
    })
  } catch (erro) {
    console.warn(
      `\nNão foi possível abrir o Chrome (${erro.message.split('\n')[0]}).\n` +
        'Os documentos entram sem miniatura — dá para gerar depois reenviando\n' +
        'o arquivo pelo painel, onde a miniatura sai no próprio navegador.\n',
    )
    return null
  }
}

const LARGURA = 840
const ALTURA = 1188
const MOLDURA = 16

/**
 * Peso mínimo de uma miniatura que de fato mostra a página.
 *
 * O visualizador do Chrome pinta a página um instante depois do `load`, e
 * não avisa quando terminou — o `<embed>` é opaco ao DOM. Fotografar cedo
 * demais captura o fundo escuro dele, e o JPEG resultante é quase uniforme:
 * dá pouco mais de 6 kB. Uma página de texto real passa de 50 kB. O peso é,
 * portanto, o sinal disponível para saber se valeu a foto.
 */
const PESO_MINIMO = 15000
const ESPERAS = [4000, 5000, 8000]

/**
 * Uma aba só para todos os PDFs.
 *
 * Abrir uma aba por documento faz o visualizador de PDF do Chrome disputar
 * recursos com a instância anterior, que ainda está encerrando: parte das
 * fotografias sai antes de a página pintar. Reaproveitando a mesma aba, e
 * passando por `about:blank` entre um arquivo e outro, o plugin é um só e o
 * resultado fica estável.
 */
async function novaAbaDePdf(navegador) {
  if (!navegador) return null
  const pagina = await navegador.newPage()
  await pagina.setViewport({ width: LARGURA, height: ALTURA })
  return pagina
}

async function miniaturaDoPdf(pagina, caminhoPublico) {
  if (!pagina) return null

  /* Cada tentativa recarrega o arquivo. Esperar mais na mesma carga não
     resolve: quando o visualizador não pinta, ele não pinta mais — é preciso
     recomeçar. Falha uma tentativa em cada cinco, sem padrão por arquivo. */
  for (const espera of ESPERAS) {
    try {
      await pagina.goto('about:blank')
      await pagina.goto(
        `${SITE}${caminhoPublico}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`,
        { waitUntil: 'networkidle2', timeout: 45000 },
      )
      await new Promise((r) => setTimeout(r, espera))

      const imagem = await pagina.screenshot({
        type: 'jpeg',
        quality: 82,
        clip: {
          x: MOLDURA,
          y: MOLDURA,
          width: LARGURA - MOLDURA * 2,
          height: ALTURA - MOLDURA * 2,
        },
      })

      if (imagem.length >= PESO_MINIMO) return imagem
    } catch (erro) {
      console.warn(`\n   tentativa falhou: ${erro.message.split('\n')[0]}`)
    }
  }

  /* Nenhuma tentativa pintou a página: melhor documento sem miniatura do que
     um retângulo preto na tabela do site. */
  return null
}

/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */

async function enviar(bucket, caminho, conteudo, tipo) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(caminho, conteudo, {
      contentType: tipo,
      cacheControl: '31536000',
      upsert: true,
    })

  if (error) throw new Error(`${bucket}/${caminho}: ${error.message}`)

  return supabase.storage.from(bucket).getPublicUrl(caminho).data.publicUrl
}

const tipoDoFormato = {
  pdf: 'application/pdf',
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

/* ------------------------------------------------------------------ */
/* Notícias                                                            */
/* ------------------------------------------------------------------ */

async function semearNoticias() {
  const { exampleNews } = await import('../src/content/news-example.ts')

  const escolhidas = [...exampleNews]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, QUANTAS_NOTICIAS)

  console.log(`\nNotícias (${escolhidas.length})`)

  const linhas = escolhidas.map((noticia) => {
    /* A notícia entra sem capa de propósito. Quem dá a fotografia é o
       acervo: `content/media.ts` registra a chave `noticia.<slug>` de cada
       uma destas notícias, e `coverOf()` cai nela quando a linha do banco
       não traz capa enviada. Assim a demonstração já nasce com fotografia
       da associação — nada de imagem de banco — e o texto alternativo mora
       num lugar só. Quando o cliente subir a capa dele pelo painel, ela
       passa na frente. */
    return {
      slug: noticia.slug,
      titulo: noticia.title,
      resumo: noticia.excerpt,
      categoria: noticia.category,
      corpo: noticia.body,
      data: noticia.date,
      autor: noticia.author ?? null,
      capa_url: null,
      capa_path: null,
      capa_largura: null,
      capa_altura: null,
      capa_alt: {},
      projetos_relacionados: noticia.relatedProjectSlugs ?? [],
      publicado: true,
    }
  })

  const { error } = await supabase
    .from('noticias')
    .upsert(linhas, { onConflict: 'slug' })

  if (error) throw new Error(`notícias: ${error.message}`)

  for (const linha of linhas) console.log(`  ok  ${linha.slug}`)
}

/* ------------------------------------------------------------------ */
/* Documentos                                                          */
/* ------------------------------------------------------------------ */

async function semearDocumentos(abaDePdf) {
  const { exampleDocuments } = await import(
    '../src/content/documents-example.ts'
  )

  console.log(`\nDocumentos (${exampleDocuments.length})`)

  for (const documento of exampleDocuments) {
    const nomeDoArquivo = path.basename(documento.file)
    process.stdout.write(`  ·   ${documento.id} `)

    const conteudo = await readFile(path.join(publico, documento.file))

    const arquivoUrl = await enviar(
      'documentos',
      `${documento.year}/${nomeDoArquivo}`,
      conteudo,
      tipoDoFormato[documento.format] ?? 'application/octet-stream',
    )

    let miniaturaUrl = null
    let miniaturaPath = null

    if (documento.format === 'pdf') {
      const imagem = await miniaturaDoPdf(abaDePdf, documento.file)
      if (imagem) {
        miniaturaPath = `miniaturas/${nomeDoArquivo.replace(/\.pdf$/, '')}.jpg`
        miniaturaUrl = await enviar(
          'imagens',
          miniaturaPath,
          imagem,
          'image/jpeg',
        )
      }
    }

    const { error } = await supabase.from('documentos').upsert(
      {
        /* O id de exemplo é texto ("estatuto-social"), e a coluna é uuid.
           O `slug` do arquivo é o que dá idempotência aqui: procuramos a
           linha pelo caminho do arquivo antes de inserir. */
        titulo: documento.title,
        conteudo: documento.description ?? {},
        categoria_id: documento.category,
        ano: documento.year,
        publicado_em: documento.publishedAt,
        arquivo_url: arquivoUrl,
        arquivo_path: `${documento.year}/${nomeDoArquivo}`,
        arquivo_nome: nomeDoArquivo,
        formato: documento.format,
        tamanho_bytes: conteudo.length,
        miniatura_url: miniaturaUrl,
        miniatura_path: miniaturaPath,
        projeto_slug: documento.projectSlug ?? null,
        publicado: true,
      },
      { onConflict: 'arquivo_path' },
    )

    if (error) throw new Error(`${documento.id}: ${error.message}`)

    console.log(miniaturaUrl ? '— com miniatura' : '— sem miniatura')
  }
}

/* ------------------------------------------------------------------ */
/* Repescagem das miniaturas                                           */
/* ------------------------------------------------------------------ */

/**
 * Segunda passada: refaz só os PDFs que ficaram sem miniatura.
 *
 * O visualizador do Chrome falha de forma aleatória — em toda rodada um ou
 * dois arquivos diferentes não pintam a tempo. Como a falha não é do
 * arquivo, insistir resolve. Roda até não sobrar nenhum ou esgotar as
 * rodadas.
 */
async function completarMiniaturas(abaDePdf, rodadas = 4) {
  if (!abaDePdf) return

  for (let rodada = 1; rodada <= rodadas; rodada += 1) {
    const { data, error } = await supabase
      .from('documentos')
      .select('id, arquivo_nome')
      .eq('formato', 'pdf')
      .is('miniatura_url', null)

    if (error) throw new Error(`repescagem: ${error.message}`)
    if (!data || data.length === 0) {
      if (rodada > 1) console.log('\nTodos os PDFs estão com miniatura.')
      return
    }

    console.log(
      `\nRepescagem ${rodada} — ${data.length} PDF(s) ainda sem miniatura`,
    )

    for (const linha of data) {
      process.stdout.write(`  ·   ${linha.arquivo_nome} `)

      const caminhoPublico = `/documentos/exemplo/${linha.arquivo_nome}`
      const imagem = await miniaturaDoPdf(abaDePdf, caminhoPublico)

      if (!imagem) {
        console.log('— ainda não')
        continue
      }

      const miniaturaPath = `miniaturas/${linha.arquivo_nome.replace(/\.pdf$/, '')}.jpg`
      const miniaturaUrl = await enviar(
        'imagens',
        miniaturaPath,
        imagem,
        'image/jpeg',
      )

      const { error: erroAoGravar } = await supabase
        .from('documentos')
        .update({ miniatura_url: miniaturaUrl, miniatura_path: miniaturaPath })
        .eq('id', linha.id)

      if (erroAoGravar) throw new Error(`repescagem: ${erroAoGravar.message}`)
      console.log('— pronta')
    }
  }
}

/* ------------------------------------------------------------------ */

async function principal() {
  const { error: erroDeLogin } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  })

  if (erroDeLogin) {
    throw new Error(`Login recusado: ${erroDeLogin.message}`)
  }

  console.log(`Autenticado como ${email}.`)

  await semearNoticias()

  const navegador = await abrirNavegador()
  const abaDePdf = await novaAbaDePdf(navegador)
  try {
    await semearDocumentos(abaDePdf)
    await completarMiniaturas(abaDePdf)
  } finally {
    await navegador?.close().catch(() => {})
  }

  console.log(
    '\nPronto. O site agora lê estas notícias e estes documentos do banco,\n' +
      'e o cliente edita tudo em /admin.\n\n' +
      'O painel já mostra tudo. O site público leva até 5 minutos para trocar:\n' +
      'só o painel invalida o cache na hora (`updateTag`), e esta semeadura veio\n' +
      'de fora dele. Para ver na hora em desenvolvimento, apague\n' +
      '.next/cache/fetch-cache — ou salve qualquer item pelo painel.',
  )
}

principal().catch((erro) => {
  console.error('\n' + (erro?.message ?? erro))
  process.exitCode = 1
})
