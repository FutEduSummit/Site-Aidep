'use client'

import { FileText } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { iconesDeFormato } from '@/components/ui/document-format'
import type { InstitutionalDocument } from '@/content/types'
import { previaDoPdf, previaEmCache } from '@/lib/previa-pdf'
import {
  previaDaPlanilha,
  previaDePlanilhaEmCache,
} from '@/lib/previa-planilha'
import { cn } from '@/lib/utils'

type Props = {
  doc: InstitutionalDocument
  /** Classes da moldura — a tabela e o cartão do celular usam tamanhos diferentes. */
  className?: string
  /** `sizes` do `next/image`: a largura da moldura, em pixels. */
  sizes?: string
}

/**
 * PRÉVIA DO DOCUMENTO
 * ===================
 * A primeira página do documento, na própria linha da tabela: quem procura
 * a prestação de contas de um semestre reconhece o arquivo pela cara dele,
 * sem abrir um por um.
 *
 * De onde vem a imagem, em ordem:
 *
 *   1. `thumbnail` — o painel desenha a primeira página no envio e guarda a
 *      miniatura no Storage. É o caminho normal e o mais leve: chega
 *      otimizada pelo `next/image`, sem baixar o arquivo.
 *   2. o próprio arquivo, quando o documento É uma imagem.
 *   3. o arquivo desenhado aqui no navegador: a primeira página, no PDF
 *      (ver `lib/previa-pdf.ts`); a grade desenhada como folha, no CSV
 *      (ver `previaDaPlanilha` em `lib/previa-planilha.ts`), que não tem
 *      página para o navegador desenhar.
 *
 * O passo 3 é a rede de segurança, e cobre mais do que parece: documento
 * semeado direto no banco, arquivo servido de /public, envio em que a
 * miniatura não foi gerada — e também a miniatura que existe no banco mas
 * não carrega (arquivo removido do Storage, host de imagem não liberado na
 * build). Este último caso chega pelo `onError` da imagem: em vez de
 * deixar a moldura quebrada, a página desenha o arquivo.
 *
 * Ele só começa quando a linha se aproxima da tela — numa tabela de
 * cinquenta documentos, ninguém baixa cinquenta arquivos para ver a lista.
 *
 * XLSX é zip binário e DOC/DOCX o navegador não abre: sem página nem
 * grade para desenhar, ficam com o ícone do formato, como qualquer falha.
 * A moldura nunca aparece vazia.
 */
export function DocumentPreview({ doc, className, sizes = '68px' }: Props) {
  const guardada =
    doc.thumbnail?.src ?? (doc.format === 'imagem' ? doc.file : null)

  const [guardadaFalhou, setGuardadaFalhou] = useState(false)
  const fonteGuardada = guardadaFalhou ? null : guardada

  /* Quem desenha este formato, quando não há miniatura guardada. PDF tem
     página; CSV, grade. Os outros não têm nem uma nem outra, e ficam com o
     ícone. As duas duplas são referências de módulo, estáveis entre
     renderizações — é isso que deixa `desenhar` entrar nas dependências do
     efeito sem reabrir o observador a cada tecla digitada na busca. */
  const desenhar =
    doc.format === 'pdf'
      ? previaDoPdf
      : doc.format === 'csv'
        ? previaDaPlanilha
        : null

  const emCache =
    doc.format === 'pdf'
      ? previaEmCache
      : doc.format === 'csv'
        ? previaDePlanilhaEmCache
        : null

  /* `undefined` = ainda não se tentou; `null` = não deu, fica o ícone. */
  const [desenhada, setDesenhada] = useState<string | null | undefined>(() =>
    emCache?.(doc.file),
  )

  const moldura = useRef<HTMLSpanElement>(null)
  const pendente = !fonteGuardada && desenhar !== null && desenhada === undefined

  useEffect(() => {
    if (!pendente || !desenhar) return

    const elemento = moldura.current
    if (!elemento) return

    let vivo = true

    function pedirDesenho() {
      desenhar!(doc.file).then((imagem) => {
        if (vivo) setDesenhada(imagem)
      })
    }

    /* Sem IntersectionObserver (navegador antigo), desenha logo: a lista
       preenchida importa mais que o tráfego economizado. */
    if (typeof IntersectionObserver === 'undefined') {
      pedirDesenho()
      return () => {
        vivo = false
      }
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((entrada) => entrada.isIntersecting)) return
        observador.disconnect()
        pedirDesenho()
      },
      { rootMargin: '300px' },
    )

    observador.observe(elemento)

    return () => {
      vivo = false
      observador.disconnect()
    }
  }, [pendente, desenhar, doc.file])

  const fonte = fonteGuardada ?? desenhada ?? null
  const Icone = iconesDeFormato[doc.format] ?? FileText

  return (
    <span
      ref={moldura}
      className={cn(
        'relative flex h-24 w-17 shrink-0 items-center justify-center overflow-hidden border border-(--border) bg-paper-3',
        className,
      )}
    >
      {fonte ? (
        <Image
          src={fonte}
          alt=""
          fill
          sizes={sizes}
          /* Data URL do canvas já sai no tamanho certo — otimizar de novo
             só faria o servidor reprocessar a mesma imagem. */
          unoptimized={fonte.startsWith('data:')}
          onError={() => setGuardadaFalhou(true)}
          className="object-cover object-top"
        />
      ) : (
        <Icone
          aria-hidden="true"
          className={cn(
            'size-5 text-(--fg-subtle)',
            pendente && 'animate-pulse motion-reduce:animate-none',
          )}
          strokeWidth={1.5}
        />
      )}
    </span>
  )
}
