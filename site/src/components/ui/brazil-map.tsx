import { mapaBrasil } from '@/content/mapa-brasil'
import type { PontoDeAtuacao } from '@/lib/mapa'
import { cn } from '@/lib/utils'

type BrazilMapProps = {
  points: PontoDeAtuacao[]
  /** UFs acesas — os estados onde o projeto atua. */
  states: string[]
  /** Descrição do mapa inteiro para quem usa leitor de tela. */
  label: string
  className?: string
  /**
   * Com muitos pontos os nomes se atropelam; a partir daqui só ficam os
   * pontos, e os nomes ficam na lista ao lado (e no tooltip de cada ponto).
   */
  maxLabels?: number
}

/** Folga entre o ponto e o nome, em unidades do viewBox. */
const DO_PONTO = 14

/**
 * MAPA DO BRASIL COM AS CIDADES DO PROJETO
 * ========================================
 * Desenho vetorial dos 27 estados (`content/mapa-brasil.ts`, gerado por
 * `npm run mapa:dados` a partir do dado público do IBGE) com um ponto em
 * cima de cada cidade atendida.
 *
 * Sem JavaScript no cliente: o mapa é SVG renderizado no servidor, os
 * pontos já vêm projetados de `lib/mapa.ts` e o realce ao passar o mouse é
 * CSS. Quem chega com a rede ruim, com script bloqueado ou imprimindo a
 * página vê o mapa igual.
 *
 * O `paint-order` do rótulo desenha o contorno claro antes do texto: é o
 * que mantém o nome da cidade legível quando ele cai sobre o desenho.
 */
export function BrazilMap({
  points,
  states,
  label,
  className,
  maxLabels = 16,
}: BrazilMapProps) {
  const acesos = new Set(states)
  const comRotulo = points.length > 0 && points.length <= maxLabels

  return (
    <svg
      viewBox={`-4 -4 ${mapaBrasil.largura + 8} ${mapaBrasil.altura + 8}`}
      role="img"
      aria-label={label}
      className={cn('h-auto w-full', className)}
    >
      <g strokeLinejoin="round">
        {mapaBrasil.estados.map((estado) => (
          <path
            key={estado.uf}
            d={estado.d}
            /* Estado com projeto fica no verde da marca; os outros, no
               cinza do grafismo — o país inteiro aparece, e o recorte da
               atuação se lê de longe. */
            className={
              acesos.has(estado.uf)
                ? 'fill-brand-500/18 stroke-brand-500/45'
                : 'fill-(--grafismo) stroke-(--border)'
            }
            strokeWidth={1.6}
          />
        ))}
      </g>

      {/* Linha discreta ponto → nome, só onde o nome precisou descer para
          não encostar no do vizinho. */}
      {comRotulo ? (
        <g className="stroke-(--accent-text)/45" strokeWidth={1.2}>
          {points
            .filter((ponto) => ponto.comLinha)
            .map((ponto) => (
              <line
                key={ponto.id}
                x1={ponto.x}
                y1={ponto.y}
                x2={ponto.x + (ponto.lado === 'direita' ? DO_PONTO : -DO_PONTO)}
                y2={ponto.rotuloY - 5}
              />
            ))}
        </g>
      ) : null}

      {points.map((ponto) => (
        <g key={ponto.id} className="group/ponto">
          <title>
            {ponto.detalhe ? `${ponto.rotulo} — ${ponto.detalhe}` : ponto.rotulo}
          </title>

          {/* Halo: dá volume ao ponto e cresce ao passar o mouse.
              `transform-box: fill-box` é o que faz a escala crescer a
              partir do centro do círculo, e não da origem do SVG. */}
          <circle
            cx={ponto.x}
            cy={ponto.y}
            r={16}
            className="origin-center fill-brand-500/18 transform-fill transition-transform duration-300 ease-brand group-hover/ponto:scale-135"
          />
          <circle
            cx={ponto.x}
            cy={ponto.y}
            r={8}
            className="fill-brand-600 stroke-(--bg)"
            strokeWidth={3}
          />
        </g>
      ))}

      {/* Os nomes vão por último, todos juntos: cidades vizinhas — três no
          mesmo estado, por exemplo — têm ponto quase em cima do nome do
          vizinho, e desenhando todos os pontos antes nenhum deles cobre
          letra nenhuma. */}
      {comRotulo ? (
        <g
          fontSize={22}
          strokeWidth={6}
          className="fill-(--fg) font-semibold [paint-order:stroke_fill] stroke-(--bg)"
        >
          {points.map((ponto) => (
            <text
              key={ponto.id}
              x={ponto.x + (ponto.lado === 'direita' ? DO_PONTO + 6 : -DO_PONTO - 6)}
              y={ponto.rotuloY}
              textAnchor={ponto.lado === 'direita' ? 'start' : 'end'}
              dominantBaseline="middle"
            >
              {ponto.rotulo}
            </text>
          ))}
        </g>
      ) : null}
    </svg>
  )
}
