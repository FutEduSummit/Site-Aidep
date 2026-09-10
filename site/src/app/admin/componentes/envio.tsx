'use client'

import { FileText, ImageIcon, Trash2, Upload } from 'lucide-react'
import NextImage from 'next/image'
import { useId, useRef, useState } from 'react'
import { DocumentPreview } from '@/components/ui/document-preview'
import type { ImagemEnviada } from '@/lib/admin/esquemas'
import {
  enviarDocumento,
  enviarImagem,
  enviarMiniatura,
  formatoDoArquivo,
  medirImagem,
  miniaturaDaPlanilha,
  miniaturaDoPdf,
} from '@/lib/admin/storage'
import { ehPlanilha } from '@/lib/documentos'
import { Aviso, Botao, Campo } from './ui'

function rotuloDeTamanho(bytes: number | null | undefined) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

/* ------------------------------------------------------------------ */
/* Documento da transparência                                         */
/* ------------------------------------------------------------------ */

export type DocumentoEnviado = {
  arquivoUrl: string
  arquivoPath: string
  arquivoNome: string
  formato: ReturnType<typeof formatoDoArquivo>
  tamanhoBytes: number | null
  miniatura: ImagemEnviada | null
}

/**
 * ENVIO DO DOCUMENTO
 * ==================
 * Um passo só, e um campo só: o cliente escolhe o arquivo e o painel
 * resolve o resto — sobe, desenha a prévia, sobe a prévia e preenche
 * formato e tamanho.
 *
 * A PRÉVIA NÃO SE PEDE AO CLIENTE
 * -------------------------------
 * Havia aqui um segundo botão, "Trocar miniatura", para enviar à mão a
 * imagem da primeira página. Ninguém vai exportar a capa do próprio PDF
 * para subir duas vezes o mesmo documento — e não precisa: o navegador
 * desenha a primeira página do PDF (`miniaturaDoPdf`) e a grade da
 * planilha (`miniaturaDaPlanilha`), que é o que a tabela do site exibe.
 * Documento que é imagem já é a própria prévia.
 *
 * DOC e DOCX o navegador não abre, e ficam com o ícone do formato — como
 * ficariam de qualquer jeito, porque a prévia não vem do arquivo. Nada
 * disso trava o envio: prévia é conforto, o documento é o que importa.
 */
