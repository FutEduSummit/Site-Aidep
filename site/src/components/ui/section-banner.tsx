import Image from 'next/image'
import { getMedia } from '@/content/media'
import type { MediaAsset } from '@/content/types'
import {
  bannerLayers,
  type BannerStrength,
  type BannerTone,
} from '@/lib/banner-veil'
import { cn } from '@/lib/utils'

type SectionBannerProps = {
  /** Chave do registro de mídia — sem imagem, nada é renderizado. */
  mediaKey?: string
  /**
   * Fotografia já resolvida — a capa enviada pelo painel, por exemplo.
   * Tem precedência sobre `mediaKey`.
   */
  media?: MediaAsset | null
  /**
   * Véu sobre a fotografia. Cada superfície tem o seu, calibrado para o
   * texto continuar legível sobre qualquer foto.
   */
  tone?: BannerTone
  /**
   * Como o véu é moldado: `base` para texto numa coluna à esquerda,
   * `strong` para texto nas duas pontas da faixa. Ver `lib/banner-veil.ts`.
   */
  strength?: BannerStrength
  priority?: boolean
  className?: string
}

/**
 * FAIXA DE IMAGEM DE FUNDO
 * ========================
 * Fotografia sangrada em toda a largura de uma `Section`, atrás do
 * conteúdo. Fica sempre em `-z-10`, dentro do `isolate` da própria seção,
 * e nunca captura ponteiro.
 *
 * As camadas do véu vêm de `lib/banner-veil.ts`, compartilhadas com o
 * carrossel do Hero: sem elas o contraste do texto dependeria da foto que
 * estivesse no ar.
 *
 * Sem fotografia cadastrada — nem oficial nem de banco —, o componente não
 * renderiza nada: a seção volta ao fundo sólido da superfície, sem buraco
 * visual e sem deslocamento de layout.
 */
export function SectionBanner({
  mediaKey,
  media: mediaDireta,
  tone = 'dark',
  strength = 'base',
  priority = false,
  className,
}: SectionBannerProps) {
  const media = mediaDireta ?? (mediaKey ? getMedia(mediaKey) : null)
  if (!media) return null

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
    >
      <Image
        src={media.src}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
        style={media.position ? { objectPosition: media.position } : undefined}
      />
      {bannerLayers(tone, strength).map((camada) => (
        <div key={camada} className={cn('absolute inset-0', camada)} />
      ))}
    </div>
  )
}
