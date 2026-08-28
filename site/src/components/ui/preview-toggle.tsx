'use client'

import { ImageOff, Images } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import {
  PREVIEW_ATTRIBUTE,
  PREVIEW_STORAGE_KEY,
  previewImagesEnabled,
} from '@/lib/preview'

/* O estado real mora no atributo do <html> — aplicado antes da primeira
   pintura pelo script inline do layout, e lido daqui como fonte externa.
   Assim não há piscada na carga nem divergência de hidratação. */

function subscribe(notify: () => void) {
  const observer = new MutationObserver(notify)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [PREVIEW_ATTRIBUTE],
  })
  return () => observer.disconnect()
}

function readAttribute() {
  return document.documentElement.getAttribute(PREVIEW_ATTRIBUTE) === 'on'
}

/**
 * INTERRUPTOR DE PRÉ-VISUALIZAÇÃO — ferramenta de trabalho.
 *
 * Alterna todas as molduras do site entre o painel institucional
 * (o estado real, enquanto não há fotografia entregue) e as imagens de
 * exemplo geradas por IA, para avaliar o layout preenchido.
 *
 * Só é renderizado quando `previewImagesEnabled` — em `next dev` sempre, e
 * em produção apenas com `NEXT_PUBLIC_PREVIEW_IMAGES=1`. Os textos ficam
 * aqui, e não em `messages/`, justamente porque isto não é conteúdo do
 * site: é andaime, e sai junto com a variável.
 */
export function PreviewToggle() {
  const on = useSyncExternalStore(subscribe, readAttribute, () => false)

  if (!previewImagesEnabled) return null

  function toggle() {
    const next = on ? 'off' : 'on'
    document.documentElement.setAttribute(PREVIEW_ATTRIBUTE, next)
    try {
      localStorage.setItem(PREVIEW_STORAGE_KEY, next)
    } catch {
      /* modo privado, armazenamento bloqueado — o estado vale só nesta sessão */
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] print:hidden">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Pré-visualizar as molduras com imagens de exemplo geradas por IA"
        onClick={toggle}
        className="pointer-events-auto flex min-h-11 items-center gap-3 rounded-full border border-white/15 bg-ink-950/90 py-2 pl-3 pr-4 text-left text-white shadow-lg backdrop-blur-sm transition-colors duration-200 hover:border-white/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
      >
        {on ? (
          <Images aria-hidden="true" className="size-4 shrink-0 text-brand-400" />
        ) : (
          <ImageOff aria-hidden="true" className="size-4 shrink-0 text-white/50" />
        )}

        <span className="flex flex-col leading-tight">
          <span className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-white/45">
            Prévia
          </span>
          <span className="text-[0.75rem] font-medium tracking-tight">
            {on ? 'Imagens de exemplo' : 'Sem imagem'}
          </span>
        </span>

        <span
          aria-hidden="true"
          className={`ml-1 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${
            on ? 'bg-brand-500' : 'bg-white/20'
          }`}
        >
          <span
            className={`size-4 rounded-full bg-white transition-transform duration-200 ease-brand ${
              on ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </span>
      </button>
    </div>
  )
}
