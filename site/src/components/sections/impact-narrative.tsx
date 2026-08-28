'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { MaskedWords } from '@/components/motion/animated-text'
import { Reveal } from '@/components/motion/reveal'
import { Container, Section } from '@/components/ui/section'
import { useIsDesktop, useReducedMotionSafe } from '@/hooks/use-media'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type Step = {
  title: string
  text: string
  metric: string
  metricLabel: string
}

/**
 * Narrativa de impacto.
 *
 * Única sequência do site construída com GSAP + ScrollTrigger: as três
 * escalas de atuação se sucedem enquanto a composição permanece parada.
 * O travamento é feito por `position: sticky` (CSS) e o GSAP cuida apenas
 * do encadeamento vinculado ao progresso do scroll — sem pin-spacer, sem
 * scroll hijacking e com limpeza automática pelo useGSAP.
 *
 * No mobile e com movimento reduzido, vira uma lista vertical simples.
 */
export function ImpactNarrative() {
  const t = useTranslations('impact.narrative')
  const steps = t.raw('steps') as Step[]

  const container = useRef<HTMLDivElement>(null)
  const isDesktop = useIsDesktop()
  const reduced = useReducedMotionSafe()
  const enabled = isDesktop && !reduced

  useGSAP(
    () => {
      if (!enabled) return

      const panels = gsap.utils.toArray<HTMLElement>('[data-step]')
      const bar = container.current?.querySelector<HTMLElement>('[data-progress]')
      if (panels.length === 0) return

      gsap.set(panels, { autoAlpha: 0, yPercent: 6 })
      gsap.set(panels[0], { autoAlpha: 1, yPercent: 0 })

      const timeline = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: container.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })

      panels.forEach((panel, index) => {
        if (index === 0) return
        timeline
          .to(panels[index - 1], { autoAlpha: 0, yPercent: -6, duration: 0.4 })
          .to(panel, { autoAlpha: 1, yPercent: 0, duration: 0.4 }, '<0.15')
      })

      if (bar) {
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: container.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
            },
          },
        )
      }
    },
    { scope: container, dependencies: [enabled], revertOnUpdate: true },
  )

  return (
    <Section surface="dark" space="none" ariaLabelledby="impact-narrative-title">
      <Container className="pt-section">
        <Reveal duration={0.5}>
          <p className="eyebrow mb-8">{t('eyebrow')}</p>
        </Reveal>
        <MaskedWords
          id="impact-narrative-title"
          text={t('title')}
          className="max-w-[16ch] text-h1 font-bold tracking-[-0.04em]"
        />
      </Container>

      {/* Versão desktop: composição sticky com encadeamento por scroll. */}
      <div
        ref={container}
        className="relative mt-16 hidden lg:block"
        style={{ height: enabled ? `${steps.length * 90}vh` : undefined }}
      >
        <div className="sticky top-0 flex h-screen items-center">
          <Container className="w-full">
            <div
              data-progress
              aria-hidden="true"
              className="mb-16 h-px w-full origin-left bg-(--accent)"
            />

            <div className="relative min-h-[22rem]">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  data-step
                  className="absolute inset-0 grid grid-cols-12 items-start gap-8"
                >
                  <div className="col-span-5">
                    <p className="mb-6 text-micro font-semibold uppercase tracking-[0.18em] text-(--accent)">
                      {String(index + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
                    </p>
                    <h3 className="text-display font-extrabold tracking-[-0.045em]">
                      {step.title}
                    </h3>
                  </div>

                  <div className="col-span-4 col-start-7">
                    <p className="max-w-[44ch] text-lead text-(--fg-muted)">
                      {step.text}
                    </p>
                  </div>

                  <div className="col-span-2 col-start-11 text-right">
                    <p className="text-h1 font-extrabold tracking-[-0.045em] text-(--accent)">
                      {step.metric}
                    </p>
                    <p className="mt-2 text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
                      {step.metricLabel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </div>
      </div>

      {/* Mobile e movimento reduzido: lista vertical, sem travamento. */}
      <Container className="mt-14 flex flex-col pb-section lg:hidden">
        {steps.map((step, index) => (
          <Reveal
            key={step.title}
            as="div"
            delay={index * 0.06}
            className="flex flex-col gap-4 border-t border-(--border) py-8"
          >
            <p className="text-micro font-semibold uppercase tracking-[0.18em] text-(--accent)">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h3 className="text-h2 font-bold tracking-[-0.04em]">{step.title}</h3>
            <p className="max-w-[52ch] text-body text-(--fg-muted)">{step.text}</p>
            <p className="mt-2 flex items-baseline gap-3">
              <span className="text-h2 font-extrabold tracking-[-0.045em] text-(--accent)">
                {step.metric}
              </span>
              <span className="text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
                {step.metricLabel}
              </span>
            </p>
          </Reveal>
        ))}
      </Container>

      <div className="hidden pb-section lg:block" />
    </Section>
  )
}
