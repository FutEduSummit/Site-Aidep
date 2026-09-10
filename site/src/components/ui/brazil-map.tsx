'use client'

import { motion } from 'motion/react'
import { useMemo, useRef, useState } from 'react'
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
  /** Classes da moldura — é ela que decide o tamanho do desenho. */
  className?: string
  /** Classes do próprio SVG, quando a moldura não basta para dimensioná-lo. */
  svgClassName?: string
  /**
   * Com muitos pontos os nomes se atropelam; a partir daqui só ficam os
   * alfinetes, e os nomes ficam na lista ao lado (e na etiqueta de cada um).
   */
  maxLabels?: number
}

/* ------------------------------------------------------------------ */
/* O alfinete                                                          */
/* ------------------------------------------------------------------ */

/** Raio da cabeça do alfinete, em unidades do viewBox. */
const PINO_RAIO = 17

/** Altura total do alfinete: da ponta que toca a cidade ao topo da cabeça. */
const PINO_ALTURA = 46

/** Centro da cabeça, medido a partir da ponta. */
const CABECA_Y = PINO_RAIO - PINO_ALTURA

/**
 * A gota clássica de marcador de mapa, com **a ponta na origem**: quem
 * desenha o alfinete só precisa levar (0,0) até a cidade, e o desenho
 * cresce para cima a partir dela. É o mesmo contrato do alfinete de mapa
 * que todo mundo já conhece — o que aponta o lugar é a ponta, não o meio.
 */
export const PINO_PATH = [
  'M0 0',
  `C-6 -11 -${PINO_RAIO} ${CABECA_Y + 9} -${PINO_RAIO} ${CABECA_Y}`,
  `A${PINO_RAIO} ${PINO_RAIO} 0 1 1 ${PINO_RAIO} ${CABECA_Y}`,
  `C${PINO_RAIO} ${CABECA_Y + 9} 6 -11 0 0`,
  'Z',
].join('')

