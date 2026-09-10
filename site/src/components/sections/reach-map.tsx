'use client'

import { MapPin, Move3d, Navigation, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { ArrowLink } from '@/components/ui/arrow-link'
import {
  InteractiveBrazilMap,
  type ControleDoMapa,
} from '@/components/ui/interactive-brazil-map'
import type { CidadeNaAtuacao } from '@/lib/mapa'
import { cn } from '@/lib/utils'

type ProjetoNoFiltro = { slug: string; nome: string }

type ReachMapProps = {
  cidades: CidadeNaAtuacao[]
  projetos: ProjetoNoFiltro[]
  /** Régua, olho e título da seção — montados no servidor, postos aqui. */
  cabecalho: ReactNode
}

/**
 * O PAINEL AO LADO DO MAPA
 * ========================
 * O mapa é a leitura de longe; este painel é a leitura de perto — e é
 * ele, não o mapa, que carrega o conteúdo.
 *
 * A lista de cidades é HTML de verdade, com um botão por cidade. Quem usa
 * teclado percorre a atuação inteira com Tab; quem usa leitor de tela
 * ouve cidade, estado e projetos sem nunca precisar do desenho; e quem
 * tem o mapa na frente clica na lista e vê o país aproximar até a cidade.
 * As três formas leem o mesmo dado, porque é o mesmo dado.
 *
 * O filtro por projeto apaga alfinetes no mapa e encurta a lista ao mesmo
 * tempo. Quando a cidade escolhida sai do filtro, a escolha cai junto —
 * deixar uma ficha aberta de uma cidade que não está mais no mapa seria
 * mostrar duas verdades ao mesmo tempo.
 */
export function ReachMap({ cidades, projetos, cabecalho }: ReachMapProps) {
  const t = useTranslations('home.reach')

  const [filtro, setFiltro] = useState<string | null>(null)
  const [escolhida, setEscolhida] = useState<string | null>(null)

  const mapa = useRef<ControleDoMapa>(null)

  const visiveis = useMemo(() => {
    if (!filtro) return null
    return new Set(
      cidades
        .filter((cidade) => cidade.projetos.some((p) => p.slug === filtro))
        .map((cidade) => cidade.id),
    )
  }, [cidades, filtro])

  /**
   * As cidades da lista, cada uma com o número de polos **do recorte no
   * ar**. Com o filtro em Coração Valente, Aracaju mostra cinco polos, e
   * não os seis que ela tem somando o Futsal na Escola: o número ao lado
   * do nome tem de fechar com o total logo acima dele.
   */
  const listadas = useMemo(() => {
    const base = visiveis
      ? cidades.filter((cidade) => visiveis.has(cidade.id))
      : cidades

    if (!filtro) return base.map((cidade) => ({ ...cidade, noRecorte: cidade.polos }))

    return base.map((cidade) => ({
      ...cidade,
      noRecorte: cidade.projetos.find((p) => p.slug === filtro)?.polos ?? 0,
    }))
  }, [cidades, visiveis, filtro])

  const polos = listadas.reduce((total, cidade) => total + cidade.noRecorte, 0)

  const aberta = listadas.find((cidade) => cidade.id === escolhida) ?? null

  function trocarFiltro(slug: string | null) {
    setFiltro(slug)

    /* A escolha só sobrevive se a cidade continuar no recorte. */
    const sobrevive =
      escolhida !== null &&
      (slug === null ||
        cidades.some(
          (cidade) =>
            cidade.id === escolhida &&
            cidade.projetos.some((p) => p.slug === slug),
        ))

    if (!sobrevive) setEscolhida(null)

    /* E o mapa vai atrás do recorte novo — a não ser que a cidade aberta
       tenha sobrevivido a ele, e aí o enquadramento continua sendo dela:
       trocar de filtro sem perder a cidade não pode tirá-la da vista.

       Quem reenquadra é este clique, e não o mapa reagindo à prop do
       filtro: o mapa não tem como distinguir "o recorte mudou agora" de
       "esta renderização passou de novo por aqui", e adivinhar isso com um
       efeito é o caminho curto para a vista pular sozinha. */
    if (!sobrevive) {
      mapa.current?.enquadrar(
        slug
          ? cidades.filter((cidade) =>
              cidade.projetos.some((p) => p.slug === slug),
            )
          : null,
      )
    }
  }

  return (
    /* DUAS COLUNAS DA MESMA ALTURA
       ----------------------------
       Texto à esquerda, mapa à direita, e as duas colunas começando e
       terminando na mesma linha — o título entra aqui dentro, no alto da
       esquerda, e não numa faixa acima das duas.

       É a diferença entre um desenho inteiro e um desenho espremido. Com o
       título por cima, o mapa só podia começar abaixo dele: ficava um
       vazio preto do tamanho de um parágrafo à direita do texto e o país
       era achatado no resto da altura. Dentro da coluna, o título ocupa o
       vazio que era dele e a altura da seção inteira volta para o mapa.

       A conta é a grade: duas linhas, a de cima do tamanho do título
       (`auto`) e a de baixo com o que sobrar (`minmax(0,1fr)`). O mapa
       atravessa as duas, então mede exatamente título + filtros + lista.
       O `minmax(0,...)` no lugar de um `1fr` seco é o que deixa a linha
       encolher abaixo do conteúdo dela — sem isso a lista das vinte e nove
       cidades estica a grade, a grade estica o mapa, e a seção sai pela
       tela (era exatamente esse o desarranjo). Cinco colunas para o texto,
       que precisa de largura para o título e para "Canindé de São
       Francisco · SE"; sete para o país.

       No celular a grade vira uma pilha e a ordem é a do olho: título,
       mapa, filtros e lista — ninguém rola vinte e nove cidades para
       descobrir que havia um mapa embaixo. */
    <div className="flex flex-col gap-y-10 lg:grid lg:h-full lg:min-h-0 lg:grid-cols-12 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-x-8 lg:gap-y-6">
      {/* ---- Título ------------------------------------------------ */}
      <div className="order-1 lg:col-span-5 lg:col-start-1 lg:row-start-1">
        {cabecalho}
      </div>

      {/* ---- Mapa --------------------------------------------------
          A MOLDURA
          No celular ela é 5/4 da largura, como sempre. No desktop a conta
          se inverte: a moldura toma a coluna inteira, das duas linhas, e é
          a altura dela que decide o tamanho do desenho — o SVG entra com
          `xMidYMid meet`, então o país fica do tamanho da altura
          disponível, com folga nas laterais.

          O `pb-8` embaixo é onde a dica de manuseio se prende, fora do
          desenho; o `pt-2` em cima é só o que separa os botões de zoom da
          borda da coluna. O mapa não pede mais que isso: diferente do globo
          que estava aqui, ele não tem halo para raspar a moldura — o país
          desenhado cabe no viewBox e sobra margem por construção. */}
      <div className="relative order-2 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:min-h-0 lg:pb-8 lg:pt-2">
        <InteractiveBrazilMap
          ref={mapa}
          cidades={cidades}
          escolhida={escolhida}
          onEscolher={setEscolhida}
          visiveis={visiveis}
          rotulos={{
            mapa: t('mapLabel'),
            aproximar: t('zoomIn'),
            afastar: t('zoomOut'),
            reenquadrar: t('zoomReset'),
          }}
          className="aspect-5/4 w-full lg:aspect-auto lg:h-full"
        />

        {/* A ficha da cidade, no canto de baixo à direita do mapa.
            Ela ficava na coluna da esquerda, e de lá empurrava a lista
            inteira para baixo a cada clique — a página dava um solavanco
            e a cidade escolhida saía de vista. Aqui ela abre por cima do
            desenho, onde o olho já está, e nada se move.

            No celular não há canto para ocupar: a ficha volta a ser um
            bloco comum, abaixo do mapa. */}
        {aberta ? (
          <FichaDaCidade
            cidade={aberta}
            onFechar={() => setEscolhida(null)}
            className="mt-4 lg:absolute lg:bottom-4 lg:right-4 lg:mt-0 lg:w-[19rem]"
          />
        ) : null}

        {/* A dica de manuseio. No desktop ela se prende no pé da moldura,
            dentro da folga do `pb-8`, em vez de ocupar uma linha própria
            embaixo do mapa: numa seção de altura fixa aquela linha sairia
            da altura do desenho. `pointer-events-none` para o arrasto do
            mapa atravessar o texto. */}
        <p className="mt-3 flex items-center justify-center gap-3 text-micro uppercase tracking-[0.14em] text-(--fg-subtle) lg:pointer-events-none lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0">
          <Move3d aria-hidden="true" className="size-4" />
          {t('hint')}
        </p>
      </div>

      {/* ---- Painel ------------------------------------------------ */}
      <div className="order-3 flex flex-col gap-6 lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:min-h-0">
        <Reveal distance={24}>
          <div
            role="group"
            aria-label={t('filters.label')}
            className="flex flex-wrap gap-2"
          >
            <Chip aceso={filtro === null} onClick={() => trocarFiltro(null)}>
              {t('filters.all')}
            </Chip>
            {projetos.map((projeto) => (
              <Chip
                key={projeto.slug}
                aceso={filtro === projeto.slug}
                onClick={() => trocarFiltro(projeto.slug)}
              >
                {projeto.nome}
              </Chip>
            ))}
          </div>
        </Reveal>

        <Reveal distance={24} delay={0.06}>
          <p className="text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
            {t('summary', { cities: listadas.length, hubs: polos })}
          </p>
        </Reveal>

        {/* A lista rola por dentro para não empurrar o mapa para fora da
            tela quando os filtros abrem as dezenas de cidades. No celular o
            teto é fixo; no desktop ele é a altura que sobrou na coluna, seja
            ela qual for. */}
        <ul className="flex max-h-[26rem] flex-col overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] lg:max-h-none lg:min-h-0 lg:flex-1">
          {listadas.map((cidade) => {
            const ativa = cidade.id === escolhida
            return (
              <li key={cidade.id}>
                <button
                  type="button"
                  onClick={() => setEscolhida(ativa ? null : cidade.id)}
                  aria-pressed={ativa}
                  className={cn(
                    'flex w-full items-center gap-3 border-t border-(--border) py-3 text-left transition-colors duration-200 ease-brand',
                    ativa ? 'text-(--accent-text)' : 'hover:text-(--accent-text)',
                  )}
                >
                  <MapPin
                    aria-hidden="true"
                    className={cn(
                      'size-4 shrink-0',
                      ativa ? 'text-(--accent)' : 'text-(--fg-subtle)',
                    )}
                  />
                  <span className="flex-1 text-small font-medium leading-snug">
                    {cidade.cidade}
                    {cidade.uf ? (
                      <span className="text-(--fg-subtle)">{` · ${cidade.uf}`}</span>
                    ) : null}
                  </span>
                  {cidade.noRecorte > 1 ? (
                    <span className="text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
                      {t('hubs', { count: cidade.noRecorte })}
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/**
 * A FICHA DA CIDADE
 * =================
 * O que se sabe de uma cidade: quais projetos atuam nela, quantos polos
 * cada um mantém, o caminho para a página do projeto e o endereço no
 * Google Maps.
 *
 * O link do Maps usa a coordenada, e não o nome da cidade: o nome dá
 * margem a homônimo — Itabaiana existe em Sergipe e na Paraíba — e a
 * coordenada é exatamente a mesma que pôs o alfinete no mapa. O formato
 * `?api=1&query=lat,lng` é o endereço documentado do Google para isso, e
 * funciona igual no aplicativo do celular e no navegador.
 */
function FichaDaCidade({
  cidade,
  onFechar,
  className,
}: {
  cidade: CidadeNaAtuacao
  onFechar: () => void
  className?: string
}) {
  const t = useTranslations('home.reach')

  const noMapa = `https://www.google.com/maps/search/?api=1&query=${cidade.lat},${cidade.lng}`

  return (
    <article
      className={cn(
        'border border-(--accent)/45 bg-(--bg)/94 p-5 shadow-menu backdrop-blur-md',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-h4 font-bold tracking-[-0.02em]">{cidade.cidade}</h3>
          {cidade.uf || cidade.detalhe ? (
            <p className="mt-1 text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
              {[cidade.detalhe, cidade.uf]
                .filter(
                  (parte, indice, todas) =>
                    Boolean(parte) && todas.indexOf(parte) === indice,
                )
                .join(' · ')}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onFechar}
          className="-m-2 flex size-9 shrink-0 items-center justify-center text-(--fg-subtle) transition-colors duration-200 ease-brand hover:text-(--fg)"
        >
          <X aria-hidden="true" className="size-4" />
          <span className="sr-only">{t('close')}</span>
        </button>
      </div>

      <dl className="mt-4 flex flex-col gap-2.5 border-t border-(--border) pt-4">
        {cidade.projetos.map((projeto) => (
          <div key={projeto.slug} className="flex items-baseline gap-3">
            <dt className="flex-1 text-small font-semibold leading-snug">
              {projeto.nome}
            </dt>
            <dd className="shrink-0 text-micro uppercase tracking-[0.14em] text-(--accent-text)">
              {t('hubs', { count: projeto.polos })}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-col gap-3">
        <a
          href={noMapa}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex min-h-11 items-center justify-center gap-2.5 bg-(--accent) px-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-(--accent-contrast) transition-opacity duration-200 ease-brand hover:opacity-90"
        >
          <Navigation aria-hidden="true" className="size-4" />
          {t('openMaps')}
        </a>

        {cidade.projetos.length === 1 ? (
          <ArrowLink
            href={{
              pathname: '/projects/[slug]',
              params: { slug: cidade.projetos[0].slug },
            }}
          >
            {t('seeProject')}
          </ArrowLink>
        ) : null}
      </div>
    </article>
  )
}

function Chip({
  aceso,
  onClick,
  children,
}: {
  aceso: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aceso}
      className={cn(
        'inline-flex min-h-9 items-center px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.1em] transition-colors duration-200 ease-brand',
        aceso
          ? 'bg-(--accent) text-(--accent-contrast)'
          : 'border border-(--border-strong) text-(--fg-muted) hover:border-(--fg) hover:text-(--fg)',
      )}
    >
      {children}
    </button>
  )
}
