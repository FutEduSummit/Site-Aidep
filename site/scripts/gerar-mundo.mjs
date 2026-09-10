/**
 * MÁSCARA DE TERRA DO PLANETA
 * ===========================
 * Gera `src/content/mundo.ts`: a máscara que diz, para cada meio grau de
 * latitude e longitude, se ali é terra ou oceano.
 *
 *   npm run mundo:dados
 *
 * É o dado que o globo da Página inicial usa para decidir onde pousar
 * cada ponto da malha (ver `components/ui/globo-3d.tsx`). O globo não
 * desenha nenhum país: ele espalha pontos igualmente pela esfera — a
 * malha de Fibonacci, que não acumula pontos nos polos como uma grade de
 * lat/long acumularia — e acende só os que caem em terra firme. O
 * contorno dos continentes aparece por consequência, e não por desenho.
 *
 * Por que máscara e não polígono:
 *
 * - **Tamanho.** O contorno dos 250 países, mesmo suavizado, passa de 40 kB
 *   e ainda assim erra o litoral quando o globo está longe. A máscara em
 *   0,5° ocupa 32 kB de bits (43 kB em base64, que o servidor comprime
 *   para pouco mais de 8 kB) e responde em tempo constante.
 * - **Custo no navegador.** Testar 40 mil pontos contra 250 polígonos é
 *   trabalho de segundos; contra a máscara é uma leitura de bit por ponto.
 *
 * O Brasil não entra aqui. Ele já está desenhado, estado por estado, em
 * `content/mapa-brasil.ts` — o globo desprojeta aquele mesmo contorno (a
 * projeção é reversível, ver `desprojetar()` em `lib/mapa.ts`) e o acende
 * em verde. Um dado só, duas telas.
 *
 * FONTE: Natural Earth 110m Admin 0 — Countries (domínio público), via
 * github.com/nvkelso/natural-earth-vector.
 *
 * O arquivo gerado fica versionado: o build não depende de rede.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cache = path.join(raiz, 'scripts', '.cache')
const destino = path.join(raiz, 'src', 'content', 'mundo.ts')

const FONTE =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson'

/** Células por grau. 2 = meio grau ≈ 55 km no equador. */
const CELULAS_POR_GRAU = 2

const COLUNAS = 360 * CELULAS_POR_GRAU
const LINHAS = 180 * CELULAS_POR_GRAU

/* ------------------------------------------------------------------ */

async function baixar(url, nomeLocal) {
  const arquivo = path.join(cache, nomeLocal)

  try {
    const guardado = await readFile(arquivo, 'utf8')
    console.log(`· ${nomeLocal} — do cache`)
    return guardado
  } catch {
    /* Não está em cache: baixa. */
  }

  console.log(`· ${nomeLocal} — baixando`)
  const resposta = await fetch(url)
  if (!resposta.ok) {
    throw new Error(`${url} respondeu ${resposta.status}`)
  }

  const texto = await resposta.text()
  await mkdir(cache, { recursive: true })
  await writeFile(arquivo, texto, 'utf8')
  return texto
}

/**
 * Todos os anéis externos de um GeoJSON de países, cada um com a própria
 * caixa envolvente. O buraco (anel interno) é ignorado de propósito: no
 * tamanho em que o globo aparece, o lago que ele recortaria tem menos de
 * um ponto de diâmetro.
 */
function aneis(geojson) {
  const lista = []

  for (const feicao of geojson.features) {
    const geometria = feicao.geometry
    if (!geometria) continue

    const poligonos =
      geometria.type === 'Polygon'
        ? [geometria.coordinates]
        : geometria.type === 'MultiPolygon'
          ? geometria.coordinates
          : []

    for (const poligono of poligonos) {
      const externo = poligono[0]
      if (!externo || externo.length < 4) continue

      let lngMin = Infinity
      let lngMax = -Infinity
      let latMin = Infinity
      let latMax = -Infinity

      for (const [lng, lat] of externo) {
        if (lng < lngMin) lngMin = lng
        if (lng > lngMax) lngMax = lng
        if (lat < latMin) latMin = lat
        if (lat > latMax) latMax = lat
      }

      lista.push({ pontos: externo, lngMin, lngMax, latMin, latMax })
    }
  }

  return lista
}

/** Lançamento de raio para o leste — o teste clássico de par e ímpar. */
function dentro(pontos, lng, lat) {
  let dentroDele = false

  for (let i = 0, j = pontos.length - 1; i < pontos.length; j = i, i += 1) {
    const [xi, yi] = pontos[i]
    const [xj, yj] = pontos[j]

    if (yi > lat !== yj > lat) {
      const corte = ((xj - xi) * (lat - yi)) / (yj - yi) + xi
      if (lng < corte) dentroDele = !dentroDele
    }
  }

  return dentroDele
}

