'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotionSafe } from '@/hooks/use-media'
import { PartnerLogo } from '@/components/ui/partner-logo'
import type { Partner } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

type LogoMarqueeProps = {
  partners: Partner[]
  locale: Locale
  label: string
  /** Texto exibido quando a logo oficial ainda não foi fornecida. */
  pendingLabel: string
  /** Segundos que uma volta da lista leva para atravessar a faixa. */
  speedSeconds?: number
  className?: string
}

/**
 * FAIXA CONTÍNUA DE PARCEIROS
 * ===========================
 * A lista corre para a esquerda em laço, e para quando o ponteiro entra
 * na faixa.
 *
 * O BURACO NA FAIXA
 * -----------------
 * A faixa é feita de uma trilha que anda −50% e volta ao começo: com a
 * lista publicada duas vezes, o quadro em que ela volta é idêntico ao
 * anterior e a emenda não se vê.
 *
 * Só que isso pressupõe que **duas cópias da lista sejam mais largas que
 * a faixa**. A AIDEP tem quatro parceiros; em um monitor grande as duas
 * cópias não chegavam a encher a tela, e sobrava um vão — a faixa
 * aparecia com um pedaço vazio, indo e voltando. Não era falha de
 * carregamento: era a lista curta demais para o laço.
 *
 * A correção é medir. Uma cópia é medida no navegador (o texto muda de
 * largura em cada idioma, e a logo tem altura variável — não dá para
 * estimar), e a trilha passa a levar quantas cópias forem precisas para
 * cada metade dela cobrir a faixa inteira. Com quatro parceiros num
 * monitor grande são três ou quatro cópias por metade; num celular, uma.
 *
 * A duração acompanha: `speedSeconds` é o tempo de **uma** cópia passar,
 * então a volta inteira dura isso vezes o número de cópias. Sem essa
 * conta, encher a tela deixaria a faixa mais rápida.
 *
 * Acessibilidade: só a primeira cópia é anunciada; as outras são
 * `aria-hidden`, e o leitor de tela ouve os parceiros uma vez. Com
 * movimento reduzido, a faixa fica parada e rolável.
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
  const faixa = useRef<HTMLDivElement>(null)
  const umaCopia = useRef<HTMLUListElement>(null)

  /** Cópias da lista por metade da trilha. Ver o comentário acima. */
  const [copias, setCopias] = useState(1)

  useEffect(() => {
    const moldura = faixa.current
    const lista = umaCopia.current
    if (!moldura || !lista) return

    const medir = () => {
      const larguraDaCopia = lista.scrollWidth
      const larguraDaFaixa = moldura.clientWidth
      if (larguraDaCopia === 0 || larguraDaFaixa === 0) return

      /* Uma cópia a mais do que o necessário para cobrir a faixa: a
         emenda acontece fora da tela, e não na borda direita. */
      setCopias(Math.max(1, Math.ceil(larguraDaFaixa / larguraDaCopia) + 1))
    }

    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(moldura)
    observador.observe(lista)
    return () => observador.disconnect()
  }, [partners.length, locale])

  if (partners.length === 0) return null

  const renderItem = (partner: Partner, index: number) => (
    <li
      key={`${partner.id}-${index}`}
      className="flex shrink-0 items-center justify-center px-[clamp(1.25rem,3vw,3rem)]"
    >
      {partner.logo ? (
        <PartnerLogo partner={partner} locale={locale} size="sm" />
      ) : (
        <span
          title={pendingLabel}
          className="whitespace-nowrap text-[clamp(0.95rem,1.6vw,1.35rem)] font-semibold tracking-[-0.01em] text-(--fg-muted)"
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

  /* A trilha inteira: duas metades idênticas de `copias` listas cada. A
     primeira é a anunciada; as demais existem só para o olho. */
  const listas = Array.from({ length: copias * 2 }, (_, volta) => (
    <ul
      key={volta}
      ref={volta === 0 ? umaCopia : undefined}
      aria-label={volta === 0 ? label : undefined}
      aria-hidden={volta === 0 ? undefined : 'true'}
      className="flex w-max items-center py-2"
    >
      {partners.map((partner, index) =>
        renderItem(partner, index + volta * partners.length),
      )}
    </ul>
  ))

  return (
    <div
      ref={faixa}
      data-motion="marquee"
      className={cn('marquee group relative flex w-full overflow-hidden', className)}
    >
      <div
        className="marquee-track flex w-max"
        style={{ animationDuration: `${speedSeconds * copias}s` }}
      >
        {listas}
      </div>
    </div>
  )
}
