import { MapPin } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { BrazilMap, PinoIcone } from '@/components/ui/brazil-map'
import { Container, Section, type Surface } from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import type { ProjectLocation } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { atuacaoNoMapa } from '@/lib/mapa'
import { cn } from '@/lib/utils'

type CoverageSectionProps = {
  id: string
  locale: Locale
  locations: ProjectLocation[]
  /** Nome do projeto — entra na descrição do mapa para leitor de tela. */
  projectName: string
  surface?: Surface
}

/**
 * ONDE O PROJETO ACONTECE
 * =======================
 * O mapa do Brasil com um alfinete em cada cidade atendida, e as cidades
 * escritas em duas colunas, uma de cada lado do desenho.
 *
 * O mapa fica no meio, e menor do que o desenho pede: ele é o resumo que
 * se lê de longe, não a peça que ocupa a tela. As duas colunas o
 * emolduram — a da esquerda alinhada à direita, a da direita à esquerda,
 * as duas encostadas no mapa —, e é assim que a lista deixa de ser um
 * apêndice ao lado do desenho e passa a fazer parte da mesma figura.
 *
 * Os dois vêm da mesma fonte — os locais cadastrados no projeto — e por
 * isso nunca discordam. A lista é o que o leitor de tela lê, o que sobra
 * no papel impresso e o que atende a cidade que o mapa não conseguiu
 * localizar (comunidade, distrito, ou cidade fora do Brasil).
 *
 * No celular não há laterais: o mapa sobe para o topo — é a razão de a
 * seção existir — e as duas metades da lista descem embaixo dele, na
 * ordem em que foram cadastradas.
 */
export async function CoverageSection({
  id,
  locale,
  locations,
  projectName,
  surface = 'light',
}: CoverageSectionProps) {
  if (locations.length === 0) return null

  const t = await getTranslations({ locale, namespace: 'projects' })
  const { pontos, ufs } = atuacaoNoMapa(locations, locale)

  const resumo = [
    t('map.cities', { count: locations.length }),
    ufs.length > 0 ? t('map.states', { count: ufs.length }) : null,
  ]
    .filter(Boolean)
    .join(' · ')

  /* A metade ímpar sobra para a coluna da esquerda, que é a que se lê
     primeiro. */
  const meio = Math.ceil(locations.length / 2)
  const esquerda = locations.slice(0, meio)
  const direita = locations.slice(meio)

  /* Sem nenhum ponto resolvido não há mapa para emoldurar, e a lista
     ocupa a largura inteira em colunas iguais. */
  if (pontos.length === 0) {
    return (
      <Section surface={surface} id={id} ariaLabelledby={`${id}-title`}>
        <Container className="flex flex-col gap-stack">
          <SectionHeader
            id={`${id}-title`}
            eyebrow={t('labels.locations')}
            title={t('map.title')}
            description={resumo}
          />
          <ListaDeCidades
            locations={locations}
            locale={locale}
            className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3"
          />
        </Container>
      </Section>
    )
  }

  return (
    <Section surface={surface} id={id} ariaLabelledby={`${id}-title`}>
      <Container className="flex flex-col gap-stack">
        <SectionHeader
          id={`${id}-title`}
          eyebrow={t('labels.locations')}
          title={t('map.title')}
          description={resumo}
        />

        <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-12 lg:items-start">
          <ListaDeCidades
            locations={esquerda}
            locale={locale}
            aoContrario
            className="lg:col-span-4"
          />

          {/* O mapa vem primeiro no celular e volta para o meio no
              desktop. O teto de largura é o que o mantém do tamanho de um
              resumo: sem ele, um desenho mais alto que largo domina a
              seção inteira. */}
          <div className="order-first mb-10 flex flex-col items-center gap-5 lg:order-0 lg:col-span-4 lg:mb-0 lg:self-center">
            <BrazilMap
              points={pontos}
              states={ufs}
              label={t('map.alt', { project: projectName })}
              /* Os nomes estão nas colunas ao lado; repeti-los sobre um
                 mapa deste tamanho seria letra miúda em cima do desenho. */
              maxLabels={0}
              className="w-full max-w-96"
            />

            <p className="flex items-center gap-2.5 text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
              <PinoIcone className="h-4" />
              {t('map.legend')}
            </p>
          </div>

          <ListaDeCidades
            locations={direita}
            locale={locale}
            className="lg:col-span-4"
          />
        </div>
      </Container>
    </Section>
  )
}

/**
 * Uma coluna de cidades. `aoContrario` é a da esquerda do mapa: o texto
 * alinha à direita e o alfinete troca de lado, para os dois lados da
 * seção apontarem para o desenho no meio. No celular, onde não há mapa ao
 * lado, as duas voltam a ser a mesma coluna alinhada à esquerda.
 */
function ListaDeCidades({
  locations,
  locale,
  aoContrario = false,
  className,
}: {
  locations: ProjectLocation[]
  locale: Locale
  aoContrario?: boolean
  className?: string
}) {
  if (locations.length === 0) return null

  return (
    <StaggerContainer as="ul" className={className}>
      {locations.map((location) => (
        <StaggerItem
          key={`${location.city[locale]}-${location.region ?? ''}-${location.venue ?? ''}`}
          as="li"
          className={cn(
            'flex items-start gap-3 border-t border-(--border) py-4 text-body',
            aoContrario && 'lg:flex-row-reverse lg:text-right',
          )}
        >
          <MapPin
            aria-hidden="true"
            className="mt-1.5 size-4 shrink-0 text-(--accent-text)"
          />
          <span>
            {location.city[locale]}
            {location.region ? (
              <span className="text-(--fg-subtle)">{`, ${location.region}`}</span>
            ) : null}
            {location.venue ? (
              <span className="block text-small text-(--fg-muted)">
                {location.venue}
              </span>
            ) : null}
          </span>
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}
