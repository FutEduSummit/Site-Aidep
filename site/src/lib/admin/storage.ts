'use client'

import { bucketDocumentos, bucketImagens } from '@/lib/supabase/config'
import { clienteNavegador } from '@/lib/supabase/navegador'

/**
 * ENVIO DE ARQUIVO
 * ================
 * O arquivo vai do computador do cliente direto para o Storage do
 * Supabase, sem passar pelo servidor do site. Isso importa por dois
 * motivos: Server Action tem limite de corpo bem menor que um PDF de
 * prestação de contas, e o envio direto mostra progresso de verdade.
 *
 * Quem autoriza é o RLS do bucket: só quem está na tabela `admins`
 * consegue gravar (ver a migração). A chave publicável no navegador não
 * dá poder nenhum a mais.
 */

export type ArquivoEnviado = {
  url: string
  /** Caminho dentro do bucket — guardado para poder apagar depois. */
  path: string
  nome: string
  tamanho: number
}

export type ImagemEnviada = ArquivoEnviado & {
  largura: number
  altura: number
}

/** Nome de arquivo previsível: sem acento, sem espaço, sem surpresa na URL. */
function nomeSeguro(nome: string): string {
  const ponto = nome.lastIndexOf('.')
  const base = ponto > 0 ? nome.slice(0, ponto) : nome
  const extensao = ponto > 0 ? nome.slice(ponto + 1).toLowerCase() : ''

  const limpo =
    base
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'arquivo'

  const carimbo = Date.now().toString(36)
  return extensao ? `${carimbo}-${limpo}.${extensao}` : `${carimbo}-${limpo}`
}

export function formatoDoArquivo(
  arquivo: File,
): 'pdf' | 'xlsx' | 'csv' | 'doc' | 'docx' | 'imagem' | 'outro' {
  const nome = arquivo.name.toLowerCase()

  if (nome.endsWith('.pdf')) return 'pdf'
  if (nome.endsWith('.xlsx') || nome.endsWith('.xls')) return 'xlsx'
  if (nome.endsWith('.csv')) return 'csv'
  if (nome.endsWith('.docx')) return 'docx'
  if (nome.endsWith('.doc')) return 'doc'
  if (arquivo.type.startsWith('image/')) return 'imagem'
  return 'outro'
}

async function enviar(
  bucket: string,
  pasta: string,
  arquivo: Blob,
  nomeOriginal: string,
): Promise<ArquivoEnviado> {
  const supabase = clienteNavegador()
  const caminho = `${pasta}/${nomeSeguro(nomeOriginal)}`

  const { error } = await supabase.storage.from(bucket).upload(caminho, arquivo, {
    cacheControl: '31536000',
    upsert: false,
    contentType: arquivo.type || undefined,
  })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(bucket).getPublicUrl(caminho)

  return {
    url: data.publicUrl,
    path: caminho,
    nome: nomeOriginal,
    tamanho: arquivo.size,
  }
}

/** PDF, planilha ou documento da transparência. */
export function enviarDocumento(arquivo: File, ano: number) {
  return enviar(bucketDocumentos, String(ano), arquivo, arquivo.name)
}

/** Capa de notícia ou de projeto, foto de galeria. */
export async function enviarImagem(
  arquivo: File,
  pasta = 'capas',
): Promise<ImagemEnviada> {
  const [enviado, medidas] = await Promise.all([
    enviar(bucketImagens, pasta, arquivo, arquivo.name),
    medirImagem(arquivo),
  ])

  return { ...enviado, ...medidas }
}

/** Miniatura gerada do PDF — vai para o bucket de imagens, não o de documentos. */
export function enviarMiniatura(imagem: Blob, nomeBase: string) {
  return enviar(bucketImagens, 'miniaturas', imagem, `${nomeBase}.webp`)
}

/* ------------------------------------------------------------------ */
/* Medidas e miniatura                                                */
/* ------------------------------------------------------------------ */

/** Largura e altura reais — o `next/image` precisa delas para reservar o espaço. */
export function medirImagem(
  arquivo: Blob,
): Promise<{ largura: number; altura: number }> {
  return new Promise((resolver) => {
    const endereco = URL.createObjectURL(arquivo)
    const imagem = new Image()

    imagem.onload = () => {
      URL.revokeObjectURL(endereco)
      resolver({ largura: imagem.naturalWidth, altura: imagem.naturalHeight })
    }

    imagem.onerror = () => {
      URL.revokeObjectURL(endereco)
      /* Medida desconhecida não pode travar o envio: 16/9 mantém a
         proporção da moldura e o recorte por object-cover resolve. */
      resolver({ largura: 1600, altura: 900 })
    }

    imagem.src = endereco
  })
}

const LARGURA_DA_MINIATURA = 420

/**
 * Desenha a primeira página do PDF e devolve a imagem.
 *
 * Roda inteiramente no navegador do cliente: o arquivo não é enviado a
 * lugar nenhum para isso, e o servidor do site não precisa de nenhuma
 * biblioteca de PDF. Falhou — PDF protegido, corrompido, formato exótico
 * — devolve `null` e o documento fica com o ícone de formato.
 */
export async function miniaturaDoPdf(arquivo: File): Promise<Blob | null> {
  try {
    const pdfjs = await import('pdfjs-dist')

    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString()

    const tarefa = pdfjs.getDocument({ data: await arquivo.arrayBuffer() })
    const documento = await tarefa.promise

    const pagina = await documento.getPage(1)
    const original = pagina.getViewport({ scale: 1 })
    const escala = LARGURA_DA_MINIATURA / original.width
    const visor = pagina.getViewport({ scale: escala })

    const tela = document.createElement('canvas')
    tela.width = Math.round(visor.width)
    tela.height = Math.round(visor.height)

    const contexto = tela.getContext('2d')
    if (!contexto) return null

    /* PDF costuma ter fundo transparente; sem esta base, a miniatura sai
       preta em cima do fundo escuro de alguns visualizadores. */
    contexto.fillStyle = '#ffffff'
    contexto.fillRect(0, 0, tela.width, tela.height)

    await pagina.render({ canvas: tela, canvasContext: contexto, viewport: visor })
      .promise

    const imagem = await new Promise<Blob | null>((resolver) => {
      tela.toBlob((blob) => resolver(blob), 'image/webp', 0.82)
    })

    /* Encerra o worker: sem isto, cada PDF aberto deixa uma thread viva
       para o resto da sessão do painel. */
    await tarefa.destroy()
    return imagem
  } catch (erro) {
    console.error('[aidep] não foi possível gerar a miniatura do PDF:', erro)
    return null
  }
}
