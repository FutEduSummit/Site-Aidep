'use client'

import { MapPin, Move3d, Navigation, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState, type ReactNode } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { ArrowLink } from '@/components/ui/arrow-link'
import { Globe, type CidadeNoGlobo } from '@/components/ui/globe'
import { cn } from '@/lib/utils'

type ProjetoNoFiltro = { slug: string; nome: string }

type ReachMapProps = {
  cidades: CidadeNoGlobo[]
  projetos: ProjetoNoFiltro[]
  /** Mapa plano servido pelo servidor: reserva para quem não tem WebGL. */
  fallback: ReactNode
}

/**
 * O PAINEL AO LADO DO GLOBO
 * =========================
 * O globo é a leitura de longe; este painel é a leitura de perto — e é
 * ele, não o globo, que carrega o conteúdo.
 *
 * A lista de cidades é HTML de verdade, com um botão por cidade. Quem usa
 * teclado percorre a atuação inteira com Tab; quem usa leitor de tela
 * ouve cidade, estado e projetos sem nunca precisar do WebGL; e quem tem
 * o globo na frente clica na lista e vê o planeta girar até a cidade. As
 * três formas leem o mesmo dado, porque é o mesmo dado.
 *
 * O filtro por projeto apaga marcadores no globo e encurta a lista ao
 * mesmo tempo. Quando a cidade escolhida sai do filtro, a escolha cai
 * junto — deixar uma ficha aberta de uma cidade que não está mais no mapa
 * seria mostrar duas verdades ao mesmo tempo.
 */
export function ReachMap({ cidades, projetos, fallback }: ReachMapProps) {
  const t = useTranslations('home.reach')

  const [filtro, setFiltro] = useState<string | null>(null)
  const [escolhida, setEscolhida] = useState<string | null>(null)

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
    /* A escolha só sobrevive se a cidade continuar no mapa. */
    if (
      escolhida &&
      slug &&
      !cidades.some(
        (cidade) =>
          cidade.id === escolhida && cidade.projetos.some((p) => p.slug === slug),
      )
    ) {
      setEscolhida(null)
    }
  }

  return (
    /* DUAS COLUNAS, UMA LINHA
       -----------------------
       O globo à direita, o painel à esquerda, e nada mais: uma linha só de
       grade. O título vem de fora, da seção (`reach-section.tsx`), em cima
       das duas colunas.

       A altura vem de cima também: a seção mede uma tela, o título fica com
       o que precisa e esta grade recebe o resto (`flex-1`). Os
       `min-h-0` são o que permite as duas colunas encolherem abaixo do
       próprio conteúdo; sem eles a lista das vinte e nove cidades estica a
       grade, a grade estica o globo, e a seção inteira sai pela tela
       (era exatamente esse o desarranjo). Oito colunas para o planeta e
       quatro para a lista, que precisa de largura para "Canindé de São
       Francisco · SE".

       No celular a grade é uma coluna e vale a ordem do código: o globo vem
       primeiro, antes dos filtros — ninguém rola vinte e nove cidades para
       descobrir que havia um planeta embaixo. */
    <div className="grid grid-cols-1 items-start gap-x-8 gap-y-10 lg:min-h-0 lg:flex-1 lg:grid-cols-12 lg:items-stretch">
      {/* ---- Globo ------------------------------------------------- */}
      <div className="flex flex-col gap-3 lg:col-span-8 lg:col-start-5 lg:row-start-1 lg:min-h-0">
        {/* A MOLDURA DO GLOBO
            No celular ela é 5/4 da largura, como sempre. No desktop a conta
            se inverte: a moldura toma a coluna inteira, e é a altura da
            janela que decide o tamanho do planeta — a câmera enquadra pela
            vertical (ver `medir()`, em `lib/globo.ts`), então o globo fica
            do tamanho da altura disponível, com folga nas laterais. */}
        <div className="relative lg:min-h-0 lg:flex-1">
          <Globe
            cidades={cidades}
            escolhida={escolhida}
            onEscolher={setEscolhida}
            visiveis={visiveis}
            label={t('globeLabel')}
            semWebgl={fallback}
            className="lg:aspect-auto lg:h-full"
          />

          {/* A ficha da cidade, no canto de baixo à direita do globo.
              Ela ficava na coluna da esquerda, e de lá empurrava a lista
              inteira para baixo a cada clique — a página dava um solavanco
              e a cidade escolhida saía de vista. Aqui ela abre por cima do
              planeta, onde o olho já está, e nada se move.

              No celular não há canto para ocupar: a ficha volta a ser um
              bloco comum, abaixo do globo. */}
          {aberta ? (
            <FichaDaCidade
              cidade={aberta}
              onFechar={() => setEscolhida(null)}
              className="mt-4 lg:absolute lg:bottom-4 lg:right-4 lg:mt-0 lg:w-[19rem]"
            />
          ) : null}

          {/* A dica de manuseio. No desktop ela flutua no pé da moldura, por
              cima da borda escura do planeta, em vez de ocupar uma linha
              embaixo dele: numa seção de altura fixa aquela linha sairia da
              altura do globo. `pointer-events-none` para o arrasto do
              planeta atravessar o texto. */}
          <p className="mt-3 flex items-center justify-center gap-3 text-micro uppercase tracking-[0.14em] text-(--fg-subtle) lg:pointer-events-none lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0">
            <Move3d aria-hidden="true" className="size-4" />
            {t('hint')}
          </p>
        </div>
      </div>

      {/* ---- Painel ------------------------------------------------ */}
      <div className="flex flex-col gap-6 lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:min-h-0">
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

        {/* A lista rola por dentro para não empurrar o globo para fora da
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
 * coordenada é exatamente a mesma que pôs o pino no globo. O formato
 * `?api=1&query=lat,lng` é o endereço documentado do Google para isso, e
 * funciona igual no aplicativo do celular e no navegador.
 */
function FichaDaCidade({
  cidade,
  onFechar,
  className,
}: {
  cidade: CidadeNoGlobo
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
