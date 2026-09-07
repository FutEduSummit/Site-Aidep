'use client'

import { FileText, ImageIcon, Trash2, Upload } from 'lucide-react'
import NextImage from 'next/image'
import { useId, useRef, useState } from 'react'
import type { ImagemEnviada } from '@/lib/admin/esquemas'
import {
  enviarDocumento,
  enviarImagem,
  enviarMiniatura,
  formatoDoArquivo,
  medirImagem,
  miniaturaDoPdf,
} from '@/lib/admin/storage'
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
 * Um passo só para o cliente: ele escolhe o PDF e o painel resolve o
 * resto — sobe o arquivo, desenha a primeira página, sobe a miniatura e
 * preenche formato e tamanho.
 *
 * A miniatura é gerada no próprio navegador (ver `miniaturaDoPdf`). Se o
 * PDF não permitir, o documento fica com o ícone do formato e o cliente
 * pode enviar uma imagem à mão.
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
  const entradaMiniatura = useRef<HTMLInputElement>(null)

  const [estado, setEstado] = useState<string | null>(null)
  const [problema, setProblema] = useState<string | null>(null)

  async function receberArquivo(arquivo: File) {
    setProblema(null)

    try {
      setEstado('Enviando o arquivo…')
      const enviado = await enviarDocumento(arquivo, ano)
      const formato = formatoDoArquivo(arquivo)

      let miniatura = valor.miniatura

      if (formato === 'pdf') {
        setEstado('Gerando a miniatura da primeira página…')
        const imagem = await miniaturaDoPdf(arquivo)

        if (imagem) {
          const base = enviado.path.split('/').pop() ?? 'documento'
          const enviada = await enviarMiniatura(imagem, base)
          const medidas = await medirImagem(imagem)
          miniatura = {
            url: enviada.url,
            path: enviada.path,
            largura: medidas.largura,
            altura: medidas.altura,
          }
        }
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

  async function receberMiniatura(arquivo: File) {
    setProblema(null)

    try {
      setEstado('Enviando a imagem…')
      const enviada = await enviarImagem(arquivo, 'miniaturas')
      onChange({
        ...valor,
        miniatura: {
          url: enviada.url,
          path: enviada.path,
          largura: enviada.largura,
          altura: enviada.altura,
        },
      })
    } catch (falha) {
      console.error(falha)
      setProblema('Não foi possível enviar a imagem.')
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
      dica="PDF, planilha ou documento de texto. Do PDF, o painel gera sozinho a miniatura que aparece na tabela do site."
    >
      <div className="flex flex-col gap-4 border border-(--border-strong) p-4">
        <div className="flex flex-wrap items-start gap-4">
          <span className="relative flex h-24 w-[4.5rem] shrink-0 items-center justify-center overflow-hidden border border-(--border) bg-paper-3">
            {valor.miniatura ? (
              <NextImage
                src={valor.miniatura.url}
                alt=""
                fill
                sizes="72px"
                className="object-cover object-top"
              />
            ) : (
              <FileText
                aria-hidden="true"
                strokeWidth={1.5}
                className="size-6 text-(--fg-subtle)"
              />
            )}
          </span>

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

              {temArquivo ? (
                <Botao
                  type="button"
                  variante="discreto"
                  onClick={() => entradaMiniatura.current?.click()}
                  disabled={estado !== null}
                >
                  <ImageIcon aria-hidden="true" className="size-4" />
                  Trocar miniatura
                </Botao>
              ) : null}
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

        <input
          ref={entradaMiniatura}
          type="file"
          className="sr-only"
          accept="image/*"
          onChange={(evento) => {
            const arquivo = evento.target.files?.[0]
            if (arquivo) void receberMiniatura(arquivo)
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

export function EnvioDeImagem({
  rotulo,
  valor,
  onChange,
  pasta = 'capas',
  dica,
  proporcao = '16 / 9',
}: {
  rotulo: string
  valor: ImagemEnviada | null
  onChange: (valor: ImagemEnviada | null) => void
  pasta?: string
  dica?: string
  proporcao?: string
}) {
  const uid = useId()
  const entrada = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [problema, setProblema] = useState<string | null>(null)

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
        dica ??
        'Sem imagem, o site exibe o painel institucional da marca no lugar — nunca uma foto genérica.'
      }
    >
      <div className="flex flex-col gap-3">
        <div
          className="relative w-full max-w-md overflow-hidden border border-(--border-strong) bg-paper-3"
          style={{ aspectRatio: proporcao }}
        >
          {valor ? (
            <NextImage
              src={valor.url}
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
        </div>

        <div className="flex flex-wrap gap-2">
          <Botao
            type="button"
            variante="contorno"
            carregando={enviando}
            onClick={() => entrada.current?.click()}
          >
            <Upload aria-hidden="true" className="size-4" />
            {valor ? 'Trocar imagem' : 'Enviar imagem'}
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
