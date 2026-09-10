'use client'

import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Search,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useMemo, useState } from 'react'
import { SelectControl, inputClasses } from '@/components/forms/fields'
import { DocumentFormatBadge } from '@/components/ui/document-format'
import { DocumentPreview } from '@/components/ui/document-preview'
import { DocumentViewer } from '@/components/ui/document-viewer'
import { EmptyState } from '@/components/ui/empty-state'
import { Container, Section } from '@/components/ui/section'
import type {
  DocumentCategory,
  DocumentCategoryEntry,
  InstitutionalDocument,
} from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { categoriaDe, coresDeCategoria, urlDeDownload } from '@/lib/documentos'
import { cn, formatDate, formatDateShort } from '@/lib/utils'

const localeTag: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
}

type Props = {
  documents: InstitutionalDocument[]
  categories: DocumentCategoryEntry[]
  years: number[]
  locale: Locale
}

type Coluna = 'title' | 'category' | 'content' | 'date'
type Sentido = 'asc' | 'desc'

const opcoesPorPagina = [10, 25, 50] as const

/**
 * DIVISA ENTRE AS COLUNAS
 * =======================
 * As seis colunas têm larguras muito diferentes — título de duas linhas,
 * selo curto, parágrafo de conteúdo, data, prévia e dois botões. Sem fio
 * vertical, a data de uma linha e o conteúdo da seguinte se leem como se
 * fossem do mesmo campo. O fio mora à direita de cada coluna, e a coluna
 * seguinte ganha respiro à esquerda para o texto não encostar nele.
 *
 * A primeira coluna não tem recuo à esquerda, e a última não tem fio: a
 * tabela precisa começar e terminar rente à margem da seção, como o resto
 * da página.
 *
 * O recuo tem três degraus — 4 px no celular, 16 px no tablet, 24 px no
 * computador. Seis colunas com 24 px de cada lado gastam 288 px só de
 * respiro: numa tela de 360 px isso é a tabela inteira virando espaço em
 * branco.
 */
const primeiraColuna = 'border-r border-(--border) pr-1 lg:pr-4 xl:pr-6'
const colunaDoMeio = 'border-r border-(--border) px-1 lg:px-4 xl:px-6'
const ultimaColuna = 'pl-1 lg:pl-4 xl:pl-6'

/**
 * LARGURA DA TABELA E DE CADA COLUNA
 * ==================================
 * A tabela é a mesma no computador e no celular: as seis colunas, a linha
 * inteira, nada resumido — e no celular ela CABE na tela, sem rolagem
 * lateral. É por isso que as colunas medem por porcentagem abaixo de
 * 1024 px: a soma fecha em 100%, e a tabela acompanha a largura da seção
 * qualquer que seja o aparelho.
 *
 * Caber custa tamanho de letra, e o preço foi pago onde dói menos: o
 * título cai para 10 px, o conteúdo para 9 px e ganha limite de seis
 * linhas, a data vira numérica (01/09/26 em vez de "01 de setembro de
 * 2026") e os dois botões ficam só com o ícone. O que não encolhe é a
 * informação — as seis colunas continuam ali, o texto cortado está a um
 * toque, e no computador tudo volta ao tamanho de leitura.
 *
 * A partir de 1024 px vale a medida fixa, com o piso de 58rem. A largura
 * por coluna não é decoração nem lá: sem ela o navegador reparte o espaço
 * pelo tamanho do conteúdo, e quem escreve mais leva mais — o título
 * ficava com 128 px ao lado de 217 px para uma palavra de categoria, e a
 * linha crescia de 236 px para 366 px de altura.
 */
const larguraMinima = 'lg:min-w-[58rem]'

/**
 * O RÓTULO DO CABEÇALHO
 * =====================
 * Mesma medida do rótulo que ordena (ver `Ordenador`), para "Prévia" e
 * "Download" não saírem maiores que "Título" na mesma linha.
 */
