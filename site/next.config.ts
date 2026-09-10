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
    /**
     * O otimizador do Next recomprime toda imagem que passa por
     * `next/image`, e o padrão dele é `qualities: [75]` — que em AVIF vira
     * q47, bem abaixo do q78 4:4:4 com que `scripts/preparar-acervo.mjs`
     * grava o acervo. O efeito era o acervo ser preparado com cuidado e
     * servido recomprimido: a queixa de "imagem sem resolução" na faixa do
     * esporte da Página inicial.
     *
     * Esta lista é a de valores **permitidos** — pedido fora dela volta 400.
     * O 90 é o que os componentes de imagem pedem, e a conta que justifica
     * o número está em `src/lib/image-quality.ts`, junto da constante. O 75
     * fica porque continua sendo o padrão de quem não pede nada: a
     * miniatura desfocada do `placeholder="blur"` e as imagens do painel.
     */
    qualities: [75, 90],
    deviceSizes: [360, 390, 640, 768, 1024, 1280, 1440, 1920, 2560],
    imageSizes: [16, 32, 48, 56, 64, 96, 128, 256, 384],
    remotePatterns: supabaseRemotePattern(),
  },
}

export default withNextIntl(nextConfig)
