'use client'

/**
 * PRÉVIA DA PRIMEIRA PÁGINA DO PDF
 * ================================
 * A tabela de Transparência mostra a primeira página de cada documento.
 * Quando o arquivo entrou pelo painel, a miniatura já foi gerada no envio
 * e está no Storage (ver `lib/admin/storage.ts`). Este módulo cobre o
 * resto: documento semeado direto no banco, arquivo servido de /public, ou
 * envio em que a geração falhou — nesses casos a página é desenhada aqui,
 * no navegador de quem visita, e nunca no servidor.
 *
 * Três cuidados que fazem a diferença numa tabela com dezenas de linhas:
 *
 *   • cada arquivo é desenhado UMA vez por sessão (`prontas`) — filtrar,
 *     ordenar ou virar a página não redesenha nada;
 *   • pedidos simultâneos para o mesmo arquivo compartilham a mesma
 *     promessa (`emAndamento`), então duas linhas visíveis do mesmo PDF
 *     baixam o arquivo uma vez;
 *   • no máximo dois desenhos ao mesmo tempo (`LIMITE`) — sem isso, dez
 *     linhas visíveis abrem dez downloads e travam a rolagem.
 *
 * Falha de rede, PDF protegido ou corrompido devolvem `null`, e a linha
 * fica com o ícone do formato. Nada disso derruba a página.
 */

/** Largura do desenho. O dobro da moldura da tabela, para telas retina. */
const LARGURA = 224

/** Concluídas: URL do arquivo → imagem pronta, ou `null` se não deu. */
const prontas = new Map<string, string | null>()

/** Em curso: URL do arquivo → promessa que os interessados aguardam. */
const emAndamento = new Map<string, Promise<string | null>>()

let biblioteca: Promise<typeof import('pdfjs-dist')> | null = null

/** O pdf.js entra sob demanda: quem nunca abre a Transparência não o baixa. */
function carregarPdfjs() {
  biblioteca ??= import('pdfjs-dist').then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString()

    return pdfjs
  })

  return biblioteca
}

/* ------------------------------------------------------------------ */
/* Fila                                                                */
/* ------------------------------------------------------------------ */

const LIMITE = 2

let ativos = 0
const esperando: (() => void)[] = []

function vaga(): Promise<void> {
  if (ativos < LIMITE) {
    ativos += 1
    return Promise.resolve()
  }

  return new Promise((resolver) => {
    esperando.push(() => {
      ativos += 1
      resolver()
    })
  })
}

function liberar() {
  ativos -= 1
  esperando.shift()?.()
}

/* ------------------------------------------------------------------ */
/* Desenho                                                             */
/* ------------------------------------------------------------------ */

async function desenhar(url: string): Promise<string | null> {
  const pdfjs = await carregarPdfjs()
  const tarefa = pdfjs.getDocument({ url })

  try {
    const documento = await tarefa.promise
    const pagina = await documento.getPage(1)

    const original = pagina.getViewport({ scale: 1 })
    const visor = pagina.getViewport({ scale: LARGURA / original.width })

    const tela = document.createElement('canvas')
    tela.width = Math.round(visor.width)
    tela.height = Math.round(visor.height)

    const contexto = tela.getContext('2d')
    if (!contexto) return null

    /* PDF costuma ter fundo transparente; sem esta base, a prévia sai
       preta sobre o fundo escuro do tema. */
    contexto.fillStyle = '#ffffff'
    contexto.fillRect(0, 0, tela.width, tela.height)

    await pagina.render({ canvas: tela, canvasContext: contexto, viewport: visor })
      .promise

    return tela.toDataURL('image/webp', 0.8)
  } finally {
    /* Encerra o worker: sem isto, cada PDF desenhado deixa uma thread
       viva pelo resto da visita. */
    await tarefa.destroy()
  }
}

/**
 * Primeira página do PDF como imagem pronta para um `<img>`, ou `null`
 * quando não foi possível desenhar.
 */
export function previaDoPdf(url: string): Promise<string | null> {
  const pronta = prontas.get(url)
  if (pronta !== undefined) return Promise.resolve(pronta)

  const jaPedida = emAndamento.get(url)
  if (jaPedida) return jaPedida

  const tarefa = vaga()
    .then(() => desenhar(url))
    .catch((erro) => {
      console.error('[aidep] não foi possível desenhar a prévia do PDF:', erro)
      return null
    })
    .then((imagem) => {
      liberar()
      prontas.set(url, imagem)
      emAndamento.delete(url)
      return imagem
    })

  emAndamento.set(url, tarefa)
  return tarefa
}

/** Prévia já desenhada nesta sessão, para a primeira renderização não piscar. */
export function previaEmCache(url: string): string | null | undefined {
  return prontas.get(url)
}
