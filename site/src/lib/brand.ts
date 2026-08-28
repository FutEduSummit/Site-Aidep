import type { Locale } from '@/i18n/routing'

/**
 * ARQUIVOS OFICIAIS DE MARCA
 * ==========================
 * Os logotipos são usados exatamente como entregues: nenhum arquivo foi
 * redesenhado, recomposto, rotacionado, distorcido ou recolorido. Cada
 * entrada guarda as dimensões reais do arquivo para que a proporção seja
 * sempre preservada e não haja deslocamento de layout.
 *
 * Versões disponíveis, conforme o Manual de Marca:
 *   • marca institucional horizontal  — símbolo + AIDEP + descritivo
 *   • marca vertical                  — símbolo acima do texto
 *   • marca tipográfica horizontal    — AIDEP + descritivo, sem símbolo
 *   • marca iconográfica              — apenas o símbolo
 */
export type BrandAsset = {
  src: string
  width: number
  height: number
}

export const symbolMark = {
  green: { src: '/brand/symbol-green.png', width: 1296, height: 1343 },
  white: { src: '/brand/symbol-white.png', width: 1296, height: 1344 },
  black: { src: '/brand/symbol-black.png', width: 1296, height: 1344 },
} satisfies Record<string, BrandAsset>

const lockups = {
  pt: {
    horizontalColor: { src: '/brand/pt/horizontal-color.png', width: 2718, height: 1069 },
    horizontalWhite: { src: '/brand/pt/horizontal-white.png', width: 2718, height: 1069 },
    horizontalBlack: { src: '/brand/pt/horizontal-black.png', width: 2718, height: 1069 },
    verticalColor: { src: '/brand/pt/vertical-color.png', width: 1478, height: 1777 },
    verticalWhite: { src: '/brand/pt/vertical-white.png', width: 1478, height: 1777 },
    typeBlack: { src: '/brand/pt/type-horizontal-black.png', width: 2970, height: 360 },
    typeWhite: { src: '/brand/pt/type-horizontal-white.png', width: 2970, height: 359 },
  },
  en: {
    horizontalColor: { src: '/brand/en/horizontal-color.png', width: 3475, height: 1367 },
    horizontalWhite: { src: '/brand/en/horizontal-white.png', width: 3475, height: 1366 },
    horizontalBlack: { src: '/brand/en/horizontal-black.png', width: 3475, height: 1367 },
    verticalColor: { src: '/brand/en/vertical-color.png', width: 1889, height: 2271 },
    verticalWhite: { src: '/brand/en/vertical-white.png', width: 1889, height: 2272 },
    typeBlack: { src: '/brand/en/type-horizontal-black.png', width: 3651, height: 460 },
    typeWhite: { src: '/brand/en/type-horizontal-white.png', width: 3651, height: 459 },
  },
  es: {
    horizontalColor: { src: '/brand/es/horizontal-color.png', width: 3474, height: 1367 },
    horizontalWhite: { src: '/brand/es/horizontal-white.png', width: 3474, height: 1366 },
    horizontalBlack: { src: '/brand/es/horizontal-black.png', width: 3474, height: 1366 },
    verticalColor: { src: '/brand/es/vertical-color.png', width: 1889, height: 2271 },
    verticalWhite: { src: '/brand/es/vertical-white.png', width: 1889, height: 2271 },
    typeBlack: { src: '/brand/es/type-horizontal-black.png', width: 3668, height: 459 },
    typeWhite: { src: '/brand/es/type-horizontal-white.png', width: 3668, height: 459 },
  },
} satisfies Record<Locale, Record<string, BrandAsset>>

export type LockupVariant = keyof (typeof lockups)['pt']

export function getLockup(locale: Locale, variant: LockupVariant): BrandAsset {
  return lockups[locale][variant]
}

/** Imagem Open Graph oficial, composta a partir dos arquivos de marca. */
export function getOgImage(locale: Locale) {
  return { url: `/og/${locale}.png`, width: 1200, height: 630 }
}

/** Cores institucionais — espelho dos tokens CSS, para uso em JSON-LD e meta tags. */
export const brandColors = {
  green: '#10963e',
  black: '#0a0a0a',
  white: '#ffffff',
} as const
