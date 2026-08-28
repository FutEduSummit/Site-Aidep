'use client'

import Image from 'next/image'
import type { ReactNode } from 'react'
import { MaskedWords } from '@/components/motion/animated-text'
import { MagneticButton } from '@/components/motion/magnetic'
import { Reveal } from '@/components/motion/reveal'
import { ButtonAnchor, isHashHref, type HashHref } from '@/components/ui/anchor-link'
import { ButtonLink } from '@/components/ui/button'
import { Container, Section, type Surface } from '@/components/ui/section'
import type { StaticPathname } from '@/i18n/routing'
import { symbolMark } from '@/lib/brand'

/** Destino de um botão: outra página do site ou uma seção desta página. */
type CtaTarget = { href: StaticPathname | HashHref; label: string }

type CtaBandProps = {
  eyebrow?: string
  title: string
  description?: string
  primary: CtaTarget
  secondary?: CtaTarget
  surface?: Surface
  id: string
  children?: ReactNode
}

/** Chamada institucional de fim de página, com o grafismo oficial ao fundo. */
export function CtaBand({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  surface = 'light',
  id,
  children,
}: CtaBandProps) {
  const symbol =
    surface === 'dark' ? symbolMark.white : symbolMark.black

  const primaryVariant = surface === 'brand' ? 'primary' : 'accent'

  return (
    <Section surface={surface} ariaLabelledby={`${id}-title`}>
      <Image
        src={symbol.src}
        alt=""
        aria-hidden="true"
        width={symbol.width}
        height={symbol.height}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="pointer-events-none absolute -right-[14%] -top-[30%] -z-10 h-[170%] w-auto max-w-none object-contain opacity-[0.06]"
      />

      <Container>
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            {eyebrow ? (
              <Reveal duration={0.5}>
                <p className="eyebrow mb-8">{eyebrow}</p>
              </Reveal>
            ) : null}

            <MaskedWords
              id={`${id}-title`}
              text={title}
              className="max-w-[18ch] text-h1 font-bold tracking-[-0.04em]"
            />

            {description ? (
              <Reveal delay={0.1} distance={24}>
                <p className="mt-8 max-w-[52ch] text-lead text-(--fg-muted)">
                  {description}
                </p>
              </Reveal>
            ) : null}

            {children}
          </div>

          <Reveal
            delay={0.16}
            distance={24}
            className="flex flex-col gap-4 sm:flex-row sm:flex-wrap lg:col-span-4 lg:col-start-9 lg:justify-end"
          >
            <MagneticButton>
              {isHashHref(primary.href) ? (
                <ButtonAnchor
                  href={primary.href}
                  variant={primaryVariant}
                  size="lg"
                >
                  {primary.label}
                </ButtonAnchor>
              ) : (
                <ButtonLink
                  href={primary.href}
                  variant={primaryVariant}
                  size="lg"
                >
                  {primary.label}
                </ButtonLink>
              )}
            </MagneticButton>

            {secondary ? (
              <MagneticButton>
                {isHashHref(secondary.href) ? (
                  <ButtonAnchor
                    href={secondary.href}
                    variant="outline"
                    size="lg"
                  >
                    {secondary.label}
                  </ButtonAnchor>
                ) : (
                  <ButtonLink href={secondary.href} variant="outline" size="lg">
                    {secondary.label}
                  </ButtonLink>
                )}
              </MagneticButton>
            ) : null}
          </Reveal>
        </div>
      </Container>
    </Section>
  )
}
