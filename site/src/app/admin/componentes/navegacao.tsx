'use client'

import {
  ExternalLink,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorPlay,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Tags,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useSyncExternalStore } from 'react'
import { getLockup, symbolMark } from '@/lib/brand'
import { cn } from '@/lib/utils'
import { sair } from '../acoes'

const itens = [
  { href: '/admin', rotulo: 'Início', Icone: LayoutDashboard, exato: true },
  { href: '/admin/noticias', rotulo: 'Notícias', Icone: Newspaper },
  { href: '/admin/projetos', rotulo: 'Projetos', Icone: FolderKanban },
  { href: '/admin/documentos', rotulo: 'Transparência', Icone: FileText },
  {
    href: '/admin/documentos/painel',
    rotulo: 'Painel do governo',
    Icone: MonitorPlay,
    recuado: true,
  },
  {
    href: '/admin/documentos/categorias',
    rotulo: 'Categorias',
    Icone: Tags,
    recuado: true,
  },
]

/**
 * PREFERÊNCIA DE COMPRESSÃO
 * =========================
 * Comprimir o menu é escolha de quem trabalha aqui: vale entre sessões, não
 * só entre navegações. Guardar num store externo mínimo, em vez de estado
 * com efeito, resolve o fato de o servidor não ter `localStorage`: a
 * hidratação usa o valor do servidor e a troca pelo valor gravado vem logo
 * depois, sem descompasso de marcação.
 */
const CHAVE = 'aidep:painel:menu-comprimido'

let preferencia: boolean | null = null
const ouvintes = new Set<() => void>()

function lerPreferencia() {
  if (preferencia === null) {
    try {
      preferencia = window.localStorage.getItem(CHAVE) === '1'
    } catch {
      /* Armazenamento bloqueado pelo navegador: segue expandido. */
      preferencia = false
    }
  }
  return preferencia
}

function gravarPreferencia(valor: boolean) {
  preferencia = valor
  try {
    window.localStorage.setItem(CHAVE, valor ? '1' : '0')
  } catch {
    /* Sem persistência: a escolha ainda vale nesta sessão. */
  }
  for (const ouvinte of ouvintes) ouvinte()
}

