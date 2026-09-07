'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import type { VideoAsset } from '@/content/types'
import type { Locale } from '@/i18n/routing'

type VideoPlayerProps = {
  videos: VideoAsset[]
  /** Índice do vídeo aberto — `null` mantém a janela fechada. */
  index: number | null
  locale: Locale
  onClose: () => void
  onNavigate: (index: number) => void
}

const botao =
  'inline-flex size-11 items-center justify-center border border-(--border-strong) transition-colors duration-200 ease-brand hover:border-(--fg) hover:bg-(--overlay)'

/**
 * VÍDEO EM TELA CHEIA
 * ===================
 * Abre o vídeo por cima da página, com som e com os controles nativos do
 * navegador — que já trazem barra de progresso, volume, velocidade,
 * legenda e tela cheia prontos, e que o visitante já sabe usar.
 *
 * Usa `<dialog>` nativo pelo mesmo motivo da galeria de fotos: ele prende
 * o foco dentro da janela, devolve o foco ao cartão de origem ao fechar,
 * fecha no Esc e marca o resto da página como inerte.
 *
 * Duas regras que o vídeo impõe e a foto não:
 *
 * - **Um vídeo por vez.** Ao trocar de vídeo o anterior é pausado e
 *   descarregado; sem isso, dois áudios tocam juntos.
 * - **Som só aqui.** A fileira da Home toca sem som, de relance; é ao
 *   abrir — gesto explícito do visitante — que o áudio entra.
 *
 * O acervo é todo vertical: a moldura acompanha a proporção real do
 * arquivo, sem barras pretas laterais nem recorte.
 */
export function VideoPlayer({
  videos,
  index,
  locale,
  onClose,
  onNavigate,
}: VideoPlayerProps) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const t = useTranslations('videos')
  const tActions = useTranslations('actions')

  const aberta = index !== null
  const atual = aberta ? videos[index] : null

  useEffect(() => {
    const elemento = dialogo.current
    if (!elemento) return

    if (aberta && !elemento.open) elemento.showModal()
    if (!aberta && elemento.open) elemento.close()
  }, [aberta])

  /* A janela abriu (ou trocou de vídeo) a partir de um clique do
     visitante, então tocar já com som é permitido pelo navegador. Se
     ainda assim for bloqueado, o vídeo fica no primeiro quadro com os
     controles à mão — nunca em uma tela preta. */
  useEffect(() => {
    const elemento = video.current
    if (!elemento || !atual) return

    elemento.currentTime = 0
    const promessa = elemento.play()
    if (promessa) promessa.catch(() => {})

    return () => {
      elemento.pause()
    }
  }, [atual])

  /** Passo circular — `-1` volta, `+1` avança. */
  function passar(direcao: -1 | 1) {
    if (index === null || videos.length === 0) return
    onNavigate((index + direcao + videos.length) % videos.length)
  }

  return (
    <dialog
      ref={dialogo}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogo.current) onClose()
      }}
      onKeyDown={(event) => {
        /* As setas ficam com os controles do vídeo (elas avançam o tempo);
           a troca de vídeo é pelos botões. */
        if (event.key === 'Escape') onClose()
      }}
      aria-label={t('label')}
      className="m-auto w-[min(28rem,calc(100vw-1.5rem))] max-w-none bg-(--bg) p-0 text-(--fg) backdrop:bg-ink-950/85 backdrop:backdrop-blur-sm"
    >
      {atual && index !== null ? (
        /* `text-(--fg)` precisa estar aqui, e não no `<dialog>`: a janela é
           montada dentro da seção que a abriu — que é escura —, então na
           altura do `<dialog>` o token ainda vale branco. É só a partir
           deste `data-surface="light"` que ele vira tinta escura. */
        <div
          data-surface="light"
          className="flex max-h-[92svh] flex-col overflow-y-auto bg-(--bg) text-(--fg)"
        >
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-(--border) px-4 py-3">
            <p
              aria-live="polite"
              className="text-micro uppercase tracking-[0.14em] text-(--fg-subtle)"
            >
              {t('position', { current: index + 1, total: videos.length })}
            </p>

            <div className="flex items-center gap-2">
              {videos.length > 1 ? (
                <>
                  <button type="button" onClick={() => passar(-1)} className={botao}>
                    <ChevronLeft aria-hidden="true" className="size-4" />
                    <span className="sr-only">{t('previous')}</span>
                  </button>
                  <button type="button" onClick={() => passar(1)} className={botao}>
                    <ChevronRight aria-hidden="true" className="size-4" />
                    <span className="sr-only">{t('next')}</span>
                  </button>
                </>
              ) : null}

              <button type="button" onClick={onClose} className={botao}>
                <X aria-hidden="true" className="size-4" />
                <span className="sr-only">{tActions('close')}</span>
              </button>
            </div>
          </header>

          <video
            key={atual.src}
            ref={video}
            src={atual.src}
            poster={atual.poster}
            width={atual.width}
            height={atual.height}
            controls
            playsInline
            preload="metadata"
            aria-label={atual.description[locale]}
            className="h-auto max-h-[64svh] w-full shrink-0 bg-ink-950 object-contain"
          />

          <footer className="flex flex-col gap-2 border-t border-(--border) px-4 py-4">
            <p className="text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
              {atual.place}
            </p>
            <h2 className="text-h4 font-semibold tracking-[-0.02em]">
              {atual.title[locale]}
            </h2>
            <p className="max-w-[60ch] text-small text-(--fg-muted)">
              {atual.description[locale]}
            </p>
            {atual.spokenLocale && atual.spokenLocale !== locale ? (
              <p className="text-small text-(--fg-subtle)">
                {t('spokenIn', { language: t(`languages.${atual.spokenLocale}`) })}
              </p>
            ) : null}
          </footer>
        </div>
      ) : null}
    </dialog>
  )
}
