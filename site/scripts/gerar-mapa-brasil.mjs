/**
 * DADOS DO MAPA DO BRASIL
 * =======================
 * Gera os dois arquivos que o mapa de atuação dos projetos precisa:
 *
 *   src/content/mapa-brasil.ts   contorno dos 27 estados, já projetado em
 *                                coordenadas de SVG, e as constantes da
 *                                projeção (para o site colocar os pontos
 *                                das cidades exatamente sobre o desenho)
 *   src/content/municipios.ts    os 5.570 municípios brasileiros com
 *                                latitude e longitude, para que cadastrar
 *                                uma cidade seja escrever o nome dela
 *
 * Rode só quando quiser trocar a fonte ou a suavização do desenho — os
 * dois arquivos ficam versionados no repositório e o build não depende
 * de rede:
 *
 *   npm run mapa:dados
 *   npm run mapa:dados -- --tolerancia 0.03   # desenho mais detalhado
 *
 * FONTES (dado geográfico público, dos dois casos derivado do IBGE):
 *   estados    github.com/codeforamerica/click_that_hood (MIT)
 *   municípios github.com/kelvins/municipios-brasileiros (MIT)
 *
 * A projeção é Mercator — a mesma fórmula está em `src/lib/mapa.ts`, e é o
 * que garante que o pontinho de Aracaju caia em Aracaju. Mexer na projeção
 * aqui pede mexer lá também.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cache = path.join(raiz, 'scripts', '.cache')

const FONTE_ESTADOS =
  'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson'
const FONTE_MUNICIPIOS =
  'https://raw.githubusercontent.com/kelvins/municipios-brasileiros/main/csv/municipios.csv'

/** Largura do viewBox. A altura sai da projeção, sem deformar o país. */
const LARGURA = 1000

/**
 * Suavização do contorno (Douglas-Peucker), em graus. 0,045° ≈ 5 km, ou
 * cerca de 1 px no tamanho em que o mapa é exibido: some o ruído do
 * litoral e o arquivo cai de 3,4 MB para algumas dezenas de kB.
 */
const TOLERANCIA_PADRAO = 0.045

/**
 * Ilha menor que isto (em graus²) não entra: no tamanho exibido viraria
 * um cisco de um pixel solto no oceano. Marajó e as ilhas grandes do
 * litoral ficam; Fernando de Noronha e Trindade, não — ficariam longe do
 * continente, esticando o mapa inteiro para caber um ponto invisível.
 */
const AREA_MINIMA = 0.02

/* ------------------------------------------------------------------ */
/* Utilidades                                                         */
/* ------------------------------------------------------------------ */

function argumento(nome, padrao) {
  const indice = process.argv.indexOf(`--${nome}`)
  if (indice === -1) return padrao
  return process.argv[indice + 1] ?? padrao
}

/** Baixa uma vez e guarda em scripts/.cache — reexecutar não bate na rede. */
async function baixar(url, nomeLocal) {
  const destino = path.join(cache, nomeLocal)

  try {
    const guardado = await readFile(destino, 'utf8')
    console.log(`· ${nomeLocal} — do cache`)
    return guardado
  } catch {
    /* Não está em cache: segue para o download. */
  }

  console.log(`· ${nomeLocal} — baixando`)
  const resposta = await fetch(url)
  if (!resposta.ok) {
    throw new Error(`${url} respondeu ${resposta.status}`)
  }

  const texto = await resposta.text()
  await mkdir(cache, { recursive: true })
  await writeFile(destino, texto, 'utf8')
  return texto
}

/* ------------------------------------------------------------------ */
/* Geometria                                                          */
/* ------------------------------------------------------------------ */

/** Distância do ponto à reta a—b, no plano das coordenadas de origem. */
function distanciaDaReta(ponto, a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]

  if (dx === 0 && dy === 0) {
    return Math.hypot(ponto[0] - a[0], ponto[1] - a[1])
  }

  const numerador = Math.abs(
    dy * (ponto[0] - a[0]) - dx * (ponto[1] - a[1]),
  )
  return numerador / Math.hypot(dx, dy)
}

