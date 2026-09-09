'use client'

import { Download } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import type { InstitutionalDocument } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { urlDeDownload } from '@/lib/documentos'
import {
  carregarPlanilha,
  pareceNumero,
  planilhaEmCache,
} from '@/lib/previa-planilha'
import type { Planilha } from '@/lib/previa-planilha'
import { cn } from '@/lib/utils'

type Props = {
  doc: InstitutionalDocument
  locale: Locale
}

/**
 * Largura máxima de uma célula, em caracteres, antes de a coluna passar a
 * quebrar linha. Planilha de verdade não quebra célula — quem lê rola de
 * lado. Mas uma coluna de descrição ou de observação pode ter parágrafo
 * inteiro, e aí a tabela ficaria larga demais para rolar até o fim.
 */
const LARGURA_QUE_QUEBRA = 48

function colunasDeTextoLongo(planilha: Planilha): boolean[] {
  return planilha.cabecalho.map((_, coluna) =>
    planilha.linhas.some(
      (linha) => (linha[coluna] ?? '').length > LARGURA_QUE_QUEBRA,
    ),
  )
}

function colunasDeNumero(planilha: Planilha): boolean[] {
  return planilha.cabecalho.map((_, coluna) => {
    const valores = planilha.linhas
      .map((linha) => linha[coluna])
      .filter((valor) => valor !== '')

    return valores.length > 0 && valores.every(pareceNumero)
  })
}

/**
 * PLANILHA DENTRO DA PÁGINA
 * =========================
 * Quem abre uma planilha na Transparência quer ver os números, não
 * receber um arquivo. O navegador não desenha planilha sozinho, então a
 * grade é lida aqui (ver `lib/previa-planilha.ts`) e desenhada como
 * tabela: cabeçalho preso no topo, número da linha preso à esquerda,
 * coluna de valor alinhada à direita.
 *
 * Vale para `.csv`, que é texto. `.xlsx` é zip binário e continua no
 * caminho do download — quem quiser exibi-lo aqui precisa de uma
 * biblioteca de leitura de Excel no pacote do site.
 *
 * Enquanto o arquivo chega, e se ele não chegar, o botão de download
 * continua à mão: a janela nunca fica só com um aviso.
 */
export function SpreadsheetView({ doc, locale }: Props) {
  const t = useTranslations('transparency.viewer')
  const tActions = useTranslations('actions')

  /* `undefined` = ainda carregando; `null` = não deu, fica o aviso. */
  const [planilha, setPlanilha] = useState<Planilha | null | undefined>(() =>
    planilhaEmCache(doc.file),
  )

  /* A janela monta o `SpreadsheetView` com `key={doc.id}`, então trocar de
     documento remonta o componente e o estado já começa do zero — aqui
     basta buscar quando ainda não se tem a grade. */
  const pendente = planilha === undefined

  useEffect(() => {
    if (!pendente) return

    let vivo = true

    carregarPlanilha(doc.file).then((lida) => {
      if (vivo) setPlanilha(lida)
    })

    return () => {
      vivo = false
    }
  }, [pendente, doc.file])

  if (pendente) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-paper-3 px-6">
        <p className="text-body text-(--fg-muted) animate-pulse motion-reduce:animate-none">
          {t('loading')}
        </p>
      </div>
    )
  }

  if (!planilha) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 bg-paper-3 px-6 text-center">
        <p className="max-w-[44ch] text-body text-(--fg-muted)">
          {t('unreadable')}
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
    )
  }

  const numericas = colunasDeNumero(planilha)
  const longas = colunasDeTextoLongo(planilha)
  const cortada = planilha.totalDeLinhas > planilha.linhas.length

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-paper-3">
      {planilha.notas.length > 0 ? (
        <div className="shrink-0 border-b border-(--border) bg-(--bg) px-6 py-3">
          {planilha.notas.map((nota) => (
            <p key={nota} className="text-small text-(--fg-muted)">
              {nota}
            </p>
          ))}
        </div>
      ) : null}

      {/* A planilha rola nos dois eixos dentro da janela: a página atrás
          não se move, e uma tabela larga não estoura a moldura. */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse bg-(--bg) text-left text-small">
          <caption className="sr-only">
            {t('sheetCaption', { title: doc.title[locale] })}
          </caption>

          <thead>
            <tr>
              {/* Canto da grade: fica sobre as duas barras presas. */}
              <th
                scope="col"
                className="sticky left-0 top-0 z-20 w-12 border-b border-r border-(--border-strong) bg-paper-3 px-3 py-3"
              >
                <span className="sr-only">{t('rowNumber')}</span>
              </th>

              {planilha.cabecalho.map((titulo, coluna) => (
                <th
                  key={`${titulo}-${coluna}`}
                  scope="col"
                  className={cn(
                    'sticky top-0 z-10 whitespace-nowrap border-b border-(--border-strong) bg-paper-3 px-4 py-3 text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-muted)',
                    numericas[coluna] && 'text-right',
                  )}
                >
                  {titulo || '—'}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {planilha.linhas.map((linha, indice) => (
              <tr key={indice} className="border-b border-(--border)">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-(--border-strong) bg-paper-3 px-3 py-2.5 text-right align-top text-micro font-normal tabular-nums tracking-normal text-(--fg-subtle)"
                >
                  {indice + 1}
                </th>

                {linha.map((celula, coluna) => (
                  <td
                    key={coluna}
                    className={cn(
                      'px-4 py-2.5 align-top',
                      numericas[coluna] && 'text-right tabular-nums',
                      longas[coluna]
                        ? 'min-w-[20rem] max-w-[28rem]'
                        : 'whitespace-nowrap',
                    )}
                  >
                    {celula || (
                      <span className="text-(--fg-subtle)" aria-hidden="true">
                        —
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-(--border) bg-(--bg) px-6 py-3 text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
        <span>
          {t('sheetSummary', {
            rows: planilha.totalDeLinhas,
            columns: planilha.cabecalho.length,
          })}
        </span>
        {cortada ? (
          <span className="normal-case tracking-normal text-small text-(--fg-muted)">
            {t('truncated', {
              shown: planilha.linhas.length,
              total: planilha.totalDeLinhas,
            })}
          </span>
        ) : null}
      </div>
    </div>
  )
}
