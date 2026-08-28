import Image from 'next/image'
import { symbolMark } from '@/lib/brand'
import type { MediaAsset } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

type MediaFrameProps = {
  media: MediaAsset | null
  locale: Locale
  /** Proporção da moldura — reservada mesmo sem imagem, sem layout shift. */
  ratio?: string
  className?: string
  sizes?: string
  priority?: boolean
  /** Tom do painel institucional exibido enquanto não há fotografia. */
  tone?: 'light' | 'dark' | 'brand'
}

const panelTone = {
  light: 'bg-paper-3',
  dark: 'bg-ink-900',
  brand: 'bg-brand-800',
}

/**
 * Moldura de imagem do site.
 *
 * Com imagem cadastrada, entrega uma next/image responsiva, com `sizes`
 * correto, recorte por object-cover e proporção fixa — nunca deformada. A
 * imagem vem de `getMedia()`: a fotografia oficial da AIDEP quando já
 * houver, senão a fotografia de banco equivalente, sempre creditada.
 *
 * Sem nenhuma das duas, entrega um painel institucional construído com o
 * grafismo oficial da marca: o espaço fica reservado na proporção certa, o
 * layout não se move e nada é inventado.
 */
export function MediaFrame({
  media,
  locale,
  ratio = '4 / 3',
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 50vw',
  priority = false,
  tone = 'light',
}: MediaFrameProps) {
  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      style={{ aspectRatio: ratio }}
      data-media-pending={media ? undefined : 'true'}
    >
      {media ? (
        <Image
          src={media.src}
          alt={media.alt[locale]}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={media.position ? { objectPosition: media.position } : undefined}
        />
      ) : (
        <div
          aria-hidden="true"
          className={cn('absolute inset-0 overflow-hidden', panelTone[tone])}
        >
          {/* Grafismo oficial: o símbolo muito ampliado, sangrando pela borda —
              a mesma aplicação usada no papel timbrado da associação. */}
          <Image
            src={tone === 'light' ? symbolMark.black.src : symbolMark.white.src}
            alt=""
            width={symbolMark.black.width}
            height={symbolMark.black.height}
            sizes="(max-width: 768px) 180vw, 90vw"
            className={cn(
              'absolute -right-[42%] -top-[58%] h-[240%] w-auto max-w-none object-contain',
              tone === 'light' ? 'opacity-[0.055]' : 'opacity-[0.07]',
            )}
          />
          <span className="modulo absolute bottom-6 left-6" />
        </div>
      )}
    </div>
  )
}