/** Douglas-Peucker: mantém os vértices que mudam a forma, larga o resto. */
function simplificar(pontos, tolerancia) {
  if (pontos.length < 3) return pontos

  let maior = 0
  let indice = 0

  for (let i = 1; i < pontos.length - 1; i += 1) {
    const distancia = distanciaDaReta(
      pontos[i],
      pontos[0],
      pontos[pontos.length - 1],
    )
    if (distancia > maior) {
      maior = distancia
      indice = i
    }
  }

  if (maior <= tolerancia) {
    return [pontos[0], pontos[pontos.length - 1]]
  }

  const esquerda = simplificar(pontos.slice(0, indice + 1), tolerancia)
  const direita = simplificar(pontos.slice(indice), tolerancia)
  return [...esquerda.slice(0, -1), ...direita]
}

/** Área do anel pela fórmula do laço — só o tamanho, sem sinal. */
function area(anel) {
  let soma = 0
  for (let i = 0; i < anel.length; i += 1) {
    const [x1, y1] = anel[i]
    const [x2, y2] = anel[(i + 1) % anel.length]
    soma += x1 * y2 - x2 * y1
  }
  return Math.abs(soma) / 2
}

/** Todos os anéis externos de um MultiPolygon/Polygon do GeoJSON. */
function aneis(geometria) {
  if (geometria.type === 'Polygon') return [geometria.coordinates[0]]
  if (geometria.type === 'MultiPolygon') {
    return geometria.coordinates.map((poligono) => poligono[0])
  }
  return []
}

/**
 * Centro de massa do polígono. Usado quando o local cadastrado é um estado
 * inteiro ("Distrito Federal", "Bahia") e não uma cidade: o ponto cai no
 * meio da unidade federativa, e não em um município escolhido a esmo.
 */
function centro(anel) {
  let areaDupla = 0
  let x = 0
  let y = 0

  for (let i = 0; i < anel.length; i += 1) {
    const [x1, y1] = anel[i]
    const [x2, y2] = anel[(i + 1) % anel.length]
    const cruzado = x1 * y2 - x2 * y1
    areaDupla += cruzado
    x += (x1 + x2) * cruzado
    y += (y1 + y2) * cruzado
  }

  /* Polígono degenerado (área zero) — devolve o primeiro vértice. */
  if (areaDupla === 0) return anel[0]
  return [x / (3 * areaDupla), y / (3 * areaDupla)]
}

/**
 * Mercator, devolvido na mesma unidade da longitude (graus) — é o que
 * mantém a proporção certa quando x sai direto da longitude: sem o fator
 * 180/π o país sairia achatado a um vigésimo da altura.
 */
const mercator = (lat) =>
  (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))

/* ------------------------------------------------------------------ */
/* Estados                                                            */
/* ------------------------------------------------------------------ */