const rotuloDeColuna =
  'text-[0.4375rem] font-semibold uppercase leading-tight tracking-[0.04em] text-(--fg-subtle) lg:text-micro lg:tracking-[0.14em]'

/**
 * OS DOIS BOTÕES DA LINHA
 * =======================
 * No computador são ícone + palavra, com os 44 px de altura de alvo de
 * toque. No celular a palavra sai (fica no leitor de tela) e sobra o
 * quadrado do ícone: escrever "VISUALIZAR" e "BAIXAR" ali custaria 150 px
 * dos 360 px da tela, e as outras cinco colunas não caberiam.
 */
function acaoDaLinha(cor: string) {
  return cn(
    'inline-flex size-7 shrink-0 items-center justify-center transition-colors duration-200 ease-brand lg:size-auto lg:min-h-11 lg:gap-2 lg:px-4 lg:text-[0.75rem] lg:font-semibold lg:uppercase lg:tracking-[0.1em]',
    cor,
  )
}

const larguraDaColuna = {
  title: 'w-[28%] lg:w-[14rem]',
  category: 'w-[17%] lg:w-[8rem]',
  content: 'w-[16%] lg:w-[15rem]',
  date: 'w-[15%] lg:w-[7rem]',
  preview: 'w-[11%] lg:w-[5rem]',
  download: 'w-[13%] lg:w-[9rem]',
} as const

/* ------------------------------------------------------------------ */
/* Peças da tabela                                                     */
/* ------------------------------------------------------------------ */
/* Declaradas aqui fora, e não dentro do explorador: componente criado
   durante a renderização é um componente novo a cada tecla digitada na
   busca — o React desmonta e remonta a subárvore inteira, o que apagaria
   o estado da tabela. */

function Ordenador({
  campo,
  rotulo,
  colunaAtiva,
  sentido,
  aoOrdenar,
  descricao,
}: {
  campo: Coluna
  rotulo: string
  colunaAtiva: Coluna
  sentido: Sentido
  aoOrdenar: (campo: Coluna) => void
  descricao: string
}) {
  const ativo = colunaAtiva === campo
  const Seta = ativo && sentido === 'asc' ? ArrowUp : ArrowDown

  return (
    <button
      type="button"
      onClick={() => aoOrdenar(campo)}
      aria-label={descricao}
      className={cn(
        'group/sort inline-flex items-center gap-1 text-[0.4375rem] font-semibold uppercase leading-tight tracking-[0.04em] transition-colors duration-200 ease-brand lg:gap-1.5 lg:text-micro lg:tracking-[0.14em]',
        ativo ? 'text-(--fg)' : 'text-(--fg-subtle) hover:text-(--fg)',
      )}
    >
      {rotulo}
      <Seta
        aria-hidden="true"
        className={cn(
          'size-2.5 shrink-0 transition-opacity duration-200 lg:size-3.5',
          ativo
            ? 'opacity-100'
            : 'hidden opacity-0 group-hover/sort:opacity-40 lg:block',
        )}
      />
    </button>
  )
}

function Selo({
  doc,
  categories,
  locale,
}: {
  doc: InstitutionalDocument
  categories: DocumentCategoryEntry[]
  locale: Locale
}) {
  const categoria = categoriaDe(categories, doc.category)
  if (!categoria) return null

  return (
    <span
      className={cn(
        'inline-flex items-center px-1 py-0.5 text-[0.4375rem] font-semibold uppercase leading-tight tracking-[0.02em] wrap-anywhere lg:px-3 lg:py-1 lg:text-[0.6875rem] lg:tracking-[0.1em] lg:wrap-normal xl:whitespace-nowrap',
        coresDeCategoria[categoria.color],
      )}
    >
      {categoria.label[locale]}
    </span>
  )
}