/** O mesmo alfinete, em miniatura, para a legenda ao pé do mapa. */
export function PinoIcone({ className }: { className?: string }) {
  const lado = PINO_RAIO + 2
  return (
    <svg
      aria-hidden="true"
      viewBox={`${-lado} ${-PINO_ALTURA - 2} ${lado * 2} ${PINO_ALTURA + 4}`}
      className={cn('h-4 w-auto', className)}
    >
      <path d={PINO_PATH} className="fill-brand-600" />
      <circle cx={0} cy={CABECA_Y} r={6.5} className="fill-(--bg)" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* A moldura                                                           */
/* ------------------------------------------------------------------ */

/**
 * O alfinete sobe da cidade para fora do contorno do país: sem folga no
 * topo, a cabeça do ponto mais ao norte sairia cortada pela borda do
 * viewBox. A folga lateral existe pelo mesmo motivo, para o leste.
 */
const FOLGA = { topo: PINO_ALTURA + 4, lado: PINO_RAIO + 4, base: 6 }

const VB = {
  x: -FOLGA.lado,
  y: -FOLGA.topo,
  largura: mapaBrasil.largura + FOLGA.lado * 2,
  altura: mapaBrasil.altura + FOLGA.topo + FOLGA.base,
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
 * `npm run mapa:dados` a partir do dado público do IBGE) com um alfinete
 * em cima de cada cidade atendida.
 *
 * O país é SVG e não depende de script nenhum: o contorno e o recorte da
 * atuação aparecem sempre. O que o cliente anima são só os alfinetes —
 * eles entram em cascata, de norte a sul, quando o mapa aparece na tela,
 * uma única vez. É a mesma língua do resto do site (`lib/motion.ts`):
 * nada surge do nada, tudo *chega*.
 *
 * `prefers-reduced-motion` é respeitado pelo `MotionProvider`: a escala
 * some e sobra o fade. Quem está com script bloqueado continua com o mapa
 * e com a lista de cidades ao lado, que é servida em HTML puro.
 *
 * A ETIQUETA
 * ----------
 * Passar o mouse num alfinete abre uma ficha pequena com o nome da cidade
 * — a mesma do globo da Página inicial, para as duas se lerem como uma
 * coisa só. Ela é HTML, e não SVG: assim o texto tem o corpo do resto da
 * página em vez de encolher junto com o desenho. A posição vem de refazer
 * a conta que o navegador faz para desenhar o SVG (escala uniforme,
 * conteúdo centrado), e por isso continua certa em qualquer largura —
 * inclusive no meio da animação de entrada.
 */
export function BrazilMap({
  points,
  states,
  label,
  className,
  svgClassName,
  maxLabels = 16,
}: BrazilMapProps) {
  const moldura = useRef<HTMLDivElement>(null)
  const desenho = useRef<SVGSVGElement>(null)

  /* A etiqueta guarda a posição já resolvida em pixels, e não só o id: a
     conta é feita na hora do hover, que é quando o desenho existe e tem
     tamanho — durante a renderização não há caixa nenhuma para medir. */
  const [ativo, setAtivo] = useState<{
    id: string
    left: number
    top: number
  } | null>(null)

  const acesos = new Set(states)
  const comRotulo = points.length > 0 && points.length <= maxLabels

  /* O índice de cada ponto vira o atraso da entrada — e o rótulo e a linha
     do mesmo ponto usam o mesmo índice, para chegarem juntos. */
  const ordem = new Map(points.map((ponto, i) => [ponto.id, i]))

  /* Em SVG não há z-index: quem manda é a ordem do documento. Doze cidades
     de Sergipe ficam a poucos pixels umas das outras, então o alfinete sob
     o mouse vai para o fim da lista e passa a ser desenhado por cima dos
     vizinhos — senão a etiqueta apontaria para um ponto meio encoberto. */
  const desenhaveis = useMemo(() => {
    const alvo = ativo ? points.find((ponto) => ponto.id === ativo.id) : undefined
    if (!alvo) return points
    return [...points.filter((ponto) => ponto.id !== alvo.id), alvo]
  }, [points, ativo])

  const naEtiqueta = ativo
    ? (points.find((ponto) => ponto.id === ativo.id) ?? null)
    : null

  /**
   * Abre a etiqueta na cabeça deste alfinete. A posição sai de refazer a
   * conta do `preserveAspectRatio="xMidYMid meet"` — escala uniforme, e a
   * sobra dividida em dois — sobre as coordenadas do ponto no viewBox, e
   * não sobre a caixa do desenho: assim ela cai no lugar certo mesmo com
   * o alfinete no meio da animação de entrada.
   */
  function apontar(ponto: PontoDeAtuacao) {
    const svg = desenho.current?.getBoundingClientRect()
    const caixa = moldura.current?.getBoundingClientRect()
    if (!svg || !caixa) return

    const escala = Math.min(svg.width / VB.largura, svg.height / VB.altura)

    setAtivo({
      id: ponto.id,
      left:
        svg.left -
        caixa.left +
        (svg.width - VB.largura * escala) / 2 +
        (ponto.x - VB.x) * escala,
      top:
        svg.top -
        caixa.top +
        (svg.height - VB.altura * escala) / 2 +
        (ponto.y - PINO_ALTURA - VB.y) * escala,
    })
  }

  const detalhe = naEtiqueta ? detalheDe(naEtiqueta) : ''

  return (
    <div
      ref={moldura}
      className={cn('relative', className)}
      onPointerLeave={() => setAtivo(null)}
    >
      <motion.svg
        ref={desenho}
        viewBox={`${VB.x} ${VB.y} ${VB.largura} ${VB.altura}`}
        role="img"
        aria-label={label}
        className={cn('block h-auto w-full', svgClassName)}
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

        {desenhaveis.map((ponto) => (
          /* O `<g>` de fora leva o alfinete até a cidade; o de dentro é o
             que anima. Separados, porque a escala da entrada e a do hover
             têm de girar em torno da ponta — e é `origin-bottom` com
             `transform-box: fill-box` que põe o eixo exatamente lá, no
             fundo da caixa do desenho. */
          <g key={ponto.id} transform={`translate(${ponto.x} ${ponto.y})`}>
            <motion.g
              variants={entradaDoPonto}
              custom={ordem.get(ponto.id) ?? 0}
              className="origin-bottom transform-fill"
            >
              <g
                onPointerEnter={() => apontar(ponto)}
                onClick={() => apontar(ponto)}
                className={cn(
                  'origin-bottom cursor-pointer transform-fill transition-transform duration-300 ease-brand',
                  ativo?.id === ponto.id && 'scale-115',
                )}
              >
                {/* A sombra no chão é o que faz o alfinete parecer espetado
                    na cidade, e não boiando acima dela. */}
                <ellipse cx={0} cy={0} rx={7} ry={2.5} className="fill-black/20" />

                <path
                  d={PINO_PATH}
                  strokeWidth={3}
                  className={cn(
                    'stroke-(--bg) transition-colors duration-300 ease-brand',
                    ativo?.id === ponto.id ? 'fill-brand-500' : 'fill-brand-600',
                  )}
                />
                <circle cx={0} cy={CABECA_Y} r={6.5} className="fill-(--bg)" />

                {/* Alvo de toque: no celular ninguém acerta uma gota de
                    dezessete unidades, e o dedo precisa de um retângulo. */}
                <rect
                  x={-PINO_RAIO - 6}
                  y={-PINO_ALTURA - 6}
                  width={(PINO_RAIO + 6) * 2}
                  height={PINO_ALTURA + 12}
                  className="fill-transparent"
                />
              </g>
            </motion.g>
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

      {ativo && naEtiqueta ? (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transition(DURATION.fast)}
          style={{ left: ativo.left, top: ativo.top - 8 }}
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap border border-(--border-strong) bg-(--bg)/92 px-3 py-2 backdrop-blur-sm"
        >
          <span className="block text-small font-semibold leading-tight tracking-[-0.01em]">
            {naEtiqueta.rotulo}
          </span>
          {detalhe ? (
            <span className="block text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
              {detalhe}
            </span>
          ) : null}
        </motion.div>
      ) : null}
    </div>
  )
}

/**
 * A segunda linha da etiqueta. Equipamento e UF, sem repetir: quando o
 * local só informou o estado, `detalhe` já *é* a sigla, e "SE · SE" seria
 * ruído.
 */
function detalheDe(ponto: PontoDeAtuacao): string {
  return [ponto.detalhe, ponto.uf]
    .filter(
      (parte, indice, todas) => Boolean(parte) && todas.indexOf(parte) === indice,
    )
    .join(' · ')
}
