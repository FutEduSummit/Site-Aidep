/**
 * Pedaços comuns ao gerador de imagens de banco (`fetch-stock-images.mjs`).
 */

/** Lê largura e altura direto do JPEG (marcadores SOF). */
export function jpegSize(buffer) {
  let offset = 2
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1
      continue
    }
    const marker = buffer[offset + 1]
    const length = buffer.readUInt16BE(offset + 2)
    const isSOF =
      marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)
    if (isSOF) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      }
    }
    offset += 2 + length
  }
  throw new Error('não foi possível ler as dimensões do JPEG')
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Escreve `src/content/media-stock.ts`.
 *
 * @param assets  chave → { src, width, height, alt: {pt,en,es}, credit? }
 * @param origin  texto que descreve de onde vieram as imagens
 * @param command comando que regenera o arquivo
 */
export function renderRegistry(assets, { origin, command }) {
  const entries = Object.entries(assets)
    .map(([key, asset]) => {
      const credit = asset.credit
        ? `\n    credit: ${JSON.stringify(asset.credit)},`
        : ''
      return `  '${key}': {
    src: '${asset.src}',
    width: ${asset.width},
    height: ${asset.height},
    alt: {
      pt: ${JSON.stringify(asset.alt.pt)},
      en: ${JSON.stringify(asset.alt.en)},
      es: ${JSON.stringify(asset.alt.es)},
    },${credit}
  },`
    })
    .join('\n')

  return `import type { MediaAsset } from './types'

/**
 * FOTOGRAFIAS DE BANCO — ARQUIVO GERADO
 * =====================================
 * NÃO EDITE À MÃO. Gere de novo com:
 *
 *     ${command}
 *
 * Origem: ${origin}
 *
 * São fotografias de BANCO, exibidas enquanto o registro oficial de imagens
 * não estiver completo. Não retratam pessoas, projetos ou eventos reais da
 * AIDEP e não podem ser apresentadas como registro institucional — o
 * crédito do fotógrafo acompanha cada arquivo.
 *
 * Nenhuma imagem deste projeto é gerada por IA.
 *
 * Assim que a fotografia real da AIDEP for cadastrada na mesma chave em
 * \`content/media.ts\`, ela passa a valer e a foto de banco deixa de ser
 * usada — ver \`getMedia()\`.
 */
export const stockMedia: Record<string, MediaAsset> = {
${entries}
}

export function getStockMedia(key: string): MediaAsset | null {
  return stockMedia[key] ?? null
}
`
}
