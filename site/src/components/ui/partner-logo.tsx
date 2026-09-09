import Image from 'next/image'
import type { Partner } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

/**
 * Caixa de altura e largura fixas. As logomarcas dos parceiros têm proporções
 * muito diferentes — a Honda é uma tipográfica de 7,9:1, a assinatura da
 * Prefeitura tem 2,9:1 — e normalizar só a altura deixaria a mais larga
 * dominando a faixa. Com a caixa travada nos dois eixos e `object-contain`,
 * cada logo se encaixa e todas ficam com peso visual parecido.
 */
const boxes = {
  sm: 'h-[clamp(1.75rem,3.5vw,2.5rem)] w-[clamp(6.5rem,13vw,10rem)]',
  md: 'h-[clamp(2rem,4vw,2.75rem)] w-[clamp(7rem,14vw,11rem)]',
  lg: 'h-[clamp(2.25rem,4.5vw,3.25rem)] w-[clamp(7.5rem,15vw,12rem)]',
} as const

export type PartnerLogoSize = keyof typeof boxes

/**
 * Logomarca oficial do parceiro. Devolve `null` quando o arquivo ainda não foi
 * fornecido — quem chama decide o que mostrar no lugar (a faixa mostra o nome
 * numa placa tipográfica; a lista já exibe o nome ao lado e não repete).
 */
export function PartnerLogo({
  partner,
  locale,
  size = 'md',
  align = 'center',
  className,
}: {
  partner: Partner
  locale: Locale
  size?: PartnerLogoSize
  align?: 'left' | 'center'
  className?: string
}) {
  if (!partner.logo) return null

  return (
    <span
      className={cn('flex shrink-0 items-center', boxes[size], className)}
    >
      <Image
        src={partner.logo.src}
        alt={partner.logo.alt[locale]}
        width={partner.logo.width}
        height={partner.logo.height}
        sizes="(max-width: 768px) 45vw, 200px"
        className={cn(
          'h-full w-full object-contain',
          align === 'left' ? 'object-left' : 'object-center',
        )}
      />
    </span>
  )
}
