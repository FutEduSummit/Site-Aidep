import { mapaBrasil } from '@/content/mapa-brasil'

/**
 * A PROJEÇÃO DO MAPA, NOS DOIS SENTIDOS
 * =====================================
 * Mercator — a mesma fórmula que `scripts/gerar-mapa-brasil.mjs` usou para
 * desenhar os 27 estados. É ela que garante que o ponto de Aracaju caia em
 * Aracaju no mapa.
 *
 * Este módulo é puro de propósito. `lib/mapa.ts`, que resolve o nome da
 * cidade, carrega a tabela dos 5.571 municípios e é `server-only`; a conta
 * em si não precisa de nada disso. Separar os dois é o que permite usar a
 * projeção sem arrastar 184 kB de cadastro junto.
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
 * O caminho de volta. Existe para o local cadastrado por estado: o centro
 * de cada UF está em `content/mapa-brasil.ts` em coordenadas de SVG, e
 * desprojetá-lo é o que dá latitude e longitude a um ponto que nunca teve
 * cidade — as mesmas que abrem o Google Maps na ficha.
 */
export function desprojetar(x: number, y: number): { lat: number; lng: number } {
  const mercator = projecao.mercatorMax - y / projecao.escala

  return {
    lat: (360 / Math.PI) * Math.atan(Math.exp((mercator * Math.PI) / 180)) - 90,
    lng: x / projecao.escala + projecao.lngMin,
  }
}
