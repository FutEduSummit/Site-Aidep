'use client'

import {
  ArrowRight,
  ChevronDown,
  Goal,
  HeartHandshake,
  School,
  Trophy,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { DURATION, EASE } from '@/lib/motion'
import type { ProjectNavItem } from '@/lib/nav'
import { cn } from '@/lib/utils'

/**
 * Um ícone por projeto do briefing. Projeto criado no painel não tem ícone
 * declarado e recebe o genérico — a lista nunca fica sem símbolo.
 */
const iconBySlug: Record<string, ReactNode> = {
  'coracao-valente': <HeartHandshake strokeWidth={1.75} className="size-5" />,
  'futsal-na-escola': <School strokeWidth={1.75} className="size-5" />,
  'futedu-summit': <Trophy strokeWidth={1.75} className="size-5" />,
}

const genericIcon = <Goal strokeWidth={1.75} className="size-5" />

function iconFor(slug: string): ReactNode {
  return iconBySlug[slug] ?? genericIcon
}

/**
 * O projeto aberto é o item marcado na lista.
 *
 * `usePathname` do next-intl entrega o caminho interno ainda em forma de
 * template (`/projects/[slug]`), então ele serve para saber *se* estamos
 * em um projeto; o slug de verdade vem dos parâmetros da rota.
 */
function useCurrentSlug(): string | null {
  const pathname = usePathname()
  const params = useParams()

  if (!pathname.startsWith('/projects/')) return null

  const slug = params.slug
  if (typeof slug === 'string') return slug
  return Array.isArray(slug) ? (slug[0] ?? null) : null
}

/* ------------------------------------------------------------------ */
/* Linha da lista — mesma leitura no desktop e no mobile              */
/* ------------------------------------------------------------------ */

function ProjectRow({
  project,
  current,
  onNavigate,
  compact = false,
}: {
  project: ProjectNavItem
  current: boolean
  onNavigate: () => void
  compact?: boolean
}) {
  const t = useTranslations('nav')

  return (
    <Link
      href={{ pathname: '/projects/[slug]', params: { slug: project.slug } }}
      aria-current={current ? 'page' : undefined}
      onClick={onNavigate}
      className={cn(
        'group/row flex items-start gap-4 transition-colors duration-200 ease-brand',
        compact ? 'py-3.5' : 'px-4 py-4',
        current ? 'bg-(--bg-raised)' : 'hover:bg-(--bg-raised)',
      )}
    >
      {/* Placa do ícone: contorno em repouso, verde da marca em foco — o
          mesmo destaque que marca o projeto aberto. */}
      <span
        aria-hidden="true"
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xs border transition-colors duration-200 ease-brand',
          compact ? 'size-10' : 'size-11',
          current
            ? 'border-(--accent) bg-(--accent) text-(--accent-contrast)'
            : 'border-(--border-strong) text-(--fg-muted) group-hover/row:border-(--accent) group-hover/row:bg-(--accent) group-hover/row:text-(--accent-contrast)',
        )}
      >
        {iconFor(project.slug)}
      </span>

      <span className="flex min-w-0 flex-col gap-1">
        <span
          className={cn(
            'text-small font-semibold leading-snug tracking-[-0.01em] transition-colors duration-200 ease-brand',
            current
              ? 'text-(--accent-text)'
              : 'text-(--fg) group-hover/row:text-(--accent-text)',
          )}
        >
          {project.name}
          {current ? <span className="sr-only"> ({t('currentPage')})</span> : null}
        </span>
        <span
          className={cn(
            'text-[0.8125rem] leading-[1.45] text-(--fg-muted)',
            compact ? 'line-clamp-1' : 'line-clamp-2',
          )}
        >
          {project.summary}
        </span>
      </span>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Desktop — disclosure com link de topo                              */
/* ------------------------------------------------------------------ */

/**
 * Item "Projetos" da navegação de telas grandes.
 *
 * O rótulo continua sendo um link para o índice (`children`, renderizado
 * pelo header como qualquer outro item); ao lado dele, um botão com a seta
 * abre a lista dos projetos. É o padrão de disclosure com link de topo:
 * quem usa mouse abre passando por cima, quem usa teclado abre pelo botão
 * — e em nenhum dos dois casos o índice deixa de ser alcançável.
 */
export function ProjectsMenu({
  projects,
  children,
}: {
  projects: ProjectNavItem[]
  children: ReactNode
}) {
  const t = useTranslations('nav')
  const tActions = useTranslations('actions')
  const currentSlug = useCurrentSlug()
  const uid = useId()

  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

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

  return (
    <div
      ref={rootRef}
      className="relative"
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
      <div className="flex items-center">
        {children}

        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowDown') return
            event.preventDefault()
            setOpen(true)
            /* Abre e entrega o foco à primeira linha, como se espera de um menu. */
            requestAnimationFrame(() => {
              panelRef.current?.querySelector<HTMLElement>('a[href]')?.focus()
            })
          }}
          aria-expanded={open}
          aria-controls={`${uid}-projects`}
          className="-ml-1 flex size-8 items-center justify-center text-(--fg) transition-colors duration-200 ease-brand hover:text-(--accent-text)"
        >
          <span className="sr-only">{t('projectsSubmenu')}</span>
          <ChevronDown
            aria-hidden="true"
            strokeWidth={2}
            className={cn(
              'size-3.5 transition-transform duration-300 ease-brand',
              open && '-rotate-180',
            )}
          />
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          /* O `pt-3` é a ponte entre o rótulo e o painel: sem ele o mouse
             cruzaria um vão e a lista fecharia no caminho. */
          <motion.div
            ref={panelRef}
            id={`${uid}-projects`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: DURATION.micro, ease: EASE }}
            className="absolute left-0 top-full z-10 pt-3"
          >
            <ul className="surface w-96 max-w-[calc(100vw-2rem)] border border-(--border) shadow-menu">
              {projects.map((project) => (
                <li
                  key={project.slug}
                  className="border-b border-(--border) last:border-b-0"
                >
                  <ProjectRow
                    project={project}
                    current={project.slug === currentSlug}
                    onNavigate={() => setOpen(false)}
                  />
                </li>
              ))}

              <li className="border-t border-(--border)">
                <Link
                  href="/projects"
                  onClick={() => setOpen(false)}
                  className="group/all flex min-h-12 items-center justify-between gap-3 px-4 text-label font-semibold uppercase tracking-[0.14em] text-(--fg-muted) transition-colors duration-200 ease-brand hover:bg-(--bg-raised) hover:text-(--accent-text)"
                >
                  {tActions('seeProjects')}
                  <ArrowRight
                    aria-hidden="true"
                    strokeWidth={2}
                    className="size-4 transition-transform duration-300 ease-brand group-hover/all:translate-x-1"
                  />
                </Link>
              </li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Mobile — a mesma lista, sempre aberta                              */
/* ------------------------------------------------------------------ */

/**
 * Em telas pequenas não existe passar o mouse por cima: os projetos ficam
 * listados sob o item "Projetos", com o mesmo ícone e a mesma chamada.
 */
export function ProjectsSubnav({
  projects,
  onNavigate,
}: {
  projects: ProjectNavItem[]
  onNavigate: () => void
}) {
  const currentSlug = useCurrentSlug()

  return (
    <ul className="flex flex-col border-b border-(--border) pl-4">
      {projects.map((project) => (
        <li key={project.slug}>
          <ProjectRow
            project={project}
            current={project.slug === currentSlug}
            onNavigate={onNavigate}
            compact
          />
        </li>
      ))}
    </ul>
  )
}