function inscrever(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

export function Navegacao({
  nome,
  email,
}: {
  nome: string | null
  email: string
}) {
  const caminho = usePathname()
  const [aberto, setAberto] = useState(false)
  const comprimido = useSyncExternalStore(inscrever, lerPreferencia, () => false)
  const marca = getLockup('pt', 'horizontalBlack')

  function ativo(href: string, exato?: boolean) {
    if (exato) return caminho === href
    /* "Painel do governo" e "Categorias" moram dentro de "Transparência":
       sem o desempate, dois itens acenderiam ao mesmo tempo. */
    if (href === '/admin/documentos') {
      return (
        caminho.startsWith('/admin/documentos') &&
        !caminho.startsWith('/admin/documentos/categorias') &&
        !caminho.startsWith('/admin/documentos/painel')
      )
    }
    return caminho.startsWith(href)
  }

  return (
    <>
      {/* Barra superior — telas pequenas */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-(--border) bg-(--bg) px-5 py-3 lg:hidden">
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

      {/* `lg:sticky` + `lg:h-dvh`: o menu ocupa a altura da janela e fica
          parado enquanto a listagem ao lado rola. `lg:self-start` é o que
          permite grudar — sem isso o flex estica o item até o fim da página
          e não sobra folga para o `sticky` agir. */}
      <nav
        aria-label="Seções do painel"
        className={cn(
          'w-full shrink-0 flex-col justify-between gap-8 border-(--border) bg-(--bg) px-5 py-6 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:self-start lg:overflow-y-auto lg:border-r lg:transition-[width,padding] lg:duration-200',
          comprimido ? 'lg:w-20 lg:px-3' : 'lg:w-64',
          aberto ? 'flex border-b' : 'hidden',
        )}
      >
        <div className="flex flex-col gap-8">
          <div
            className={cn(
              'hidden items-center gap-2 lg:flex',
              comprimido ? 'flex-col' : 'justify-between',
            )}
          >
            {/* Comprimido, a marca horizontal não cabe: entra a versão
                iconográfica, que é arquivo oficial e não recorte. */}
            <Image
              src={comprimido ? symbolMark.black.src : marca.src}
              alt="AIDEP"
              width={comprimido ? symbolMark.black.width : marca.width}
              height={comprimido ? symbolMark.black.height : marca.height}
              className="h-8 w-auto"
            />

            <button
              type="button"
              onClick={() => gravarPreferencia(!comprimido)}
              aria-expanded={!comprimido}
              title={comprimido ? 'Expandir menu' : 'Comprimir menu'}
              className="flex size-9 shrink-0 items-center justify-center text-(--fg-subtle) transition-colors hover:bg-(--overlay) hover:text-(--fg)"
            >
              {comprimido ? (
                <PanelLeftOpen aria-hidden="true" className="size-5" />
              ) : (
                <PanelLeftClose aria-hidden="true" className="size-5" />
              )}
              <span className="sr-only">
                {comprimido ? 'Expandir menu' : 'Comprimir menu'}
              </span>
            </button>
          </div>

          <ul className="flex flex-col gap-1">
            {itens.map(({ href, rotulo, Icone, exato, recuado }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setAberto(false)}
                  aria-current={ativo(href, exato) ? 'page' : undefined}
                  /* Sem rótulo à vista, o nome da seção só sobra no tooltip. */
                  title={comprimido ? rotulo : undefined}
                  className={cn(
                    'flex min-h-11 items-center gap-3 px-3 text-small font-medium transition-colors duration-150',
                    recuado && 'ml-4',
                    /* A compressão só existe no menu lateral: no celular o
                       menu abre inteiro, com rótulo e recuo. */
                    comprimido && 'lg:ml-0 lg:justify-center lg:px-0',
                    ativo(href, exato)
                      ? 'bg-brand-100 text-brand-900'
                      : 'text-(--fg-muted) hover:bg-(--overlay) hover:text-(--fg)',
                  )}
                >
                  <Icone aria-hidden="true" className="size-4 shrink-0" />
                  {/* `sr-only` em vez de `hidden`: o rótulo some da tela mas
                      continua no acessível, para leitor de tela. */}
                  <span className={cn(comprimido && 'lg:sr-only')}>{rotulo}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div
          className={cn(
            'flex flex-col gap-4 border-t border-(--border) pt-5',
            comprimido && 'lg:items-center',
          )}
        >
          <a
            href="/pt"
            target="_blank"
            rel="noreferrer noopener"
            title={comprimido ? 'Ver o site' : undefined}
            className="inline-flex min-h-9 items-center gap-2 text-micro font-semibold uppercase tracking-[0.12em] text-(--fg-subtle) transition-colors hover:text-(--fg)"
          >
            <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
            <span className={cn(comprimido && 'lg:sr-only')}>Ver o site</span>
          </a>

          <div className={cn('flex flex-col gap-1', comprimido && 'lg:hidden')}>
            <p className="truncate text-small font-semibold">{nome ?? 'Equipe AIDEP'}</p>
            <p className="truncate text-micro text-(--fg-subtle)">{email}</p>
          </div>

          <form action={sair}>
            <button
              type="submit"
              title={comprimido ? 'Sair' : undefined}
              className="inline-flex min-h-10 items-center gap-2 text-micro font-semibold uppercase tracking-[0.12em] text-(--fg-muted) transition-colors hover:text-danger"
            >
              <LogOut aria-hidden="true" className="size-3.5 shrink-0" />
              <span className={cn(comprimido && 'lg:sr-only')}>Sair</span>
            </button>
          </form>
        </div>
      </nav>
    </>
  )
}
