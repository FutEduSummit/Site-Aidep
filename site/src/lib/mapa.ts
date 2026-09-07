import { mapaBrasil } from '@/content/mapa-brasil'
import type { ProjectLocation } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { encontrarMunicipio, normalizarNome } from './municipios'

/**
 * PONTOS SOBRE O MAPA
 * ===================
 * O projeto declara as cidades onde atua (`locations`, no painel ou em
 * `content/projects.ts`); aqui cada uma vira um ponto em cima do desenho
 * do Brasil.
 *
 * Três caminhos, nesta ordem:
 *   1. `coords` cadastrado à mão — vale sobre tudo, e é a saída para
 *      distrito, aldeia, comunidade ou cidade fora do Brasil;
 *   2. o nome da cidade no cadastro do IBGE (com a UF, quando informada);
 *   3. o nome de um estado ou a sigla dele — o ponto cai no centro da
 *      unidade federativa.
 *
 * Local que não se encaixa em nenhum dos três continua aparecendo na lista
 * ao lado do mapa, só não recebe ponto: melhor faltar um ponto do que
 * marcar a cidade errada.
 *
 * Este módulo roda no servidor (a tabela de municípios não vai para o
 * navegador): o que o cliente recebe são os poucos pontos já projetados.
 */

const { largura, altura, projecao, estados } = mapaBrasil

/** Distância vertical mínima entre dois rótulos, em unidades do viewBox. */
const ESPACO_DO_ROTULO = 26

/** Deslocamento a partir do qual vale desenhar a linha ponto → rótulo. */
const DESVIO_COM_LINHA = 7

/** À direita desta faixa o rótulo vira para a esquerda do ponto. */
const VIRADA_DO_ROTULO = 0.7

export type PontoDeAtuacao = {
  id: string
  /** Coordenadas no viewBox de `mapaBrasil`. */
  x: number
  y: number
  rotulo: string
  /** UF, bairro ou equipamento — o que qualifica o ponto na leitura. */
  detalhe?: string
  /** De que lado do ponto o texto fica. */
  lado: 'direita' | 'esquerda'
  /** y do texto: igual ao do ponto, ou empurrado para não colar no vizinho. */
  rotuloY: number
  /** O texto desceu o bastante para pedir uma linha ligando-o ao ponto. */
  comLinha: boolean
}

export type AtuacaoNoMapa = {
  pontos: PontoDeAtuacao[]
  /** UFs com pelo menos um ponto — são os estados que o mapa acende. */
  ufs: string[]
}

/**
 * Latitude e longitude no sistema do desenho. É a mesma projeção Mercator
 * usada para gerar os contornos em `scripts/gerar-mapa-brasil.mjs` — é o
 * que garante que o ponto de Aracaju caia em Aracaju.
 */
export function projetar(lat: number, lng: number): { x: number; y: number } {
  const mercator =
    (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))

  return {
    x: (lng - projecao.lngMin) * projecao.escala,
    y: (projecao.mercatorMax - mercator) * projecao.escala,
  }
}

/** O ponto está dentro da moldura do mapa? Ilha oceânica, por exemplo, não. */
function dentroDoMapa({ x, y }: { x: number; y: number }): boolean {
  return x >= 0 && x <= largura && y >= 0 && y <= altura
}

/* Nome e sigla de cada estado → o centro dele, para local cadastrado por UF. */
const estadoPorNome = new Map(
  estados.flatMap((estado) => [
    [normalizarNome(estado.nome), estado],
    [normalizarNome(estado.uf), estado],
  ]),
)

/**
 * A UF declarada no cadastro. O campo "Estado" do painel é texto livre e
 * o conteúdo do site usa a sigla, então valem as duas formas: 'SE' e
 * 'Sergipe' levam ao mesmo estado. Texto que não é nem sigla nem nome de
 * estado ("Grande Aracaju", "litoral norte") não atrapalha: a busca segue
 * só pelo nome da cidade.
 */
function ufDeclarada(local: ProjectLocation): string | undefined {
  const bruta = local.uf ?? local.region
  if (!bruta) return undefined

  const declarada = bruta.trim()
  if (/^[A-Za-z]{2}$/.test(declarada)) return declarada.toUpperCase()

  return estadoPorNome.get(normalizarNome(declarada))?.uf
}

type PontoResolvido = {
  x: number
  y: number
  rotulo: string
  detalhe?: string
  uf?: string
}