function BotaoVisualizar({
  doc,
  rotulo,
  aoAbrir,
}: {
  doc: InstitutionalDocument
  rotulo: string
  aoAbrir: (doc: InstitutionalDocument) => void
}) {
  return (
    <button
      type="button"
      onClick={() => aoAbrir(doc)}
      className={acaoDaLinha(
        'border border-(--border-strong) hover:border-(--fg)',
      )}
    >
      <Eye aria-hidden="true" className="size-3.5 lg:size-4" />
      <span className="sr-only lg:not-sr-only">{rotulo}</span>
    </button>
  )
}

function BotaoBaixar({
  doc,
  rotulo,
}: {
  doc: InstitutionalDocument
  rotulo: string
}) {
  return (
    <a
      href={urlDeDownload(doc)}
      download={doc.fileName ?? undefined}
      className={acaoDaLinha('bg-brand-500 text-ink-950 hover:bg-brand-400')}
    >
      <Download aria-hidden="true" className="size-3.5 lg:size-4" />
      <span className="sr-only lg:not-sr-only">{rotulo}</span>
    </a>
  )
}

/**
 * EXPLORADOR DE DOCUMENTOS DA TRANSPARÊNCIA
 * =========================================
 * Tabela com título, categoria, conteúdo, data, prévia e download —
 * ordenável por qualquer coluna, com busca, filtro por ano e por
 * categoria, e paginação.
 *
 * Cada linha mostra a primeira página do documento (ver
 * `DocumentPreview`), e o clique no título ou na prévia abre o arquivo
 * dentro da própria página (ver `DocumentViewer`), sem tirar o visitante
 * do site.
 *
 * Sem documento publicado, exibe o estado vazio institucional: nenhum
 * documento, número ou valor é inventado para preencher a tela.
 */
