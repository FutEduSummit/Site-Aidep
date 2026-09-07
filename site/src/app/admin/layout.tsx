import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'
import { brandColors } from '@/lib/brand'
import '../globals.css'

/**
 * PAINEL DO CLIENTE — CASCA
 * =========================
 * O painel vive fora de `[locale]`: não tem idioma na URL, não passa pelo
 * portão de pré-lançamento e não é indexado. É por isso que ele declara o
 * próprio `<html>` e `<body>` aqui, em vez de herdar os do site.
 *
 * A interface é toda em português — quem usa é a equipe da AIDEP. Os três
 * idiomas aparecem só dentro dos formulários, no conteúdo publicado.
 *
 * A guarda de sessão não fica neste arquivo: a tela de login precisa
 * renderizar sem sessão. Ela está em `(painel)/layout.tsx`, que envolve
 * todas as telas que exigem estar logado.
 */
const sora = localFont({
  src: [
    { path: '../../fonts/Sora-Light.ttf', weight: '300', style: 'normal' },
    { path: '../../fonts/Sora-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../fonts/Sora-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../../fonts/Sora-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../../fonts/Sora-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-sora',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial'],
})

export const metadata: Metadata = {
  title: 'Painel — AIDEP',
  description: 'Área de publicação de conteúdo do site da AIDEP.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: brandColors.white,
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={sora.variable} suppressHydrationWarning>
      <body data-surface="light" className="bg-paper-2 antialiased">
        {children}
      </body>
    </html>
  )
}
