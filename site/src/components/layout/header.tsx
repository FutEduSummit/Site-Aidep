'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { Link, usePathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getLockup } from '@/lib/brand'
import { DURATION, EASE, STAGGER } from '@/lib/motion'
import { homeSections, isActivePath, primaryNav } from '@/lib/nav'
import { cn } from '@/lib/utils'

export function Header() {
  const t = useTranslations('nav')
  const tA11y = useTranslations('a11y')
  const locale = useLocale() as Locale
  const pathname = usePathname()

  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const lockupColor = getLockup(locale, 'horizontalColor')
  const lockupWhite = getLockup(locale, 'horizontalWhite')

  /* A Página inicial reúne várias seções: quando o visitante está nela, o
     menu mobile oferece os atalhos internos em vez de mandá-lo para fora. */
  const onHome = isActivePath(pathname, '/')

  /* Estado sólido do header — uma única troca de estado, sem re-render por frame. */
  useEffect(() => {
    let frame = 0
    function onScroll() {
      if (frame) return
      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24)
        frame = 0
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  /* Fecha o menu ao navegar — ajuste durante a renderização, sem efeito. */
  const [lastPathname, setLastPathname] = useState(pathname)
  if (lastPathname !== pathname) {
    setLastPathname(pathname)
    if (open) setOpen(false)
  }

  /* Trava a rolagem e mantém o foco dentro do painel enquanto ele está aberto. */
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null)

      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const surface = scrolled || open ? 'light' : 'dark'

  return (
    <>
      <motion.header
        data-surface={open ? 'dark' : surface}
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: DURATION.base, ease: EASE, delay: 0.05 }}
        className={cn(
          'fixed inset-x-0 top-0 z-100 text-(--fg) transition-colors duration-300 ease-brand',
          scrolled && !open
            ? 'border-b border-(--border) bg-(--bg)'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="container-site flex h-18 items-center justify-between gap-6 lg:h-22">
          <Link
            href="/"
            aria-label={tA11y('logoHome')}
            className="relative flex items-center py-2"
          >
            <span className="relative block h-9 w-auto lg:h-12">
              <Image
                src={lockupColor.src}
                alt=""
                width={lockupColor.width}
                height={lockupColor.height}
                priority
                sizes="180px"
                className={cn(
                  'h-9 w-auto transition-opacity duration-300 ease-brand lg:h-12',
                  scrolled && !open ? 'opacity-100' : 'opacity-0',
                )}
              />
              <Image
                src={lockupWhite.src}
                alt=""
                width={lockupWhite.width}
                height={lockupWhite.height}
                priority
                sizes="180px"
                className={cn(
                  'absolute inset-0 h-9 w-auto transition-opacity duration-300 ease-brand lg:h-12',
                  scrolled && !open ? 'opacity-0' : 'opacity-100',
                )}
              />
            </span>
          </Link>

          {/* A página atual é marcada com `aria-current` para leitores de
              tela e com um traço sob o rótulo para quem vê — nunca só pela
              cor, que sozinha não é sinal acessível. */}
          <nav
            aria-label={t('primaryLabel')}
            className="hidden xl:flex xl:items-center xl:gap-1"
          >
            {primaryNav.map((item) => {
              const active = isActivePath(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative px-3 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 ease-brand',
                    active
                      ? 'text-(--accent-text)'
                      : 'link-underline text-(--fg) hover:text-(--accent-text)',
                  )}
                >
                  {t(item.key)}
                  {active ? (
                    <>
                      <motion.span
                        aria-hidden="true"
                        layoutId="nav-active"
                        transition={{ duration: DURATION.fast, ease: EASE }}
                        className="absolute inset-x-3 -bottom-px block h-0.5 bg-(--accent)"
                      />
                      <span className="sr-only"> ({t('currentPage')})</span>
                    </>
                  ) : null}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2 lg:gap-4">
            <LanguageSwitcher className="hidden md:block" />

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              className="flex size-11 items-center justify-center border border-(--border-strong) text-(--fg) transition-colors duration-200 ease-brand hover:border-(--fg) xl:hidden"
            >
              <span className="sr-only">
                {open ? t('closeMenu') : t('openMenu')}
              </span>
              {open ? (
                <X aria-hidden="true" strokeWidth={2} className="size-5" />
              ) : (
                <Menu aria-hidden="true" strokeWidth={2} className="size-5" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="menu-mobile"
            ref={panelRef}
            data-surface="dark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="surface fixed inset-0 z-90 overflow-y-auto pb-[max(2rem,env(safe-area-inset-bottom))] pt-18 lg:pt-22 xl:hidden"
          >
            <motion.nav
              aria-label={t('mobileLabel')}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: STAGGER.tight, delayChildren: 0.08 },
                },
              }}
              className="container-site flex flex-col pt-6"
            >
              {primaryNav.map((item, index) => {
                const active = isActivePath(pathname, item.href)
                return (
                  <motion.div
                    key={item.href}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: DURATION.fast, ease: EASE },
                      },
                    }}
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-baseline gap-4 border-b py-5 text-h3 font-semibold tracking-[-0.03em] transition-colors duration-200 ease-brand',
                        active
                          ? 'border-(--accent) text-(--accent)'
                          : 'border-(--border) text-(--fg)',
                      )}
                    >
                      <span
                        className={cn(
                          'text-micro font-semibold uppercase tracking-[0.18em]',
                          active ? 'text-(--accent)' : 'text-(--fg-subtle)',
                        )}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {t(item.key)}
                      {active ? (
                        <span className="sr-only"> ({t('currentPage')})</span>
                      ) : null}
                    </Link>
                  </motion.div>
                )
              })}

              {/* Na Página inicial, o menu leva às seções dela — sem
                  simular uma troca de página que não acontece. */}
              {onHome ? (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: DURATION.fast, ease: EASE },
                    },
                  }}
                  className="mt-10 flex flex-col gap-4"
                >
                  <h2 className="text-micro font-semibold uppercase tracking-[0.18em] text-(--fg-subtle)">
                    {t('sectionsLabel')}
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {homeSections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          onClick={() => setOpen(false)}
                          className="inline-flex min-h-11 items-center border border-(--border-strong) px-4 py-2 text-small font-medium transition-colors duration-200 ease-brand hover:border-(--accent) hover:text-(--accent)"
                        >
                          {t(section.key)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : null}

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: DURATION.fast, ease: EASE },
                  },
                }}
                className="mt-10 flex flex-col gap-8"
              >
                <LanguageSwitcher variant="list" />
              </motion.div>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
