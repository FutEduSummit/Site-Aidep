import Image from 'next/image'
import { getMedia } from '@/content/media'
import { cn } from '@/lib/utils'

type SectionBannerProps = {
  /** Chave do registro de mídia — sem imagem, nada é renderizado. */
  mediaKey: string
  /**
   * Véu sobre a fotografia. Cada superfície tem o seu, calibrado para o
   * texto continuar legível sobre qualquer foto.
   */
  tone?: 'dark' | 'brand' | 'light'
  /** Intensidade do véu — `strong` para faixas com texto miúdo ou apoio lateral. */
  strength?: 'base' | 'strong'
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
 * O véu não é decoração: sem ele o contraste do texto depende da foto que
 * estiver no ar. Cada tom escurece (ou esverdeia) o suficiente para os
 * tokens semânticos da superfície continuarem válidos. Em `base` um degradê
 * reforça o lado onde o texto começa; em `strong` o véu é uniforme, para
 * segurar também o texto miúdo encostado na borda direita.
 *
 * Sem fotografia cadastrada — nem oficial nem de banco —, o componente não
 * renderiza nada: a seção volta ao fundo sólido da superfície, sem buraco
 * visual e sem deslocamento de layout.
 */
export function SectionBanner({
  mediaKey,
  tone = 'dark',
  strength = 'base',
  priority = false,
  className,
}: SectionBannerProps) {
  const media = getMedia(mediaKey)
  if (!media) return null

  const veil = {
    dark: {
      base: 'bg-ink-950/58',
      strong: 'bg-ink-950/88',
    },
    brand: {
      base: 'bg-brand-500/88',
      strong: 'bg-brand-500/93',
    },
    light: {
      base: 'bg-paper/80',
      strong: 'bg-paper/90',
    },
  }[tone][strength]

  /* No véu forte o escurecimento é uniforme: é o que segura texto miúdo em
     qualquer canto da faixa — números, legendas, apoios laterais. O degradê
     só entra no véu leve, onde a fotografia ainda aparece cheia. */
  const gradient =
    strength === 'strong'
      ? null
      : {
          dark: 'bg-linear-to-r from-ink-950/85 via-ink-950/45 to-transparent',
          brand: 'bg-linear-to-r from-brand-600/60 via-brand-500/25 to-transparent',
          light: 'bg-linear-to-r from-paper/90 via-paper/60 to-transparent',
        }[tone]

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
      <div className={cn('absolute inset-0', veil)} />
      {gradient ? <div className={cn('absolute inset-0', gradient)} /> : null}
    </div>
  )
}
