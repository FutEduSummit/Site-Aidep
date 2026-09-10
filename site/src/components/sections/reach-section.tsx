import { getTranslations } from 'next-intl/server'
import { ReachMap } from '@/components/sections/reach-map'
import { Container, Section, type Surface } from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import type { Project } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { atuacaoReunida } from '@/lib/mapa'

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
 * mapa com todos os pontos, o filtro para separá-los de novo por projeto
 * e a lista com o nome de cada cidade.
 *
 * QUEM RESOLVE O QUÊ
 * ------------------
 * Este componente roda no servidor porque é aqui que mora a tabela dos
 * 5.571 municípios do IBGE (`lib/municipios.ts`, `server-only`): é ela que
 * transforma "Poço Verde, SE" em um ponto sobre o desenho do país. O
 * cliente recebe as poucas dezenas de cidades já resolvidas — nunca o
 * cadastro.
 *
 * Daí para baixo é tudo SVG. O mapa sai pronto no HTML do servidor, com o
 * contorno dos 27 estados e os vinte e nove alfinetes no lugar: quem está
 * com script bloqueado, ou ainda esperando o JavaScript, já vê a atuação
 * inteira. O que o navegador acrescenta é o manuseio — aproximar,
 * arrastar, escolher uma cidade.
 *
 * UMA TELA, DUAS COLUNAS
 * ----------------------
 * No desktop a seção mede uma tela cheia (`h-svh`) e essa altura vai
 * inteira para a grade de duas colunas de `reach-map.tsx`: texto à
 * esquerda, mapa à direita, do topo ao pé da seção.
 *
 * Por isso o título desce para dentro do mapa, como `cabecalho`, em vez de
 * ficar numa faixa acima das duas colunas: naquela forma o desenho só
 * começava depois do fim do título e sobrava um vazio preto do tamanho de
 * um parágrafo ao lado dele, com o país achatado no que restava da altura.
 * Passando o título para a coluna da esquerda, as duas colunas começam e
 * terminam na mesma linha e o mapa recebe a altura toda.
 *
 * O piso de `44rem` é para janela baixa. Abaixo disso o mapa viraria uma
 * faixa e nada mais, e vale mais deixar a seção passar um pouco da tela do
 * que entregar um Brasil de dois dedos de altura. No celular a altura
 * continua livre — lá as duas colunas estão empilhadas, e caber numa tela
 * só nunca foi possível.
 *
 * OS RESPIROS, AQUI, SÃO CONTADOS
 * -------------------------------
 * Numa seção de altura fixa cada pixel de respiro sai do mapa, e por isso
 * eles não são os das outras seções: `pt-24` em cima e `pb-10` embaixo. Só
 * o de cima é intocável — o cabeçalho do site tem 5,5rem e fica **por
 * cima** da página; numa seção da altura da tela é comum o visitante parar
 * a rolagem justo com o topo dela alinhado ao topo da janela, e o respiro
 * menor deixaria a barra branca cobrindo a régua e o "onde estamos".
 */
export async function ReachSection({
  projects,
  locale,
  id = 'atuacao',
  surface = 'dark',
}: ReachSectionProps) {
  const t = await getTranslations({ locale, namespace: 'home.reach' })

  const cidades = atuacaoReunida(projects, locale)
  if (cidades.length === 0) return null

  return (
    <Section
      id={id}
      surface={surface}
      ariaLabelledby={`${id}-title`}
      className="lg:h-svh lg:min-h-176 lg:pb-10 lg:pt-24"
    >
      <Container className="lg:h-full">
        <ReachMap
          cidades={cidades}
          projetos={projects.map((projeto) => ({
            slug: projeto.slug,
            nome: projeto.name,
          }))}
          /* O título é montado aqui, com as traduções do servidor e o `id`
             que a seção aponta em `aria-labelledby`; quem o **posiciona** é
             a grade do mapa, que o põe no alto da coluna da esquerda.
             `stacked` porque dentro de uma coluna de cinco não cabe a grade
             de doze que o cabeçalho armaria sozinho. */
          cabecalho={
            <SectionHeader
              id={`${id}-title`}
              eyebrow={t('eyebrow')}
              title={t('title')}
              layout="stacked"
              className="lg:gap-5"
            />
          }
        />
      </Container>
    </Section>
  )
}