function resolver(
  local: ProjectLocation,
  locale: Locale,
): PontoResolvido | null {
  const nome = (local.city[locale] ?? local.city.pt ?? '').trim()
  const uf = ufDeclarada(local)
  const detalhe = local.venue ?? local.region ?? uf

  /* 1. Coordenada cadastrada à mão. */
  if (local.coords) {
    const ponto = projetar(local.coords.lat, local.coords.lng)
    if (!dentroDoMapa(ponto)) return null
    return { ...ponto, rotulo: nome, detalhe, uf }
  }

  if (!nome) return null

  /* 2. Município do IBGE. O nome em português é o que está no cadastro —
     em inglês e espanhol o nome próprio da cidade é o mesmo, mas se o
     tradutor tiver mexido, o português continua valendo como chave. */
  const municipio =
    encontrarMunicipio(nome, uf) ?? encontrarMunicipio(local.city.pt, uf)

  if (municipio) {
    return {
      ...projetar(municipio.lat, municipio.lng),
      rotulo: nome,
      detalhe: local.venue ?? local.region ?? municipio.uf,
      uf: municipio.uf,
    }
  }

  /* 3. Estado inteiro — "Distrito Federal", "Bahia", "MG". */
  const estado = estadoPorNome.get(normalizarNome(nome))
  if (estado) {
    return {
      x: estado.cx,
      y: estado.cy,
      rotulo: nome,
      detalhe: local.venue,
      uf: estado.uf,
    }
  }

  return null
}

/**
 * Nome colado em nome não se lê. Duas passadas, a receita clássica de
 * rotulagem de mapa: a primeira empurra cada rótulo para baixo até caber
 * abaixo do anterior; a segunda desce a coluna de volta para dentro da
 * moldura quando a fila estourou o rodapé. Os pontos não se movem — só o
 * texto, e a linha fina desenhada pelo mapa mostra de quem ele é.
 *
 * Recebe os pontos de um lado do mapa, já em ordem de cima para baixo.
 */
function afastarRotulos(pontos: PontoDeAtuacao[]): void {
  let anterior = Number.NEGATIVE_INFINITY

  for (const ponto of pontos) {
    ponto.rotuloY = Math.max(ponto.y, anterior + ESPACO_DO_ROTULO)
    anterior = ponto.rotuloY
  }

  let limite = altura - ESPACO_DO_ROTULO / 2

  for (let i = pontos.length - 1; i >= 0; i -= 1) {
    pontos[i].rotuloY = Math.min(pontos[i].rotuloY, limite)
    limite = pontos[i].rotuloY - ESPACO_DO_ROTULO
  }

  for (const ponto of pontos) {
    ponto.comLinha = Math.abs(ponto.rotuloY - ponto.y) > DESVIO_COM_LINHA
  }
}

/**
 * Os pontos do projeto, prontos para desenhar: resolvidos, sem repetição e
 * com os rótulos já afastados um do outro.
 */
export function atuacaoNoMapa(
  locations: ProjectLocation[],
  locale: Locale,
): AtuacaoNoMapa {
  const resolvidos: PontoResolvido[] = []
  const vistos = new Set<string>()

  for (const local of locations) {
    const ponto = resolver(local, locale)
    if (!ponto) continue

    /* Dois locais na mesma cidade (dois polos, dois equipamentos) rendem
       um ponto só — dois círculos no mesmo pixel viram borrão. */
    const chave = `${Math.round(ponto.x)}|${Math.round(ponto.y)}`
    if (vistos.has(chave)) continue
    vistos.add(chave)

    resolvidos.push(ponto)
  }

  const pontos: PontoDeAtuacao[] = resolvidos
    .map((ponto) => ({
      ...ponto,
      id: `${ponto.rotulo}-${ponto.uf ?? ''}`,
      lado:
        ponto.x > largura * VIRADA_DO_ROTULO
          ? ('esquerda' as const)
          : ('direita' as const),
      rotuloY: ponto.y,
      comLinha: false,
    }))
    .sort((a, b) => a.y - b.y)

  afastarRotulos(pontos.filter((ponto) => ponto.lado === 'direita'))
  afastarRotulos(pontos.filter((ponto) => ponto.lado === 'esquerda'))

  const ufs = [
    ...new Set(
      resolvidos
        .map((ponto) => ponto.uf)
        .filter((uf): uf is string => Boolean(uf)),
    ),
  ]

  return { pontos, ufs }
}