/* ------------------------------------------------------------------ */

const geojson = JSON.parse(await baixar(FONTE, 'mundo-paises.geojson'))
const poligonos = aneis(geojson)

console.log(`\n${poligonos.length} anéis de costa`)
console.log(`Malha ${COLUNAS}×${LINHAS} — ${(COLUNAS * LINHAS).toLocaleString('pt-BR')} células\n`)

/**
 * Um bit por célula, na ordem em que o globo vai lê-los: linha de cima
 * (norte) primeiro, cada linha de oeste para leste.
 */
const bits = new Uint8Array((COLUNAS * LINHAS) / 8)
let acesas = 0

/* As faixas de latitude são fatiadas antes: só os anéis que cruzam a
   linha atual entram na conta de cada célula dela. É o que transforma
   250 testes por célula em dois ou três. */
for (let linha = 0; linha < LINHAS; linha += 1) {
  const lat = 90 - (linha + 0.5) / CELULAS_POR_GRAU
  const naFaixa = poligonos.filter(
    (anel) => lat >= anel.latMin && lat <= anel.latMax,
  )

  if (naFaixa.length === 0) continue

  for (let coluna = 0; coluna < COLUNAS; coluna += 1) {
    const lng = -180 + (coluna + 0.5) / CELULAS_POR_GRAU

    for (const anel of naFaixa) {
      if (lng < anel.lngMin || lng > anel.lngMax) continue
      if (!dentro(anel.pontos, lng, lat)) continue

      const indice = linha * COLUNAS + coluna
      bits[indice >> 3] |= 0b1000_0000 >> (indice & 7)
      acesas += 1
      break
    }
  }

  if (linha % 60 === 0) {
    process.stdout.write(`  ${Math.round((linha / LINHAS) * 100)}%\r`)
  }
}

const base64 = Buffer.from(bits).toString('base64')
const proporcao = ((acesas / (COLUNAS * LINHAS)) * 100).toFixed(1)

console.log(
  `  ✓ ${acesas.toLocaleString('pt-BR')} células de terra (${proporcao}% da malha)`,
)
console.log(`  ✓ ${(base64.length / 1024).toFixed(1)} kB em base64\n`)

const conteudo = `/* ARQUIVO GERADO — não edite à mão.
   Escrito por scripts/gerar-mundo.mjs (npm run mundo:dados). */

/**
 * ONDE É TERRA FIRME
 * ==================
 * Um bit por célula de meio grau, do norte para o sul e de oeste para
 * leste: 1 é terra, 0 é oceano. Derivado do Natural Earth 110m (domínio
 * público), sem nome de país nenhum — o globo da Página inicial não
 * desenha fronteiras, só acende os pontos da malha que caem em terra.
 *
 * Quem lê é \`ehTerra()\` abaixo, e quem desenha é
 * \`components/ui/globo-3d.tsx\`.
 */
export const mundo = {
  /** Células por grau em cada eixo. */
  resolucao: ${CELULAS_POR_GRAU},
  colunas: ${COLUNAS},
  linhas: ${LINHAS},
  /** ${acesas.toLocaleString('pt-BR')} das ${(COLUNAS * LINHAS).toLocaleString('pt-BR')} células são terra (${proporcao}%). */
  mascara:
    '${base64}',
} as const

let bits: Uint8Array | null = null

/** Decodifica a máscara na primeira consulta e guarda para as seguintes. */
function decodificar(): Uint8Array {
  if (bits) return bits

  const binario = atob(mundo.mascara)
  const saida = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i += 1) saida[i] = binario.charCodeAt(i)

  bits = saida
  return saida
}

/**
 * Há terra firme nesta coordenada? Fora da faixa de latitude do planeta a
 * resposta é \`false\` — nenhum ponto da malha cai ali, mas a função é
 * chamada em laço e não custa nada garantir.
 */
export function ehTerra(lat: number, lng: number): boolean {
  if (lat > 90 || lat < -90) return false

  const linha = Math.min(
    mundo.linhas - 1,
    Math.max(0, Math.floor((90 - lat) * mundo.resolucao)),
  )

  /* A longitude dá a volta: -190° e 170° são o mesmo meridiano. */
  const voltas = ((((lng + 180) % 360) + 360) % 360) * mundo.resolucao
  const coluna = Math.min(mundo.colunas - 1, Math.floor(voltas))

  const indice = linha * mundo.colunas + coluna
  return (decodificar()[indice >> 3] & (0b1000_0000 >> (indice & 7))) !== 0
}
`

await writeFile(destino, conteudo, 'utf8')
console.log(`Registro atualizado: src/content/mundo.ts\n`)