async function gerarEstados(tolerancia) {
  const geojson = JSON.parse(
    await baixar(FONTE_ESTADOS, 'brasil-estados.geojson'),
  )

  /* Passo 1 — simplificar e descartar as ilhas pequenas. */
  const estados = []
  let pontosOriginais = 0
  let pontosMantidos = 0

  for (const feicao of geojson.features) {
    const mantidos = []

    for (const anel of aneis(feicao.geometry)) {
      pontosOriginais += anel.length
      if (area(anel) < AREA_MINIMA) continue

      const simples = simplificar(anel, tolerancia)
      if (simples.length < 4) continue

      pontosMantidos += simples.length
      mantidos.push(simples)
    }

    if (mantidos.length === 0) continue

    estados.push({
      uf: feicao.properties.sigla,
      nome: feicao.properties.name,
      codigo: String(feicao.properties.codigo_ibg),
      aneis: mantidos,
    })
  }

  /* Passo 2 — a moldura do país, já em Mercator. */
  let lngMin = Infinity
  let lngMax = -Infinity
  let yMin = Infinity
  let yMax = -Infinity

  for (const estado of estados) {
    for (const anel of estado.aneis) {
      for (const [lng, lat] of anel) {
        const y = mercator(lat)
        if (lng < lngMin) lngMin = lng
        if (lng > lngMax) lngMax = lng
        if (y < yMin) yMin = y
        if (y > yMax) yMax = y
      }
    }
  }

  const escala = LARGURA / (lngMax - lngMin)
  const altura = (yMax - yMin) * escala

  /* Passo 3 — projetar e escrever o `d` de cada estado. Uma casa decimal
     basta: o desenho é exibido com 1000 unidades de largura. */
  const arredondar = (valor) => Math.round(valor * 10) / 10

  for (const estado of estados) {
    const projetados = estado.aneis.map((anel) =>
      anel.map(([lng, lat]) => [
        arredondar((lng - lngMin) * escala),
        arredondar((yMax - mercator(lat)) * escala),
      ]),
    )

    /* Depois do M, cada par seguinte já é uma linha reta — não repetir o L
       a cada vértice economiza um terço do arquivo. */
    estado.d = projetados
      .map((anel) => `M${anel.map(([x, y]) => `${x} ${y}`).join(' ')}Z`)
      .join('')

    /* O centro sai do maior anel: no Pará, o continente, não Marajó. */
    const maior = projetados.reduce((a, b) => (area(b) > area(a) ? b : a))
    const [cx, cy] = centro(maior)
    estado.cx = arredondar(cx)
    estado.cy = arredondar(cy)
  }

  /* Ordem alfabética por UF: assim o diff do arquivo gerado é estável. */
  estados.sort((a, b) => a.uf.localeCompare(b.uf))

  console.log(
    `· estados — ${estados.length} unidades, ${pontosOriginais} → ${pontosMantidos} vértices`,
  )

  return {
    estados,
    projecao: {
      lngMin,
      mercatorMax: yMax,
      escala,
    },
    largura: LARGURA,
    altura,
  }
}

/* ------------------------------------------------------------------ */
/* Municípios                                                         */
/* ------------------------------------------------------------------ */

async function gerarMunicipios(estados) {
  const csv = await baixar(FONTE_MUNICIPIOS, 'municipios.csv')

  /* código do IBGE da UF (31) → sigla (MG), tirado do próprio GeoJSON. */
  const siglaPorCodigo = new Map(
    estados.map((estado) => [estado.codigo, estado.uf]),
  )

  const linhas = csv.split('\n')
  const cabecalho = linhas[0].split(',').map((campo) => campo.trim())
  const coluna = (nome) => cabecalho.indexOf(nome)

  const iNome = coluna('nome')
  const iLat = coluna('latitude')
  const iLng = coluna('longitude')
  const iCapital = coluna('capital')
  const iUf = coluna('codigo_uf')

  if ([iNome, iLat, iLng, iCapital, iUf].includes(-1)) {
    throw new Error('CSV de municípios com colunas inesperadas')
  }

  const municipios = []

  for (const linha of linhas.slice(1)) {
    if (!linha.trim()) continue

    /* O CSV não tem campo com vírgula dentro — split direto resolve. */
    const campos = linha.split(',')
    const nome = campos[iNome]?.trim()
    const uf = siglaPorCodigo.get(campos[iUf]?.trim())
    const lat = Number(campos[iLat])
    const lng = Number(campos[iLng])

    if (!nome || !uf || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      continue
    }

    municipios.push({
      nome,
      uf,
      lat: Math.round(lat * 1e4) / 1e4,
      lng: Math.round(lng * 1e4) / 1e4,
      capital: campos[iCapital]?.trim() === '1',
    })
  }

  municipios.sort(
    (a, b) => a.nome.localeCompare(b.nome, 'pt-BR') || a.uf.localeCompare(b.uf),
  )

  console.log(`· municípios — ${municipios.length} cidades`)
  return municipios
}

/* ------------------------------------------------------------------ */
/* Escrita                                                            */
/* ------------------------------------------------------------------ */

const aviso = `/* ARQUIVO GERADO — não edite à mão.
   Escrito por scripts/gerar-mapa-brasil.mjs (npm run mapa:dados). */`

