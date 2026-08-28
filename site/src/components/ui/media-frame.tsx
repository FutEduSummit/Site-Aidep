import Image from 'next/image'
import { symbolMark } from '@/lib/brand'
import { getPreviewMedia } from '@/content/media-preview'
import type { MediaAsset } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { previewImagesEnabled } from '@/lib/preview'
import { cn } from '@/lib/utils'

type MediaFrameProps = {
  media: MediaAsset | null
  locale: Locale
  /**
   * Chave do registro de mídia. Serve à pré-visualização: sem fotografia
   * cadastrada, é por ela que a moldura encontra a imagem de mockup.
   */
  mediaKey?: string
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
 * Com fotografia cadastrada, entrega uma next/image responsiva, com
 * `sizes` correto, recorte por object-cover e proporção fixa — nunca
 * deformada.
 *
 * Sem fotografia, entrega um painel institucional construído com o
 * grafismo oficial da marca: o espaço fica reservado na proporção certa,
 * o layout não se move e nada é inventado. Basta cadastrar a imagem em
 * `content/media.ts` para o painel dar lugar à foto.
 *
 * Em builds de pré-visualização (ver `lib/preview.ts`), o painel carrega
 * junto uma imagem de mockup gerada por IA, escondida por padrão. O
 * interruptor no canto da tela alterna entre os dois — é só para ver o
 * site preenchido; a fotografia real, quando cadastrada, vale sempre.
 */
export function MediaFrame({
  media,
  locale,
  mediaKey,
  ratio = '4 / 3',
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 50vw',
  priority = false,
  tone = 'light',
}: MediaFrameProps) {
  const preview =
    !media && previewImagesEnabled && mediaKey ? getPreviewMedia(mediaKey) : null

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
        <>
          <div
            aria-hidden="true"
            data-preview-panel={preview ? 'true' : undefined}
            className={cn(
              'absolute inset-0 overflow-hidden',
              panelTone[tone],
            )}
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

          {preview ? (
            <Image
              data-preview-layer="true"
              src={preview.src}
              alt={preview.alt[locale]}
              fill
              sizes={sizes}
              className="object-cover"
            />
          ) : null}
        </>
      )}
    </div>
  )
}