export function DocumentsExplorer({
  documents,
  categories,
  years,
  locale,
}: Props) {
  const t = useTranslations('transparency')
  const tActions = useTranslations('actions')
  const uid = useId()

  const [query, setQuery] = useState('')
  const [year, setYear] = useState<'all' | number>('all')
  const [category, setCategory] = useState<'all' | DocumentCategory>('all')
  const [coluna, setColuna] = useState<Coluna>('date')
  const [sentido, setSentido] = useState<Sentido>('desc')
  const [porPagina, setPorPagina] = useState<number>(10)
  const [pagina, setPagina] = useState(1)
  const [aberto, setAberto] = useState<InstitutionalDocument | null>(null)

  const hasDocuments = documents.length > 0

  /** Texto pelo qual cada coluna ordena e a busca procura. */
  const textoDe = useMemo(
    () => ({
      title: (doc: InstitutionalDocument) => doc.title[locale] ?? '',
      content: (doc: InstitutionalDocument) => doc.description?.[locale] ?? '',
      category: (doc: InstitutionalDocument) =>
        categoriaDe(categories, doc.category)?.label[locale] ?? '',
      date: (doc: InstitutionalDocument) => doc.publishedAt,
    }),
    [categories, locale],
  )

  const filtrados = useMemo(() => {
    const termo = query.trim().toLowerCase()

    return documents
      .filter((doc) => (year === 'all' ? true : doc.year === year))
      .filter((doc) => (category === 'all' ? true : doc.category === category))
      .filter((doc) => {
        if (!termo) return true
        return (
          textoDe.title(doc).toLowerCase().includes(termo) ||
          textoDe.content(doc).toLowerCase().includes(termo)
        )
      })
  }, [documents, query, year, category, textoDe])

  const ordenados = useMemo(() => {
    const fator = sentido === 'asc' ? 1 : -1
    const extrair = textoDe[coluna]

    return [...filtrados].sort((a, b) => {
      const comparacao =
        coluna === 'date'
          ? extrair(a).localeCompare(extrair(b))
          : extrair(a).localeCompare(extrair(b), localeTag[locale])

      /* Empate cai na data mais recente — a ordem que o visitante espera. */
      return comparacao !== 0
        ? comparacao * fator
        : b.publishedAt.localeCompare(a.publishedAt)
    })
  }, [filtrados, coluna, sentido, textoDe, locale])

  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / porPagina))
  /* A página some sozinha quando um filtro encurta a lista — recalcular na
     renderização evita a tela em branco de uma página que não existe mais. */
  const paginaAtual = Math.min(pagina, totalPaginas)
  const visiveis = ordenados.slice(
    (paginaAtual - 1) * porPagina,
    paginaAtual * porPagina,
  )

  function ordenarPor(proxima: Coluna) {
    if (proxima === coluna) {
      setSentido(sentido === 'asc' ? 'desc' : 'asc')
    } else {
      setColuna(proxima)
      setSentido(proxima === 'date' ? 'desc' : 'asc')
    }
    setPagina(1)
  }

  function aoFiltrar<T>(definir: (valor: T) => void) {
    return (valor: T) => {
      definir(valor)
      setPagina(1)
    }
  }

  const rotulosDeColuna: Record<Coluna, string> = {
    title: t('table.title'),
    category: t('table.category'),
    content: t('table.content'),
    date: t('table.date'),
  }

  return (
    <Section surface="light" ariaLabelledby="transparency-docs-title">
      <Container className="flex flex-col gap-stack">
        <h2 id="transparency-docs-title" className="sr-only">
          {t('hero.title')}
        </h2>

        {hasDocuments ? (
          <>
            {/* Filtros ------------------------------------------------ */}
            <div className="grid grid-cols-1 gap-6 border-b border-(--border) pb-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label
                  htmlFor={`${uid}-search`}
                  className="text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-muted)"
                >
                  {t('filters.search')}
                </label>
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-(--fg-subtle)"
                  />
                  <input
                    id={`${uid}-search`}
                    type="search"
                    value={query}
                    onChange={(event) =>
                      aoFiltrar(setQuery)(event.target.value)
                    }
                    placeholder={t('filters.searchPlaceholder')}
                    className={`${inputClasses} pl-11`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`${uid}-year`}
                  className="text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-muted)"
                >
                  {t('filters.year')}
                </label>
                <SelectControl
                  id={`${uid}-year`}
                  value={String(year)}
                  onChange={(event) =>
                    aoFiltrar(setYear)(
                      event.target.value === 'all'
                        ? 'all'
                        : Number(event.target.value),
                    )
                  }
                >
                  <option value="all">{t('filters.allYears')}</option>
                  {years.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </SelectControl>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`${uid}-category`}
                  className="text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-muted)"
                >
                  {t('filters.category')}
                </label>
                <SelectControl
                  id={`${uid}-category`}
                  value={category}
                  onChange={(event) =>
                    aoFiltrar(setCategory)(
                      event.target.value as 'all' | DocumentCategory,
                    )
                  }
                >
                  <option value="all">{t('filters.all')}</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label[locale]}
                    </option>
                  ))}
                </SelectControl>
              </div>
            </div>

            {/* Contagem e itens por página ---------------------------- */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p aria-live="polite" className="text-small text-(--fg-muted)">
                {t('filters.resultsCount', { count: ordenados.length })}
              </p>

              <div className="flex items-center gap-3">
                <label
                  htmlFor={`${uid}-per-page`}
                  className="text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-muted)"
                >
                  {t('table.perPage')}
                </label>
                <SelectControl
                  id={`${uid}-per-page`}
                  value={String(porPagina)}
                  onChange={(event) =>
                    aoFiltrar(setPorPagina)(Number(event.target.value))
                  }
                  className="min-h-11 w-auto py-2 pr-10 text-small"
                >
                  {opcoesPorPagina.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </SelectControl>
              </div>
            </div>

            {ordenados.length > 0 ? (
              <>
                {/* Tabela ------------------------------------------ */}
                {/* A rolagem lateral é rede de segurança, e não o plano:
                    as colunas medem por porcentagem e a tabela cabe em
                    100vw. Fica para o caso extremo — texto ampliado no
                    sistema, palavra sem espaço num título traduzido —,
                    onde rolar de lado é melhor que estourar a tela. */}
                <div className="overflow-x-auto">
                  <table
                    className={`w-full ${larguraMinima} border-collapse text-left`}
                  >
                    <caption className="sr-only">{t('table.caption')}</caption>
                    <thead>
                      <tr className="border-y border-(--border-strong)">
                        <th
                          scope="col"
                          className={`py-4 ${primeiraColuna} ${larguraDaColuna.title}`}
                        >
                          <Ordenador
                            campo="title"
                            rotulo={rotulosDeColuna.title}
                            colunaAtiva={coluna}
                            sentido={sentido}
                            aoOrdenar={ordenarPor}
                            descricao={t('table.sortBy', {
                              column: rotulosDeColuna.title,
                            })}
                          />
                        </th>
                        <th
                          scope="col"
                          className={`py-4 ${colunaDoMeio} ${larguraDaColuna.category}`}
                        >
                          <Ordenador
                            campo="category"
                            rotulo={rotulosDeColuna.category}
                            colunaAtiva={coluna}
                            sentido={sentido}
                            aoOrdenar={ordenarPor}
                            descricao={t('table.sortBy', {
                              column: rotulosDeColuna.category,
                            })}
                          />
                        </th>
                        <th
                          scope="col"
                          className={`py-4 ${colunaDoMeio} ${larguraDaColuna.content}`}
                        >
                          <Ordenador
                            campo="content"
                            rotulo={rotulosDeColuna.content}
                            colunaAtiva={coluna}
                            sentido={sentido}
                            aoOrdenar={ordenarPor}
                            descricao={t('table.sortBy', {
                              column: rotulosDeColuna.content,
                            })}
                          />
                        </th>
                        <th
                          scope="col"
                          className={`py-4 ${colunaDoMeio} ${larguraDaColuna.date}`}
                        >
                          <Ordenador
                            campo="date"
                            rotulo={rotulosDeColuna.date}
                            colunaAtiva={coluna}
                            sentido={sentido}
                            aoOrdenar={ordenarPor}
                            descricao={t('table.sortBy', {
                              column: rotulosDeColuna.date,
                            })}
                          />
                        </th>
                        <th
                          scope="col"
                          className={`py-4 ${colunaDoMeio} ${larguraDaColuna.preview} ${rotuloDeColuna}`}
                        >
                          {t('table.preview')}
                        </th>
                        <th
                          scope="col"
                          className={`py-4 ${ultimaColuna} ${larguraDaColuna.download} text-right ${rotuloDeColuna}`}
                        >
                          {t('table.download')}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {visiveis.map((doc) => (
                        <tr
                          key={doc.id}
                          className="border-b border-(--border) align-top transition-colors duration-200 ease-brand hover:bg-(--overlay)"
                        >
                          <th
                            scope="row"
                            className={`max-w-[22rem] py-3 ${primeiraColuna} lg:py-5`}
                          >
                            <div className="flex flex-col items-start gap-1.5">
                              <button
                                type="button"
                                onClick={() => setAberto(doc)}
                                className="link-underline text-left text-[0.625rem] font-semibold leading-snug tracking-normal hyphens-auto wrap-anywhere lg:text-body lg:tracking-[-0.01em] lg:wrap-normal"
                              >
                                {doc.title[locale]}
                              </button>
                              <DocumentFormatBadge doc={doc} className="h-4 lg:h-7" />
                            </div>
                          </th>

                          <td className={`py-3 ${colunaDoMeio} lg:py-5`}>
                            <Selo doc={doc} categories={categories} locale={locale} />
                          </td>

                          <td
                            className={`max-w-[26rem] py-3 ${colunaDoMeio} text-[0.5625rem] leading-snug text-(--fg-muted) hyphens-auto wrap-anywhere lg:py-5 lg:text-small lg:leading-normal lg:wrap-normal`}
                          >
                            {/* No celular a coluna tem 55 px: a descrição
                                inteira ali são vinte e cinco linhas de
                                nove pixels, e a linha da tabela passava de
                                300 px de altura por causa dela. Seis
                                linhas com reticências dizem do que o
                                documento trata, e o texto completo está a
                                um toque — no título ou na prévia, que
                                abrem o arquivo. No computador nada é
                                cortado. */}
                            <span className="line-clamp-6 lg:line-clamp-none">
                              {doc.description?.[locale] || '-'}
                            </span>
                          </td>

                          <td
                            className={`py-3 ${colunaDoMeio} text-[0.5625rem] tabular-nums leading-snug text-(--fg-muted) lg:py-5 lg:text-small lg:normal-nums xl:whitespace-nowrap`}
                          >
                            <time dateTime={doc.publishedAt}>
                              <span className="lg:hidden">
                                {formatDateShort(
                                  doc.publishedAt,
                                  localeTag[locale],
                                )}
                              </span>
                              <span className="hidden lg:inline">
                                {formatDate(doc.publishedAt, localeTag[locale])}
                              </span>
                            </time>
                          </td>

                          <td className={`py-3 ${colunaDoMeio} lg:py-5`}>
                            <button
                              type="button"
                              onClick={() => setAberto(doc)}
                              aria-label={t('table.openDocument', {
                                title: doc.title[locale],
                              })}
                              className="block transition-opacity duration-200 ease-brand hover:opacity-75"
                            >
                              <DocumentPreview
                                doc={doc}
                                className="h-9 w-7 lg:h-28 lg:w-20"
                                sizes="(min-width: 1024px) 80px, 28px"
                              />
                            </button>
                          </td>

                          <td className={`py-3 ${ultimaColuna} lg:py-5`}>
                            <div className="flex flex-col items-end gap-1 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end lg:gap-2">
                              <BotaoVisualizar doc={doc} rotulo={tActions('view')} aoAbrir={setAberto} />
                              <BotaoBaixar doc={doc} rotulo={tActions('download')} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginação -------------------------------------- */}
                {totalPaginas > 1 ? (
                  <nav
                    aria-label={t('table.pagination')}
                    className="flex items-center justify-between gap-4 border-t border-(--border) pt-6"
                  >
                    <button
                      type="button"
                      onClick={() => setPagina(Math.max(1, paginaAtual - 1))}
                      disabled={paginaAtual === 1}
                      className="inline-flex min-h-11 items-center gap-2 border border-(--border-strong) px-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] transition-colors duration-200 ease-brand hover:border-(--fg) disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronLeft aria-hidden="true" className="size-4" />
                      {t('table.previous')}
                    </button>

                    <p aria-live="polite" className="text-small text-(--fg-muted)">
                      {t('table.pageOf', {
                        current: paginaAtual,
                        total: totalPaginas,
                      })}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setPagina(Math.min(totalPaginas, paginaAtual + 1))
                      }
                      disabled={paginaAtual === totalPaginas}
                      className="inline-flex min-h-11 items-center gap-2 border border-(--border-strong) px-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] transition-colors duration-200 ease-brand hover:border-(--fg) disabled:pointer-events-none disabled:opacity-40"
                    >
                      {t('table.next')}
                      <ChevronRight aria-hidden="true" className="size-4" />
                    </button>
                  </nav>
                ) : null}
              </>
            ) : (
              <EmptyState title={t('empty.noResults')} />
            )}
          </>
        ) : (
          <EmptyState
            title={t('empty.title')}
            description={t('empty.description')}
          />
        )}
      </Container>

      <DocumentViewer
        document={aberto}
        locale={locale}
        onClose={() => setAberto(null)}
      />
    </Section>
  )
}
