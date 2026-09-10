import { getTranslations } from 'next-intl/server'
import { ReachMap } from '@/components/sections/reach-map'
import { BrazilMap } from '@/components/ui/brazil-map'
import { Container, Section, type Surface } from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import type { Project } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { atuacaoNoGlobo, atuacaoNoMapa } from '@/lib/mapa'

type ReachSectionProps = {
  projects: Project[]
  locale: Locale
  id?: string
  surface?: Surface
}

/**
 * ONDE A AIDEP ESTÁ
 * =================
 * A atuação dos três projetos reunida em um mapa só, na Página inicial.
 *
 * Até agora cada projeto tinha o próprio mapa, dentro da própria página, e
 * quem chegava na Home não tinha como ver o alcance da associação inteira
 * sem abrir três páginas e somar de cabeça. Esta seção é essa soma: o
 * globo com todos os pontos, o filtro para separá-los de novo por projeto
 * e a lista com o nome de cada cidade.
 *
 * QUEM RESOLVE O QUÊ
 * ------------------
 * Este componente roda no servidor porque é aqui que mora a tabela dos
 * 5.571 municípios do IBGE (`lib/municipios.ts`, `server-only`): é ela que
 * transforma "Poço Verde, SE" em latitude e longitude. O cliente recebe as
 * poucas dezenas de pontos já resolvidos — nunca o cadastro.
 *
 * O mapa plano do Brasil é montado aqui do mesmo jeito, em HTML, e desce
 * como reserva: é o que aparece enquanto o globo carrega, e o que fica no
 * lugar dele em navegador sem WebGL.
 *
 * UMA TELA, UMA SEÇÃO
 * -------------------
 * No desktop a seção mede uma tela cheia (`h-svh`) e a altura é repartida
 * numa coluna de flex: o título fica com o que precisa (`shrink-0`) e o mapa
 * recebe todo o resto (`flex-1` com `min-h-0`). É o `min-h-0` que faz a
 * conta fechar — sem ele a lista de vinte e nove cidades estica a grade, a
 * grade estica o globo, e a seção transborda a tela em vez de a lista rolar
 * por dentro.
 *
 * O título continua em cima das duas colunas, como nas outras seções. Só o
 * texto de apoio da direita ("gire o planeta ou escolha uma cidade na
 * lista") saiu: ele ficava exatamente sobre o globo, e a dica embaixo do
 * planeta já diz o mesmo, no lugar em que a mão está.
 *
 * O piso de `44rem` é para janela baixa. Abaixo disso o globo viraria uma
 * faixa e nada mais, e vale mais deixar a seção passar um pouco da tela do
 * que entregar um planeta de dois dedos de altura. No celular a altura
 * continua livre — lá as duas colunas estão empilhadas, e caber numa tela
 * só nunca foi possível.
 *
 * OS RESPIROS, AQUI, SÃO CONTADOS
 * -------------------------------
 * Numa seção de altura fixa cada pixel de respiro sai do globo, e por isso
 * eles não são os das outras seções: `pt-24` em cima, `pb-10` embaixo, e
 * `gap-6` entre o título e o mapa. Só o de cima é intocável — o cabeçalho
 * do site tem 5,5rem e fica **por cima** da página; numa seção da altura da
 * tela é comum o visitante parar a rolagem justo com o topo dela alinhado
 * ao topo da janela, e o respiro menor deixaria a barra branca cobrindo a
 * régua e o "onde estamos".
 */
export async function ReachSection({
  projects,
  locale,
  id = 'atuacao',
  surface = 'dark',
}: ReachSectionProps) {
  const t = await getTranslations({ locale, namespace: 'home.reach' })

  const cidades = atuacaoNoGlobo(projects, locale)
  if (cidades.length === 0) return null

  /* O mapa plano de reserva mostra todos os pontos, sem nome: com quase
     trinta cidades os rótulos se atropelariam, e quem precisa do nome tem
     a lista ao lado. */
  const todosOsLocais = projects.flatMap((projeto) => projeto.locations)
  const { pontos, ufs } = atuacaoNoMapa(todosOsLocais, locale)

  return (
    <Section
      id={id}
      surface={surface}
      ariaLabelledby={`${id}-title`}
      className="lg:h-svh lg:min-h-176 lg:pb-10 lg:pt-24"
    >
      <Container className="flex flex-col gap-stack lg:h-full lg:gap-6">
        <SectionHeader
          id={`${id}-title`}
          eyebrow={t('eyebrow')}
          title={t('title')}
          className="shrink-0 lg:gap-5"
        />

        <ReachMap
          cidades={cidades}
          projetos={projects.map((projeto) => ({
            slug: projeto.slug,
            nome: projeto.name,
          }))}
          fallback={
            <BrazilMap
              points={pontos}
              states={ufs}
              label={t('globeLabel')}
              maxLabels={0}
              className="h-full"
              svgClassName="h-full w-auto"
            />
          }
        />
      </Container>
    </Section>
  )
}
