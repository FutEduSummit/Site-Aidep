'use client'

import { Check, ChevronDown, Globe } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState } from 'react'
import { Flag } from '@/components/ui/flag'
import { Link, usePathname } from '@/i18n/navigation'
import { locales, type Locale } from '@/i18n/routing'
import { DURATION, EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

/** Cada idioma no seu próprio idioma — nomes não se traduzem. */
const fullLabels: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
}

const shortLabels: Record<Locale, string> = {
  pt: 'PT',
  en: 'EN',
  es: 'ES',
}

/**
 * Seletor de idiomas.
 *
 * Duas apresentações do mesmo conteúdo:
 *
 *   `menu`  ícone de globo com a sigla atual; a lista completa — bandeira,
 *           nome e sigla — abre ao passar o mouse, ao clicar e pelo
 *           teclado. É o formato do topo em telas grandes.
 *   `list`  as três linhas sempre visíveis, para o menu de telas pequenas,
 *           onde não existe hover.
 *
 * Em qualquer um deles, o destino usa o caminho interno da rota atual mais
 * os parâmetros dinâmicos: trocar de idioma leva o usuário para a mesma
 * página no idioma escolhido — inclusive em páginas de projeto e de
 * notícia, com o slug preservado e a URL traduzida.
 */
export function LanguageSwitcher({
  className,
  variant = 'menu',
}: {
  className?: string
  variant?: 'menu' | 'list'
}) {
  const t = useTranslations('locale')
  const current = useLocale() as Locale
  const pathname = usePathname()
  const params = useParams()
  const uid = useId()

  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  /**
   * `usePathname` devolve o caminho interno já com os parâmetros
   * substituídos (ex.: `/projects/coracao-valente`). Para que o link seja
   * traduzido corretamente, o caminho precisa voltar à forma de template
   * (`/projects/[slug]`) — só assim o next-intl monta `/es/proyectos/...`
   * em vez de repetir a rota interna.
   */
  const template = Object.entries(params).reduce<string>((acc, [key, value]) => {
    if (key === 'locale' || value == null) return acc
    const segment = Array.isArray(value) ? value.join('/') : String(value)
    return acc.replace(`/${segment}`, `/[${key}]`)
  }, pathname)

  /* Clique fora e Escape fecham a lista. */
  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function itemLink(locale: Locale, itemClassName: string) {
    const isCurrent = locale === current
    return (
      <Link
        href={{ pathname: template, params } as never}
        locale={locale}
        hrefLang={locale}
        lang={locale}
        aria-current={isCurrent ? 'true' : undefined}
        onClick={() => setOpen(false)}
        className={itemClassName}
      >
        <Flag locale={locale} />
        <span className="flex-1 font-medium">{fullLabels[locale]}</span>
        <span
          aria-hidden="true"
          className="text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-subtle)"
        >
          {shortLabels[locale]}
        </span>
        {isCurrent ? (
          <>
            <Check
              aria-hidden="true"
              strokeWidth={2.5}
              className="size-4 text-(--accent-text)"
            />
            <span className="sr-only">{t('current')}</span>
          </>
        ) : (
          /* Reserva a largura do ícone: as três linhas ficam alinhadas. */
          <span aria-hidden="true" className="size-4" />
        )}
      </Link>
    )
  }

  if (variant === 'list') {
    return (
      <nav aria-label={t('switchLabel')} className={className}>
        <ul className="flex flex-col">
          {locales.map((locale) => (
            <li key={locale}>
              {itemLink(
                locale,
                cn(
                  'flex min-h-14 items-center gap-4 border-b border-(--border) text-body transition-colors duration-200 ease-brand',
                  locale === current
                    ? 'text-(--fg)'
                    : 'text-(--fg-muted) hover:text-(--fg)',
                ),
              )}
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  return (
    <nav
      ref={rootRef}
      aria-label={t('switchLabel')}
      className={cn('relative', className)}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setOpen(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setOpen(false)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false)
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        className="flex min-h-11 items-center gap-2 px-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--fg) transition-colors duration-200 ease-brand hover:text-(--accent-text)"
      >
        <Globe aria-hidden="true" strokeWidth={2} className="size-[1.0625rem]" />
        <span className="sr-only">
          {t('switchLabel')} — {fullLabels[current]}
        </span>
        <span aria-hidden="true">{shortLabels[current]}</span>
        <ChevronDown
          aria-hidden="true"
          strokeWidth={2}
          className={cn(
            'size-3.5 transition-transform duration-300 ease-brand',
            open && '-rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            id={`${uid}-list`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: DURATION.micro, ease: EASE }}
            className="surface absolute right-0 top-full z-10 min-w-56 border border-(--border) shadow-menu"
          >
            {locales.map((locale) => (
              <li
                key={locale}
                className="border-b border-(--border) last:border-b-0"
              >
                {itemLink(
                  locale,
                  cn(
                    'flex min-h-11 items-center gap-3 px-4 text-small transition-colors duration-200 ease-brand',
                    locale === current
                      ? 'bg-(--bg-raised) text-(--fg)'
                      : 'text-(--fg-muted) hover:bg-(--bg-raised) hover:text-(--fg)',
                  ),
                )}
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </nav>
  )
}