export function EnvioDeDocumento({
  valor,
  onChange,
  ano,
  erro,
}: {
  valor: DocumentoEnviado
  onChange: (valor: DocumentoEnviado) => void
  ano: number
  erro?: string
}) {
  const uid = useId()
  const entradaArquivo = useRef<HTMLInputElement>(null)

  const [estado, setEstado] = useState<string | null>(null)
  const [problema, setProblema] = useState<string | null>(null)

  /** Sobe a imagem desenhada e devolve a prévia já medida. */
  async function subirPrevia(
    imagem: Blob,
    caminhoDoArquivo: string,
  ): Promise<ImagemEnviada> {
    const base = caminhoDoArquivo.split('/').pop() ?? 'documento'
    const [enviada, medidas] = await Promise.all([
      enviarMiniatura(imagem, base),
      medirImagem(imagem),
    ])

    return {
      url: enviada.url,
      path: enviada.path,
      largura: medidas.largura,
      altura: medidas.altura,
    }
  }

  async function receberArquivo(arquivo: File) {
    setProblema(null)

    try {
      setEstado('Enviando o arquivo…')
      const enviado = await enviarDocumento(arquivo, ano)
      const formato = formatoDoArquivo(arquivo)

      /* Prévia sempre desenhada do arquivo que está entrando, nunca
         herdada: trocar um PDF por outro e ficar com a página do anterior
         é pior do que ficar sem prévia nenhuma. */
      let miniatura: ImagemEnviada | null = null

      if (formato === 'pdf') {
        setEstado('Desenhando a primeira página…')
        const imagem = await miniaturaDoPdf(arquivo)
        if (imagem) miniatura = await subirPrevia(imagem, enviado.path)
      } else if (ehPlanilha(formato)) {
        setEstado('Desenhando a prévia da planilha…')
        const imagem = await miniaturaDaPlanilha(enviado.url)
        if (imagem) miniatura = await subirPrevia(imagem, enviado.path)
      }

      onChange({
        arquivoUrl: enviado.url,
        arquivoPath: enviado.path,
        arquivoNome: enviado.nome,
        formato,
        tamanhoBytes: enviado.tamanho,
        miniatura,
      })
    } catch (falha) {
      console.error(falha)
      setProblema(
        'Não foi possível enviar o arquivo. Confira a conexão e tente de novo.',
      )
    } finally {
      setEstado(null)
    }
  }

  const temArquivo = Boolean(valor.arquivoUrl)

  return (
    <Campo
      htmlFor={`${uid}-arquivo`}
      rotulo="Arquivo do documento"
      erro={erro}
      dica="PDF, planilha ou documento de texto. A prévia que aparece na tabela do site é gerada pelo painel — não há imagem para enviar."
    >
      <div className="flex flex-col gap-4 border border-(--border-strong) p-4">
        <div className="flex flex-wrap items-start gap-4">
          {temArquivo ? (
            /* A moldura da tabela do site, com o mesmo conteúdo: a prévia
               gerada no envio ou, se ela não veio, o desenho do próprio
               arquivo. O cliente confere aqui o que o visitante vai ver. */
            <DocumentPreview
              doc={{
                file: valor.arquivoUrl,
                format: valor.formato,
                thumbnail: valor.miniatura
                  ? {
                      src: valor.miniatura.url,
                      width: valor.miniatura.largura,
                      height: valor.miniatura.altura,
                      alt: { pt: '', en: '', es: '' },
                    }
                  : null,
              }}
              className="h-24 w-18"
              sizes="72px"
            />
          ) : (
            <span className="relative flex h-24 w-18 shrink-0 items-center justify-center overflow-hidden border border-(--border) bg-paper-3">
              <FileText
                aria-hidden="true"
                strokeWidth={1.5}
                className="size-6 text-(--fg-subtle)"
              />
            </span>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {temArquivo ? (
              <>
                <p className="break-all text-small font-medium">
                  {valor.arquivoNome || 'Arquivo enviado'}
                </p>
                <p className="text-micro uppercase tracking-[0.12em] text-(--fg-subtle)">
                  {valor.formato.toUpperCase()}
                  {valor.tamanhoBytes
                    ? ` · ${rotuloDeTamanho(valor.tamanhoBytes)}`
                    : ''}
                </p>
              </>
            ) : (
              <p className="text-small text-(--fg-muted)">
                Nenhum arquivo enviado ainda.
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <Botao
                type="button"
                variante="contorno"
                onClick={() => entradaArquivo.current?.click()}
                carregando={estado !== null}
              >
                <Upload aria-hidden="true" className="size-4" />
                {temArquivo ? 'Trocar arquivo' : 'Escolher arquivo'}
              </Botao>
            </div>
          </div>
        </div>

        {estado ? <Aviso>{estado}</Aviso> : null}
        {problema ? <Aviso tom="erro">{problema}</Aviso> : null}

        <input
          ref={entradaArquivo}
          id={`${uid}-arquivo`}
          type="file"
          className="sr-only"
          accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,image/*"
          onChange={(evento) => {
            const arquivo = evento.target.files?.[0]
            if (arquivo) void receberArquivo(arquivo)
            evento.target.value = ''
          }}
        />
      </div>
    </Campo>
  )
}

/* ------------------------------------------------------------------ */
/* Imagem — capa de notícia, capa de projeto, foto de galeria          */
/* ------------------------------------------------------------------ */

/**
 * A foto que o site publica quando nada foi enviado pelo painel: a
 * fotografia do acervo registrada para a notícia ou o projeto (ver
 * `lib/admin/capas.ts`). Chega resolvida do servidor, e é só de leitura —
 * o painel mostra, não grava.
 */
export type CapaDoAcervo = { src: string; largura: number; altura: number }

export function EnvioDeImagem({
  rotulo,
  valor,
  onChange,
  pasta = 'capas',
  dica,
  proporcao = '16 / 9',
  doAcervo = null,
}: {
  rotulo: string
  valor: ImagemEnviada | null
  onChange: (valor: ImagemEnviada | null) => void
  pasta?: string
  dica?: string
  proporcao?: string
  doAcervo?: CapaDoAcervo | null
}) {
  const uid = useId()
  const entrada = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [problema, setProblema] = useState<string | null>(null)

  /* Sem imagem enviada, a moldura mostra a foto do acervo que está no ar —
     e não o ícone de "vazio", que fazia o cliente achar que a notícia
     estava sem fotografia enquanto o site já publicava uma. A moldura
     recorta com `fill`, então basta o endereço. */
  const soAcervo = !valor && doAcervo !== null
  const mostrando = valor?.url ?? doAcervo?.src ?? null

  async function receber(arquivo: File) {
    setProblema(null)
    setEnviando(true)

    try {
      const enviada = await enviarImagem(arquivo, pasta)
      onChange({
        url: enviada.url,
        path: enviada.path,
        largura: enviada.largura,
        altura: enviada.altura,
      })
    } catch (falha) {
      console.error(falha)
      setProblema('Não foi possível enviar a imagem.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Campo
      htmlFor={`${uid}-imagem`}
      rotulo={rotulo}
      opcional
      dica={
        soAcervo
          ? 'Esta é a fotografia do acervo da AIDEP que o site publica aqui hoje. Envie uma imagem só se quiser colocar outra no lugar.'
          : (dica ??
            'Sem imagem, o site exibe o painel institucional da marca no lugar — nunca uma foto genérica.')
      }
    >
      <div className="flex flex-col gap-3">
        <div
          className="relative w-full max-w-md overflow-hidden border border-(--border-strong) bg-paper-3"
          style={{ aspectRatio: proporcao }}
        >
          {mostrando ? (
            <NextImage
              src={mostrando}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 28rem"
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              <ImageIcon
                aria-hidden="true"
                strokeWidth={1.5}
                className="size-8 text-(--fg-subtle)"
              />
            </span>
          )}

          {soAcervo ? (
            <span className="absolute bottom-0 left-0 bg-(--bg)/90 px-2 py-1 text-micro font-semibold uppercase tracking-[0.12em] text-(--fg-muted)">
              Foto do acervo — no ar
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Botao
            type="button"
            variante="contorno"
            carregando={enviando}
            onClick={() => entrada.current?.click()}
          >
            <Upload aria-hidden="true" className="size-4" />
            {valor
              ? 'Trocar imagem'
              : soAcervo
                ? 'Enviar outra imagem'
                : 'Enviar imagem'}
          </Botao>

          {valor ? (
            <Botao
              type="button"
              variante="discreto"
              disabled={enviando}
              onClick={() => onChange(null)}
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Remover
            </Botao>
          ) : null}
        </div>

        {problema ? <Aviso tom="erro">{problema}</Aviso> : null}

        <input
          ref={entrada}
          id={`${uid}-imagem`}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(evento) => {
            const arquivo = evento.target.files?.[0]
            if (arquivo) void receber(arquivo)
            evento.target.value = ''
          }}
        />
      </div>
    </Campo>
  )
}
