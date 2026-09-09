'use client'

import { motion } from 'motion/react'
import { mapaBrasil } from '@/content/mapa-brasil'
import type { PontoDeAtuacao } from '@/lib/mapa'
import { DURATION, STAGGER, VIEWPORT, transition } from '@/lib/motion'
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

/** Intervalo entre a chegada de um ponto e a do próximo. */
const CASCATA = STAGGER.tight

/** O nome (e a linha) chega logo depois do ponto a que pertence. */
const ATRASO_DO_ROTULO = 0.16

/**
 * Cada ponto chega no seu tempo: `custom` é o índice dele na lista, já
 * ordenada de norte a sul em `lib/mapa.ts`, e vira o atraso da entrada.
 * A cascata desce o país junto com o scroll de quem lê.
 */
const entradaDoPonto = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: transition(DURATION.fast, i * CASCATA),
  }),
}

/** A linha ponto → nome é desenhada a partir do ponto, para fora. */
const entradaDaLinha = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: transition(DURATION.fast, i * CASCATA + ATRASO_DO_ROTULO),
  }),
}

const entradaDoRotulo = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: transition(DURATION.fast, i * CASCATA + ATRASO_DO_ROTULO),
  }),
}

/**
 * MAPA DO BRASIL COM AS CIDADES DO PROJETO
 * ========================================
 * Desenho vetorial dos 27 estados (`content/mapa-brasil.ts`, gerado por
 * `npm run mapa:dados` a partir do dado público do IBGE) com um ponto em
 * cima de cada cidade atendida.
 *
 * O país é SVG renderizado no servidor e não depende de script nenhum: o
 * contorno e o recorte da atuação aparecem sempre. O que o cliente anima
 * são só os pontos — eles entram em cascata, de norte a sul, quando o
 * mapa aparece na tela, uma única vez. É a mesma língua do resto do site
 * (`lib/motion.ts`): nada surge do nada, tudo *chega*.
 *
 * `prefers-reduced-motion` é respeitado pelo `MotionProvider`: a escala
 * some e sobra o fade. Quem está com script bloqueado continua com o mapa
 * e com a lista de cidades ao lado, que é servida em HTML puro.
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

  /* O índice de cada ponto vira o atraso da entrada — e o rótulo e a linha
     do mesmo ponto usam o mesmo índice, para chegarem juntos. */
  const ordem = new Map(points.map((ponto, i) => [ponto.id, i]))

  return (
    <motion.svg
      viewBox={`-4 -4 ${mapaBrasil.largura + 8} ${mapaBrasil.altura + 8}`}
      role="img"
      aria-label={label}
      className={cn('h-auto w-full', className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2, margin: VIEWPORT.margin }}
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
              <motion.line
                key={ponto.id}
                x1={ponto.x}
                y1={ponto.y}
                x2={ponto.x + (ponto.lado === 'direita' ? DO_PONTO : -DO_PONTO)}
                y2={ponto.rotuloY - 5}
                variants={entradaDaLinha}
                custom={ordem.get(ponto.id) ?? 0}
              />
            ))}
        </g>
      ) : null}

      {points.map((ponto, i) => (
        /* `transform-box: fill-box` é o que faz o ponto crescer a partir
           do próprio centro, e não da origem do SVG. */
        <motion.g
          key={ponto.id}
          className="origin-center transform-fill group/ponto"
          variants={entradaDoPonto}
          custom={i}
        >
          <title>
            {ponto.detalhe ? `${ponto.rotulo} — ${ponto.detalhe}` : ponto.rotulo}
          </title>

          {/* Halo: dá volume ao ponto e cresce ao passar o mouse. */}
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
        </motion.g>
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
          {points.map((ponto, i) => (
            <motion.text
              key={ponto.id}
              x={ponto.x + (ponto.lado === 'direita' ? DO_PONTO + 6 : -DO_PONTO - 6)}
              y={ponto.rotuloY}
              textAnchor={ponto.lado === 'direita' ? 'start' : 'end'}
              dominantBaseline="middle"
              variants={entradaDoRotulo}
              custom={i}
            >
              {ponto.rotulo}
            </motion.text>
          ))}
        </g>
      ) : null}
    </motion.svg>
  )
}
