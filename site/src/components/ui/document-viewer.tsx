'use client'

import { Download, ExternalLink, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { SpreadsheetView } from '@/components/ui/spreadsheet-view'
import type { InstitutionalDocument } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { ehPlanilha, urlDeDownload } from '@/lib/documentos'

type Props = {
  document: InstitutionalDocument | null
  locale: Locale
  onClose: () => void
}

/** Só estes formatos o navegador desenha sozinho dentro de um quadro. */
const exibiveis = new Set(['pdf', 'imagem'])

/**
 * VISUALIZADOR DE DOCUMENTO
 * =========================
 * Abre o arquivo dentro da própria página, sem mandar o visitante para
 * outra aba: quem está conferindo a prestação de contas continua no site,
 * volta para a lista e abre o próximo.
 *
 * Usa o `<dialog>` nativo de propósito — ele já entrega, sem
 * biblioteca: prender o foco dentro da janela, devolver o foco ao botão
 * de origem ao fechar, fechar no Esc e marcar o resto da página como
 * inerte para leitores de tela.
 *
 * PDF e imagem o navegador desenha sozinho, num `<iframe>`. Planilha ele
 * não desenha: o site lê o arquivo — `.csv` como texto, `.xlsx`
 * descompactado (ver `lib/leitor-xlsx.ts`) — e monta a grade dentro da
 * própria janela (ver `SpreadsheetView`). É o que interessa a quem está
 * conferindo repasses, e não um arquivo baixando.
 *
 * O que sobra — `.doc`, `.docx`, `.xls` antigo — é formato binário que só
 * abre em programa instalado; nesse caso a janela diz isso com clareza e
 * oferece o download, em vez de mostrar um quadro cinza vazio.
 */
export function DocumentViewer({ document: doc, locale, onClose }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const elemento = dialogo.current
    if (!elemento) return

    if (doc && !elemento.open) elemento.showModal()
    if (!doc && elemento.open) elemento.close()
  }, [doc])

  const t = useTranslations('transparency')
  const tActions = useTranslations('actions')

  const podeExibir = doc ? exibiveis.has(doc.format) : false
  const temGrade = doc ? ehPlanilha(doc.format) : false

  return (
    <dialog
      ref={dialogo}
      onClose={onClose}
      onClick={(event) => {
        /* Clique no fundo (fora do conteúdo) fecha — o alvo só é o próprio
           <dialog> quando o clique cai na área do ::backdrop. */
        if (event.target === dialogo.current) onClose()
      }}
      aria-label={doc ? doc.title[locale] : undefined}
      className="m-auto w-[min(72rem,calc(100vw-2rem))] max-w-none bg-(--bg) p-0 text-(--fg) backdrop:bg-ink-950/70 backdrop:backdrop-blur-sm"
    >
      {doc ? (
        <div
          data-surface="light"
          className="flex h-[min(88vh,60rem)] flex-col bg-(--bg)"
        >
          <header className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-(--border) px-6 py-5">
            <div className="flex min-w-0 flex-col gap-1">
              <h2 className="text-h4 font-semibold tracking-[-0.02em]">
                {doc.title[locale]}
              </h2>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
                <span>{doc.format.toUpperCase()}</span>
                {doc.sizeLabel ? <span>{doc.sizeLabel}</span> : null}
                <span>{doc.year}</span>
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <a
                href={doc.file}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-11 items-center gap-2 border border-(--border-strong) px-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] transition-colors duration-200 ease-brand hover:border-(--fg)"
              >
                <ExternalLink aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">{tActions('openInNewTab')}</span>
              </a>

              <a
                href={urlDeDownload(doc)}
                download={doc.fileName ?? undefined}
                className="inline-flex min-h-11 items-center gap-2 bg-(--fg) px-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-(--bg) transition-colors duration-200 ease-brand hover:bg-(--fg-muted)"
              >
                <Download aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">{tActions('download')}</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex size-11 items-center justify-center border border-(--border-strong) transition-colors duration-200 ease-brand hover:border-(--fg)"
              >
                <X aria-hidden="true" className="size-4" />
                <span className="sr-only">{tActions('close')}</span>
              </button>
            </div>
          </header>

          {podeExibir ? (
            <iframe
              key={doc.id}
              src={doc.file}
              title={doc.title[locale]}
              className="min-h-0 flex-1 border-0 bg-paper-3"
            />
          ) : temGrade ? (
            <SpreadsheetView key={doc.id} doc={doc} locale={locale} />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 bg-paper-3 px-6 text-center">
              <p className="max-w-[44ch] text-body text-(--fg-muted)">
                {t('viewer.notEmbeddable', { format: doc.format.toUpperCase() })}
              </p>
              <a
                href={urlDeDownload(doc)}
                download={doc.fileName ?? undefined}
                className="inline-flex min-h-11 items-center gap-2 bg-brand-500 px-6 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-ink-950 transition-colors duration-200 ease-brand hover:bg-brand-400"
              >
                <Download aria-hidden="true" className="size-4" />
                {tActions('download')}
              </a>
            </div>
          )}
        </div>
      ) : null}
    </dialog>
  )
}
