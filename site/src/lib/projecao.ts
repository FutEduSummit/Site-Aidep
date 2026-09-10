import { mapaBrasil } from '@/content/mapa-brasil'

/**
 * A PROJEÇÃO DO MAPA, NOS DOIS SENTIDOS
 * =====================================
 * Mercator — a mesma fórmula que `scripts/gerar-mapa-brasil.mjs` usou para
 * desenhar os 27 estados. É ela que garante que o ponto de Aracaju caia em
 * Aracaju no mapa plano, e que o contorno do Brasil caia sobre o Brasil no
 * globo.
 *
 * Este módulo é puro de propósito. `lib/mapa.ts`, que resolve o nome da
 * cidade, carrega a tabela dos 5.571 municípios e é `server-only`; o globo
 * da Página inicial roda no navegador e precisa só da conta. Separar os
 * dois é o que permite ao cliente desprojetar o desenho sem arrastar
 * 184 kB de cadastro junto.
 */

const { projecao } = mapaBrasil

/** Latitude e longitude no sistema do desenho. */
export function projetar(lat: number, lng: number): { x: number; y: number } {
  const mercator =
    (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))

  return {
    x: (lng - projecao.lngMin) * projecao.escala,
    y: (projecao.mercatorMax - mercator) * projecao.escala,
  }
}

/**
 * O caminho de volta. Existe para o globo: o contorno dos estados já está
 * desenhado em `content/mapa-brasil.ts`, em coordenadas de SVG, e
 * desprojetá-lo é o que permite acender o Brasil na esfera sem publicar o
 * mesmo contorno duas vezes — um arquivo para o mapa plano, outro para o
 * globo.
 */
export function desprojetar(x: number, y: number): { lat: number; lng: number } {
  const mercator = projecao.mercatorMax - y / projecao.escala

  return {
    lat: (360 / Math.PI) * Math.atan(Math.exp((mercator * Math.PI) / 180)) - 90,
    lng: x / projecao.escala + projecao.lngMin,
  }
}

/**
 * Os pontos de um `<path>` de `content/mapa-brasil.ts`, já em latitude e
 * longitude. Os caminhos gerados são só `M` seguido de pares de números e
 * fechados com `Z` — nenhuma curva, nenhum comando relativo —, então ler
 * os números na ordem basta.
 */
export function contornoEmCoordenadas(d: string): { lat: number; lng: number }[] {
  const numeros = d.match(/-?\d+(?:\.\d+)?/g)
  if (!numeros) return []

  const pontos: { lat: number; lng: number }[] = []
  for (let i = 0; i + 1 < numeros.length; i += 2) {
    pontos.push(desprojetar(Number(numeros[i]), Number(numeros[i + 1])))
  }

  return pontos
}
