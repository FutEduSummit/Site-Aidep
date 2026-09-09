import Image from 'next/image'
import type { Partner } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

/**
 * `--logo-h` é a altura de todas as logos — a caixa trava só a altura e deixa
 * a largura livre, então cada logomarca fica exatamente na mesma altura das
 * vizinhas, independente da proporção.
 *
 * No tamanho `lg` a caixa também tem largura fixa, de 8× a altura: é onde o
 * nome do parceiro aparece ao lado da logo, e a coluna fixa alinha os nomes
 * de uma linha para a outra. 8× cabe a logo mais alongada do conjunto (a
 * tipográfica da Honda, 7,9:1) sem que ela precise encolher para caber.
 */
const boxes = {
  sm: '[--logo-h:clamp(1.4rem,2.8vw,2.25rem)]',
  md: '[--logo-h:clamp(1.4rem,2.8vw,2.25rem)]',
  lg: '[--logo-h:clamp(1.5rem,3vw,2.5rem)] w-[calc(var(--logo-h)*8)]',
} as const

export type PartnerLogoSize = keyof typeof boxes

/**
 * Logomarca oficial do parceiro. Devolve `null` quando o arquivo ainda não foi
 * fornecido — quem chama decide o que mostrar no lugar (a faixa mostra o nome
 * numa placa tipográfica; a lista já exibe o nome ao lado e não o repete).
 */
export function PartnerLogo({
  partner,
  locale,
  size = 'md',
  align = 'center',
  decorative = false,
  className,
}: {
  partner: Partner
  locale: Locale
  size?: PartnerLogoSize
  align?: 'left' | 'center'
  /**
   * O nome do parceiro já aparece em texto ao lado — com `alt` preenchido o
   * leitor de tela anunciaria a instituição duas vezes.
   */
  decorative?: boolean
  className?: string
}) {
  const { logo } = partner
  if (!logo) return null

  return (
    <span
      className={cn(
        'flex h-(--logo-h) shrink-0 items-center',
        align === 'left' ? 'justify-start' : 'justify-center',
        boxes[size],
        className,
      )}
    >
      <Image
        src={logo.src}
        alt={decorative ? '' : logo.alt[locale]}
        width={logo.width}
        height={logo.height}
        sizes="(max-width: 768px) 60vw, 340px"
        className={cn(
          'h-full w-auto max-w-full object-contain',
          align === 'left' ? 'object-left' : 'object-center',
        )}
      />
    </span>
  )
}