async function escreverMapa(mapa, tolerancia) {
  const numero = (valor) => Number(valor.toFixed(6))

  const conteudo = `${aviso}

/**
 * CONTORNO DO BRASIL POR ESTADO
 * =============================
 * Dado geográfico público (IBGE, via click_that_hood), suavizado a
 * ${String(tolerancia).replace('.', ',')}° e projetado em Mercator para um viewBox de ${mapa.largura} unidades
 * de largura.
 *
 * \`projecao\` é o que permite pôr um ponto sobre uma cidade: ver
 * \`projetar()\` em \`src/lib/mapa.ts\`.
 */
export type EstadoDoMapa = {
  /** Sigla da unidade federativa — 'SE', 'DF', 'PR'… */
  uf: string
  nome: string
  /** Atributo \`d\` do <path>, em coordenadas do viewBox. */
  d: string
  /** Centro do estado no viewBox — o ponto de um local cadastrado por UF. */
  cx: number
  cy: number
}

export const mapaBrasil = {
  largura: ${mapa.largura},
  altura: ${Math.round(mapa.altura * 10) / 10},
  projecao: {
    /** Longitude na borda esquerda do viewBox (Ponta do Bico, no Acre). */
    lngMin: ${numero(mapa.projecao.lngMin)},
    /** Mercator da latitude na borda de cima (Monte Caburaí, em Roraima). */
    mercatorMax: ${numero(mapa.projecao.mercatorMax)},
    /** Unidades do viewBox por grau de longitude. */
    escala: ${numero(mapa.projecao.escala)},
  },
  estados: [
${mapa.estados
  .map(
    (estado) =>
      `    { uf: '${estado.uf}', nome: '${estado.nome}', cx: ${estado.cx}, cy: ${estado.cy}, d: '${estado.d}' },`,
  )
  .join('\n')}
  ] satisfies EstadoDoMapa[],
} as const
`

  const destino = path.join(raiz, 'src', 'content', 'mapa-brasil.ts')
  await writeFile(destino, conteudo, 'utf8')
  return destino
}

async function escreverMunicipios(municipios) {
  /* Uma linha por município, campos separados por "|": é o formato mais
     enxuto que ainda dá para ler no diff. Quem transforma isso em índice
     de busca é `src/lib/municipios.ts`, uma vez por processo. */
  const tabela = municipios
    .map(
      (municipio) =>
        `${municipio.nome}|${municipio.uf}|${municipio.lat}|${municipio.lng}${
          municipio.capital ? '|c' : ''
        }`,
    )
    .join('\n')

  const conteudo = `${aviso}

/**
 * MUNICÍPIOS BRASILEIROS
 * ======================
 * Os ${municipios.length} municípios do IBGE com latitude e longitude — é o que
 * transforma "Aracaju, SE" cadastrado no painel em um ponto no mapa, sem
 * ninguém precisar digitar coordenada.
 *
 * Formato de cada linha: \`nome|UF|latitude|longitude\`, com \`|c\` no fim
 * quando é capital. Uma string só, e não um array de objetos, porque o
 * arquivo é lido inteiro pelo servidor: assim ele ocupa um terço do
 * espaço e o parse acontece uma vez, sob demanda.
 *
 * Use por \`src/lib/municipios.ts\` — nunca importe esta tabela em
 * componente de cliente.
 *
 * Fonte: github.com/kelvins/municipios-brasileiros (MIT), dado do IBGE.
 */
export const tabelaDeMunicipios = \`${tabela}\`
`

  const destino = path.join(raiz, 'src', 'content', 'municipios.ts')
  await writeFile(destino, conteudo, 'utf8')
  return destino
}

/* ------------------------------------------------------------------ */

async function principal() {
  const tolerancia = Number(argumento('tolerancia', TOLERANCIA_PADRAO))

  const mapa = await gerarEstados(tolerancia)
  const municipios = await gerarMunicipios(mapa.estados)

  const arquivoMapa = await escreverMapa(mapa, tolerancia)
  const arquivoMunicipios = await escreverMunicipios(municipios)

  const tamanho = async (arquivo) => {
    const texto = await readFile(arquivo, 'utf8')
    return `${Math.round(Buffer.byteLength(texto) / 1024)} kB`
  }

  console.log(`\n✓ ${path.relative(raiz, arquivoMapa)} (${await tamanho(arquivoMapa)})`)
  console.log(
    `✓ ${path.relative(raiz, arquivoMunicipios)} (${await tamanho(arquivoMunicipios)})`,
  )
}

principal().catch((erro) => {
  console.error(erro)
  process.exit(1)
})
