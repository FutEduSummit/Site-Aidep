'use client'

import Image from 'next/image'
import { useReducedMotionSafe } from '@/hooks/use-media'
import type { Partner } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

type LogoMarqueeProps = {
  partners: Partner[]
  locale: Locale
  label: string
  /** Texto exibido quando a logo oficial ainda não foi fornecida. */
  pendingLabel: string
  speedSeconds?: number
  className?: string
}

/**
 * Faixa contínua de parceiros.
 *
 * • A lista real é anunciada uma única vez; a cópia usada para o loop é
 *   `aria-hidden`, então leitores de tela não repetem os nomes.
 * • Sem logo oficial fornecida, o parceiro aparece como placa tipográfica —
 *   nunca uma logo recriada.
 * • Com movimento reduzido, a faixa fica estática e rolável.
 */
export function LogoMarquee({
  partners,
  locale,
  label,
  pendingLabel,
  speedSeconds = 48,
  className,
}: LogoMarqueeProps) {
  const reduced = useReducedMotionSafe()

  if (partners.length === 0) return null

  const renderItem = (partner: Partner, index: number) => (
    <li
      key={`${partner.id}-${index}`}
      className="flex shrink-0 items-center justify-center px-[clamp(1.25rem,3vw,3rem)]"
    >
      {partner.logo ? (
        <Image
          src={partner.logo.src}
          alt={partner.logo.alt[locale]}
          width={partner.logo.width}
          height={partner.logo.height}
          sizes="(max-width: 768px) 40vw, 220px"
          className="h-[clamp(1.75rem,3.5vw,2.75rem)] w-auto object-contain"
        />
      ) : (
        <span
          title={pendingLabel}
          className="whitespace-nowrap text-[clamp(0.95rem,1.6vw,1.35rem)] font-semibold tracking-[-0.01em] text-[var(--fg-muted)]"
        >
          {partner.name}
        </span>
      )}
    </li>
  )

  if (reduced) {
    return (
      <div className={cn('overflow-x-auto', className)}>
        <ul
          aria-label={label}
          className="flex min-w-full items-center justify-start py-2"
        >
          {partners.map(renderItem)}
        </ul>
      </div>
    )
  }

  return (
    <div
      data-motion="marquee"
      className={cn(
        'marquee group relative flex w-full overflow-hidden',
        className,
      )}
    >
      <div
        className="marquee-track flex w-max"
        style={{ animationDuration: `${speedSeconds}s` }}
      >
        <ul aria-label={label} className="flex w-max items-center py-2">
          {partners.map(renderItem)}
        </ul>
        {/* Cópia apenas visual: o loop não repete nomes para leitores de tela. */}
        <ul aria-hidden="true" className="flex w-max items-center py-2">
          {partners.map((partner, index) =>
            renderItem(partner, index + partners.length),
          )}
        </ul>
      </div>
    </div>
  )
}
