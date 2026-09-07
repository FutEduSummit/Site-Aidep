'use client'

import {
  ExternalLink,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Tags,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { getLockup } from '@/lib/brand'
import { cn } from '@/lib/utils'
import { sair } from '../acoes'

const itens = [
  { href: '/admin', rotulo: 'Início', Icone: LayoutDashboard, exato: true },
  { href: '/admin/noticias', rotulo: 'Notícias', Icone: Newspaper },
  { href: '/admin/projetos', rotulo: 'Projetos', Icone: FolderKanban },
  { href: '/admin/documentos', rotulo: 'Transparência', Icone: FileText },
  {
    href: '/admin/documentos/categorias',
    rotulo: 'Categorias',
    Icone: Tags,
    recuado: true,
  },
]

export function Navegacao({
  nome,
  email,
}: {
  nome: string | null
  email: string
}) {
  const caminho = usePathname()
  const [aberto, setAberto] = useState(false)
  const marca = getLockup('pt', 'horizontalBlack')

  function ativo(href: string, exato?: boolean) {
    if (exato) return caminho === href
    /* "Categorias" mora dentro de "Transparência": sem o desempate, os dois
       acenderiam ao mesmo tempo. */
    if (href === '/admin/documentos') {
      return (
        caminho.startsWith('/admin/documentos') &&
        !caminho.startsWith('/admin/documentos/categorias')
      )
    }
    return caminho.startsWith(href)
  }

  return (
    <>
      {/* Barra superior — telas pequenas */}
      <div className="flex items-center justify-between gap-4 border-b border-(--border) bg-(--bg) px-5 py-3 lg:hidden">
        <Image
          src={marca.src}
          alt="AIDEP"
          width={marca.width}
          height={marca.height}
          className="h-7 w-auto"
        />
        <button
          type="button"
          onClick={() => setAberto(!aberto)}
          aria-expanded={aberto}
          className="flex size-11 items-center justify-center border border-(--border-strong)"
        >
          {aberto ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
          <span className="sr-only">Menu do painel</span>
        </button>
      </div>

      <nav
        aria-label="Seções do painel"
        className={cn(
          'w-full shrink-0 flex-col justify-between gap-8 border-(--border) bg-(--bg) px-5 py-6 lg:flex lg:w-64 lg:border-r',
          aberto ? 'flex border-b' : 'hidden',
        )}
      >
        <div className="flex flex-col gap-8">
          <Image
            src={marca.src}
            alt="AIDEP"
            width={marca.width}
            height={marca.height}
            /* `self-start`: o pai é um flex-column, que sem isso estica a
               imagem na transversal e deforma a marca. */
            className="hidden h-8 w-auto self-start lg:block"
          />

          <ul className="flex flex-col gap-1">
            {itens.map(({ href, rotulo, Icone, exato, recuado }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setAberto(false)}
                  aria-current={ativo(href, exato) ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center gap-3 px-3 text-small font-medium transition-colors duration-150',
                    recuado && 'ml-4',
                    ativo(href, exato)
                      ? 'bg-brand-100 text-brand-900'
                      : 'text-(--fg-muted) hover:bg-(--overlay) hover:text-(--fg)',
                  )}
                >
                  <Icone aria-hidden="true" className="size-4 shrink-0" />
                  {rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4 border-t border-(--border) pt-5">
          <a
            href="/pt"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex min-h-9 items-center gap-2 text-micro font-semibold uppercase tracking-[0.12em] text-(--fg-subtle) transition-colors hover:text-(--fg)"
          >
            <ExternalLink aria-hidden="true" className="size-3.5" />
            Ver o site
          </a>

          <div className="flex flex-col gap-1">
            <p className="truncate text-small font-semibold">{nome ?? 'Equipe AIDEP'}</p>
            <p className="truncate text-micro text-(--fg-subtle)">{email}</p>
          </div>

          <form action={sair}>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center gap-2 text-micro font-semibold uppercase tracking-[0.12em] text-(--fg-muted) transition-colors hover:text-danger"
            >
              <LogOut aria-hidden="true" className="size-3.5" />
              Sair
            </button>
          </form>
        </div>
      </nav>
    </>
  )
}
