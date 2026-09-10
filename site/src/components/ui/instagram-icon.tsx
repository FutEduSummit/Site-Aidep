import type { SVGProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * ÍCONE DO INSTAGRAM
 * ==================
 * Desenhado aqui porque o lucide-react 1.x removeu os ícones de marca — não
 * existe mais `Instagram` no pacote. O traçado segue a grade do lucide
 * (viewBox 24, traço de 2 em `currentColor`, pontas arredondadas) para o
 * ícone pesar o mesmo que os vizinhos (`Mail`, `MapPin`) na mesma linha.
 *
 * Decorativo por padrão: quem lê com leitor de tela ouve o handle ao lado.
 * Passe `aria-hidden={false}` e um rótulo se algum dia ele aparecer sozinho.
 */
export function InstagramIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('size-4 shrink-0', className)}
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}
