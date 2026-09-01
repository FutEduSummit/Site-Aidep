import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'
import { brandColors } from '@/lib/brand'
import '../globals.css'

/**
 * Página de construção — casca própria de <html>/<body>.
 *
 * Esta rota vive FORA de `app/[locale]` de propósito: ela não passa pelo
 * roteamento de idiomas, não carrega cabeçalho, rodapé nem qualquer
 * conteúdo do site. Assim, quando o portão for desligado, basta apagar
 * esta pasta sem tocar em nada do site real.
 *
 * A fonte é declarada aqui de novo (e não importada do layout de idioma)
 * justamente para manter esta pasta autocontida e descartável. O
 * next/font reaproveita os mesmos arquivos, sem duplicar o download.
 */
const sora = localFont({
  src: [
    { path: '../../fonts/Sora-Light.ttf', weight: '300', style: 'normal' },
    { path: '../../fonts/Sora-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../fonts/Sora-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../../fonts/Sora-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../../fonts/Sora-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../../fonts/Sora-ExtraBold.ttf', weight: '800', style: 'normal' },
  ],
  variable: '--font-sora',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial'],
})

export const viewport: Viewport = {
  themeColor: brandColors.black,
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Site em construção — AIDEP',
  description: 'O novo site da AIDEP está sendo finalizado.',
  /* Nada desta fase deve ser indexado. */
  robots: { index: false, follow: false, nocache: true },
}

export default function ConstrucaoLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={sora.variable}>
      <body data-surface="dark" className="antialiased">
        {children}
      </body>
    </html>
  )
}
