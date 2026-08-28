import type { ReactNode } from 'react'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

/**
 * BANDEIRAS DO SELETOR DE IDIOMAS
 * ===============================
 * Desenhadas em SVG, não em emoji: no Windows o emoji de bandeira não é
 * renderizado (aparecem só as duas letras do país) e o seletor perderia o
 * sinal visual. São desenhos simplificados — o que se lê a 20px — e seguem
 * as variantes regionais já usadas no site (`pt_BR`, `en_US`, `es_ES`,
 * ver `lib/seo.ts`). Trocar a variante de um idioma é trocar o desenho
 * correspondente aqui.
 *
 * Decorativas: quem lê a lista com leitor de tela ouve o nome do idioma,
 * não o nome do país. Por isso `aria-hidden` e sem <title>.
 */

const shapes: Record<Locale, ReactNode> = {
  /* Brasil — verde, losango amarelo, círculo azul e a faixa branca. */
  pt: (
    <>
      <rect width="20" height="14" fill="#009b3a" />
      <path d="M10 1 18.4 7 10 13 1.6 7Z" fill="#fedf00" />
      <circle cx="10" cy="7" r="3.1" fill="#002776" />
      <path
        d="M7.2 8.1Q10 5.9 12.8 8.1"
        fill="none"
        stroke="#ffffff"
        strokeWidth="0.6"
      />
    </>
  ),

  /* Estados Unidos — 13 faixas e o cantão com as estrelas em grade. */
  en: (
    <>
      <rect width="20" height="14" fill="#ffffff" />
      {[0, 2, 4, 6, 8, 10, 12].map((stripe) => (
        <rect
          key={stripe}
          y={(stripe * 14) / 13}
          width="20"
          height={14 / 13}
          fill="#b22234"
        />
      ))}
      <rect width="8.4" height={(7 * 14) / 13} fill="#3c3b6e" />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4].map((column) => (
          <circle
            key={`${row}-${column}`}
            cx={1.1 + column * 1.6 + (row % 2 ? 0.8 : 0)}
            cy={1.1 + row * 1.65}
            r="0.32"
            fill="#ffffff"
          />
        )),
      )}
    </>
  ),

  /* Espanha — as três faixas horizontais, sem o escudo. */
  es: (
    <>
      <rect width="20" height="14" fill="#aa151b" />
      <rect y="3.5" width="20" height="7" fill="#f1bf00" />
    </>
  ),
}

export function Flag({
  locale,
  className,
}: {
  locale: Locale
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 20 14"
      aria-hidden="true"
      focusable="false"
      className={cn(
        'h-auto w-5 shrink-0 rounded-[1px] ring-1 ring-inset ring-black/15',
        className,
      )}
    >
      {shapes[locale]}
    </svg>
  )
}
