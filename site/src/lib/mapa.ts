import { mapaBrasil } from '@/content/mapa-brasil'
import type { ProjectLocation } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { encontrarMunicipio, normalizarNome } from './municipios'
import { desprojetar, projetar } from './projecao'

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

const { largura, altura, estados } = mapaBrasil

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
  /** Sigla da unidade federativa — a segunda linha da etiqueta do mapa. */
  uf?: string
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
  /** Latitude e longitude reais, quando o local tem coordenada conhecida. */
  lat?: number
  lng?: number
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
    return { ...ponto, ...local.coords, rotulo: nome, detalhe, uf }
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
      lat: municipio.lat,
      lng: municipio.lng,
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
      ...desprojetar(estado.cx, estado.cy),
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

/* ------------------------------------------------------------------ */
/* Os mesmos locais, agora sobre a esfera                             */
/* ------------------------------------------------------------------ */

export type ProjetoNoPonto = {
  slug: string
  /** Nome próprio do projeto — não se traduz. */
  nome: string
  /** Quantos polos este projeto mantém nesta cidade. */
  polos: number
}

export type PontoNoGlobo = {
  id: string
  lat: number
  lng: number
  cidade: string
  uf?: string
  /** Equipamento ou região — o que qualifica o ponto na ficha. */
  detalhe?: string
  /** Todos os projetos que atuam nesta cidade. */
  projetos: ProjetoNoPonto[]
  /** Soma dos polos de todos os projetos aqui. */
  polos: number
}

/**
 * TODA A ATUAÇÃO DA AIDEP EM UM MAPA SÓ
 * =====================================
 * O globo da Página inicial não é o mapa de um projeto: é o mapa da
 * associação. Aqui os locais dos três projetos são resolvidos com a mesma
 * regra do mapa plano (coordenada à mão → cadastro do IBGE → centro do
 * estado) e depois **reunidos por cidade**.
 *
 * Reunir é o ponto. Aracaju aparece nos dois projetos que atuam em
 * Sergipe, e Curitiba aparece no Summit e no Futsal na Escola: sem essa
 * junção seriam dois marcadores no mesmo pixel, disputando o clique. Com
 * ela, é um marcador que abre uma ficha dizendo os dois projetos.
 *
 * Roda no servidor — a tabela de municípios não vai para o navegador. O
 * cliente recebe as poucas dezenas de pontos já com latitude e longitude.
 */
export function atuacaoNoGlobo(
  projetos: { slug: string; name: string; locations: ProjectLocation[] }[],
  locale: Locale,
): PontoNoGlobo[] {
  const porCidade = new Map<string, PontoNoGlobo>()

  for (const projeto of projetos) {
    for (const local of projeto.locations) {
      const resolvido = resolver(local, locale)
      if (!resolvido || resolvido.lat === undefined || resolvido.lng === undefined) {
        continue
      }

      const polos = Math.max(1, local.polos ?? 1)
      /* Três casas decimais ≈ 100 m: perto o bastante para dois cadastros
         da mesma cidade caírem na mesma chave, longe o bastante para duas
         cidades vizinhas não se fundirem. */
      const chave = `${resolvido.lat.toFixed(3)}|${resolvido.lng.toFixed(3)}`
      const existente = porCidade.get(chave)

      if (existente) {
        const mesmoProjeto = existente.projetos.find(
          (item) => item.slug === projeto.slug,
        )
        if (mesmoProjeto) mesmoProjeto.polos += polos
        else {
          existente.projetos.push({
            slug: projeto.slug,
            nome: projeto.name,
            polos,
          })
        }
        existente.polos += polos
        /* O equipamento nomeado ganha do genérico: "Arena da Baixada" diz
           mais do que "PR", e só um dos cadastros costuma trazê-lo. */
        if (local.venue) existente.detalhe = local.venue
        continue
      }

      porCidade.set(chave, {
        id: chave,
        lat: resolvido.lat,
        lng: resolvido.lng,
        cidade: resolvido.rotulo,
        uf: resolvido.uf,
        detalhe: resolvido.detalhe,
        projetos: [{ slug: projeto.slug, nome: projeto.name, polos }],
        polos,
      })
    }
  }

  /* De norte a sul: é a ordem em que a lista ao lado do globo se lê, e a
     mesma do mapa plano. */
  return [...porCidade.values()].sort((a, b) => b.lat - a.lat)
}
