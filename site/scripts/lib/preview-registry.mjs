/**
 * Pedaços comuns aos dois geradores de imagem de pré-visualização
 * (`gen-preview-images.mjs`, por IA, e `fetch-preview-images.mjs`, do Pexels).
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
 * Escreve `src/content/media-preview.ts`.
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
 * IMAGENS DE PRÉ-VISUALIZAÇÃO — ARQUIVO GERADO
 * ============================================
 * NÃO EDITE À MÃO. Gere de novo com:
 *
 *     ${command}
 *
 * Origem: ${origin}
 *
 * São imagens de EXEMPLO. Não retratam pessoas, projetos ou eventos reais
 * da AIDEP e não podem ser publicadas como registro institucional.
 *
 * Elas nunca aparecem por padrão: o site só as exibe com o interruptor de
 * pré-visualização ligado (ver \`components/ui/preview-toggle.tsx\`).
 * Quando a fotografia real chegar, cadastre-a em \`content/media.ts\` — ela
 * passa a valer sempre, com ou sem o interruptor.
 */
export const previewMedia: Record<string, MediaAsset> = {
${entries}
}

export function getPreviewMedia(key: string): MediaAsset | null {
  return previewMedia[key] ?? null
}
`
}
