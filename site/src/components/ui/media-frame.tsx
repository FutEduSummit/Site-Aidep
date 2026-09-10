import Image from 'next/image'
import { symbolMark } from '@/lib/brand'
import type { MediaAsset } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { QUALIDADE_DA_IMAGEM } from '@/lib/image-quality'
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
 * QUANTA LARGURA A FOTOGRAFIA PRECISA — NÃO QUANTA A MOLDURA MEDE
 * ==============================================================
 * `sizes` diz ao `next/image` que largura de arquivo pedir, e a conta
 * natural é a largura da moldura. Ela está errada sempre que o
 * `object-cover` recorta pelos lados: numa moldura em pé (5/6) com uma
 * fotografia deitada (3/2), o recorte joga fora 45% da largura do arquivo,
 * e o que sobra é esticado para encher a moldura.
 *
 * Era o caso da faixa do esporte na Página inicial — a foto do professor
 * com o menino no colo. Medido: moldura de 1325×1590 px de tela recebendo
 * uma entrega de 1440×956, ou seja, **1,66× de esticada**. É o tipo de
 * imagem macia que nenhuma qualidade de compressão conserta, porque o pixel
 * não foi pedido.
 *
 * O fator é `proporção da foto ÷ proporção da moldura`, e só vale quando a
 * foto é mais deitada que a moldura. No caso contrário — foto em pé em
 * moldura deitada — o recorte tira altura, a largura já basta, e o fator é
 * 1. Nada muda para as dezenas de molduras em que foto e moldura combinam.
 *
 * Pedir mais não desperdiça: o otimizador redimensiona com
 * `withoutEnlargement`, então pedir 2560 de um arquivo de 2048 devolve
 * 2048 — e nunca um 2048 inflado.
 */
function fatorDoRecorte(media: MediaAsset, ratio: string): number {
  const [largura, altura] = ratio.split('/').map((parte) => Number(parte.trim()))
  const daMoldura = largura / altura
  const daFoto = media.width / media.height

  if (!Number.isFinite(daMoldura) || !Number.isFinite(daFoto) || daMoldura <= 0) {
    return 1
  }

  return Math.max(1, daFoto / daMoldura)
}

/**
 * Aplica o fator a cada medida em `vw` do `sizes`, com teto em 100vw — a
 * largura da janela é o máximo que existe. Medida em `px` ou `rem` passa
 * intacta: nenhuma moldura do site usa, e reescrever às cegas seria pior
 * que não mexer.
 */
function sizesDoRecorte(sizes: string, fator: number): string {
  if (fator <= 1.02) return sizes

  return sizes.replace(/(\d+(?:\.\d+)?)vw/g, (_, medida: string) => {
    return `${Math.min(100, Math.round(Number(medida) * fator))}vw`
  })
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
          sizes={sizesDoRecorte(sizes, fatorDoRecorte(media, ratio))}
          priority={priority}
          quality={QUALIDADE_DA_IMAGEM}
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
