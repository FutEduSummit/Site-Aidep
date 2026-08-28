'use client'

import type { ReactNode } from 'react'
import { MaskedWords } from '@/components/motion/animated-text'
import { GrowLine } from '@/components/motion/grow-line'
import { ParallaxImage } from '@/components/motion/parallax'
import { Reveal } from '@/components/motion/reveal'
import { MediaFrame } from '@/components/ui/media-frame'
import { Container, Section, type Surface } from '@/components/ui/section'
import { getMedia } from '@/content/media'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

type ContentBlockProps = {
  id: string
  eyebrow?: string
  title: string
  paragraphs?: string[]
  surface?: Surface
  locale: Locale
  /** Chave do registro de mídia; ausente, o bloco fica só com o texto. */
  mediaKey?: string
  mediaRatio?: string
  /** Lado da imagem no desktop. */
  mediaSide?: 'left' | 'right'
  rule?: boolean
  children?: ReactNode
  aside?: ReactNode
  className?: string
}

/** Bloco editorial de texto com imagem opcional — usado nas páginas internas. */
export function ContentBlock({
  id,
  eyebrow,
  title,
  paragraphs = [],
  surface = 'light',
  locale,
  mediaKey,
  mediaRatio = '4 / 5',
  mediaSide = 'right',
  rule = true,
  children,
  aside,
  className,
}: ContentBlockProps) {
  const media = mediaKey ? getMedia(mediaKey) : null
  const hasMedia = Boolean(mediaKey)

  const text = (
    <div
      className={cn(
        hasMedia
          ? mediaSide === 'right'
            ? 'lg:col-span-6'
            : 'lg:col-span-6 lg:col-start-7'
          : 'lg:col-span-7',
      )}
    >
      {eyebrow ? (
        <Reveal duration={0.5}>
          <p className="eyebrow mb-8">{eyebrow}</p>
        </Reveal>
      ) : null}

      <MaskedWords
        id={`${id}-title`}
        text={title}
        className="max-w-[20ch] text-h1 font-bold tracking-[-0.04em]"
      />

      {paragraphs.length > 0 ? (
        <div className="mt-10 flex max-w-[58ch] flex-col gap-6">
          {paragraphs.map((paragraph, index) => (
            <Reveal key={index} delay={0.08 * index} distance={24}>
              <p className="text-lead text-(--fg-muted)">{paragraph}</p>
            </Reveal>
          ))}
        </div>
      ) : null}

      {children ? <div className="mt-10">{children}</div> : null}
    </div>
  )

  return (
    <Section
      surface={surface}
      ariaLabelledby={`${id}-title`}
      className={className}
    >
      <Container className="flex flex-col gap-stack">
        {rule ? <GrowLine /> : null}

        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8">
          {hasMedia && mediaSide === 'left' ? (
            <div className="lg:col-span-5 lg:row-start-1">
              <ParallaxImage distance={56}>
                <MediaFrame
                  media={media}
                  mediaKey={mediaKey}
                  locale={locale}
                  ratio={mediaRatio}
                  tone={surface === 'dark' ? 'dark' : 'light'}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </ParallaxImage>
            </div>
          ) : null}

          {text}

          {hasMedia && mediaSide === 'right' ? (
            <div className="lg:col-span-5 lg:col-start-8">
              <ParallaxImage distance={56}>
                <MediaFrame
                  media={media}
                  mediaKey={mediaKey}
                  locale={locale}
                  ratio={mediaRatio}
                  tone={surface === 'dark' ? 'dark' : 'light'}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </ParallaxImage>
            </div>
          ) : null}

          {aside && !hasMedia ? (
            <div className="lg:col-span-4 lg:col-start-9">{aside}</div>
          ) : null}
        </div>
      </Container>
    </Section>
  )
}
