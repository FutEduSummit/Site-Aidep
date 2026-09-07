import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/**
 * Imagens vindas do Storage do Supabase — capas de notícia e projeto e
 * miniaturas de documento enviadas pelo painel. Só o host do projeto
 * configurado é liberado, e só o caminho público do Storage.
 */
function supabaseRemotePattern() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return []

  try {
    return [
      {
        protocol: 'https' as const,
        hostname: new URL(url).hostname,
        pathname: '/storage/v1/object/public/**',
      },
    ]
  } catch {
    return []
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 390, 640, 768, 1024, 1280, 1440, 1920, 2560],
    imageSizes: [16, 32, 48, 56, 64, 96, 128, 256, 384],
    remotePatterns: supabaseRemotePattern(),
  },
}

export default withNextIntl(nextConfig)
