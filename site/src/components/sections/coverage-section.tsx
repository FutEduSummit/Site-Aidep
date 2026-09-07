import { MapPin } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { BrazilMap } from '@/components/ui/brazil-map'
import { Container, Section, type Surface } from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import type { ProjectLocation } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { atuacaoNoMapa } from '@/lib/mapa'

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
 * O mapa do Brasil com um ponto em cada cidade atendida, e ao lado a lista
 * das cidades com estado e equipamento.
 *
 * Os dois vêm da mesma fonte — os locais cadastrados no projeto — e por
 * isso nunca discordam. O mapa é o resumo que se lê de longe; a lista é o
 * que o leitor de tela lê, o que sobra no papel impresso e o que atende a
 * cidade que o mapa não conseguiu localizar (comunidade, distrito, ou
 * cidade fora do Brasil).
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

  return (
    <Section surface={surface} id={id} ariaLabelledby={`${id}-title`}>
      <Container className="flex flex-col gap-stack">
        <SectionHeader
          id={`${id}-title`}
          eyebrow={t('labels.locations')}
          title={t('map.title')}
          description={resumo}
        />

        <div className="grid grid-cols-1 items-start gap-x-8 gap-y-12 lg:grid-cols-12">
          {pontos.length > 0 ? (
            <div className="flex flex-col gap-6 lg:col-span-7">
              {/* O desenho é mais alto que largo: sem um teto de largura
                  ele domina a tela e desequilibra a seção. */}
              <BrazilMap
                points={pontos}
                states={ufs}
                label={t('map.alt', { project: projectName })}
                className="max-w-[40rem]"
              />

              <p className="flex items-center gap-3 text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-pill bg-brand-600 ring-4 ring-brand-500/20"
                />
                {t('map.legend')}
              </p>
            </div>
          ) : null}

          <StaggerContainer
            as="ul"
            className={
              pontos.length > 0
                ? 'flex flex-col lg:col-span-4 lg:col-start-9'
                : 'grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-3'
            }
          >
            {locations.map((location) => (
              <StaggerItem
                key={`${location.city[locale]}-${location.region ?? ''}-${location.venue ?? ''}`}
                as="li"
                className="flex items-start gap-3 border-t border-(--border) py-4 text-body"
              >
                <MapPin
                  aria-hidden="true"
                  className="mt-1.5 size-4 shrink-0 text-(--accent-text)"
                />
                <span>
                  {location.city[locale]}
                  {location.region ? (
                    <span className="text-(--fg-subtle)">{` — ${location.region}`}</span>
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
        </div>
      </Container>
    </Section>
  )
}
