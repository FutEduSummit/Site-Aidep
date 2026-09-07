'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import type { MediaAsset } from '@/content/types'
import type { Locale } from '@/i18n/routing'

type PhotoLightboxProps = {
  photos: MediaAsset[]
  /** Índice da foto aberta — `null` mantém a janela fechada. */
  index: number | null
  locale: Locale
  onClose: () => void
  onNavigate: (index: number) => void
}

const botao =
  'inline-flex size-11 items-center justify-center border border-(--border-strong) transition-colors duration-200 ease-brand hover:border-(--fg) hover:bg-(--overlay)'

/**
 * FOTO EM TELA CHEIA
 * ==================
 * Abre a foto da galeria por cima da página, com o passo para a anterior e
 * a seguinte. A volta é circular: da última se vai para a primeira, e é
 * por isso que não existe botão desabilitado no meio da navegação.
 *
 * Usa o `<dialog>` nativo pelo mesmo motivo do visualizador de documentos:
 * ele já prende o foco dentro da janela, devolve o foco ao botão de origem
 * ao fechar, fecha no Esc e marca o resto da página como inerte. As setas
 * do teclado são o único acréscimo.
 *
 * A foto entra com `object-contain` sobre fundo escuro: retrato e paisagem
 * convivem na mesma janela sem recorte e sem a moldura pular de tamanho a
 * cada troca.
 */
export function PhotoLightbox({
  photos,
  index,
  locale,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const t = useTranslations('projects')
  const tActions = useTranslations('actions')

  const aberta = index !== null
  const foto = aberta ? photos[index] : null

  useEffect(() => {
    const elemento = dialogo.current
    if (!elemento) return

    if (aberta && !elemento.open) elemento.showModal()
    if (!aberta && elemento.open) elemento.close()
  }, [aberta])

  /** Passo circular — `-1` volta, `+1` avança. */
  function passar(direcao: -1 | 1) {
    if (index === null || photos.length === 0) return
    onNavigate((index + direcao + photos.length) % photos.length)
  }

  return (
    <dialog
      ref={dialogo}
      onClose={onClose}
      onClick={(event) => {
        /* O alvo só é o próprio <dialog> quando o clique cai no fundo. */
        if (event.target === dialogo.current) onClose()
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          passar(-1)
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          passar(1)
        }
      }}
      aria-label={t('labels.gallery')}
      className="m-auto w-[min(84rem,calc(100vw-1.5rem))] max-w-none bg-(--bg) p-0 text-(--fg) backdrop:bg-ink-950/80 backdrop:backdrop-blur-sm"
    >
      {/* `text-(--fg)` fica no bloco de dentro, e não no `<dialog>`: a janela
          é montada dentro da seção que a abriu, e o token só vira tinta
          escura a partir do `data-surface="light"`. Sem isso, a galeria numa
          seção escura abriria com o texto branco sobre branco. */}
      {foto && index !== null ? (
        <div
          data-surface="light"
          className="flex h-[min(90vh,64rem)] flex-col bg-(--bg) text-(--fg)"
        >
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-(--border) px-4 py-3 sm:px-6">
            <p
              aria-live="polite"
              className="text-micro uppercase tracking-[0.14em] text-(--fg-subtle)"
            >
              {t('gallery.position', {
                current: index + 1,
                total: photos.length,
              })}
            </p>

            <div className="flex items-center gap-2">
              {photos.length > 1 ? (
                <>
                  <button type="button" onClick={() => passar(-1)} className={botao}>
                    <ChevronLeft aria-hidden="true" className="size-4" />
                    <span className="sr-only">{t('gallery.previous')}</span>
                  </button>
                  <button type="button" onClick={() => passar(1)} className={botao}>
                    <ChevronRight aria-hidden="true" className="size-4" />
                    <span className="sr-only">{t('gallery.next')}</span>
                  </button>
                </>
              ) : null}

              <button type="button" onClick={onClose} className={botao}>
                <X aria-hidden="true" className="size-4" />
                <span className="sr-only">{tActions('close')}</span>
              </button>
            </div>
          </header>

          <div className="relative min-h-0 flex-1 bg-ink-950">
            <Image
              key={foto.src}
              src={foto.src}
              alt={foto.alt[locale]}
              fill
              sizes="(max-width: 1024px) 100vw, 84rem"
              loading="eager"
              className="object-contain"
            />
          </div>

          {foto.alt[locale] || foto.credit ? (
            <footer className="flex shrink-0 flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-(--border) px-4 py-4 sm:px-6">
              <p className="max-w-[70ch] text-small text-(--fg-muted)">
                {foto.alt[locale]}
              </p>
              {foto.credit ? (
                <p className="text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
                  {foto.credit}
                </p>
              ) : null}
            </footer>
          ) : null}
        </div>
      ) : null}
    </dialog>
  )
}
