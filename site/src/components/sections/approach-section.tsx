'use client'

import {
  FileCheck,
  GraduationCap,
  Handshake,
  MapPin,
  School,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { MaskedWords } from '@/components/motion/animated-text'
import { GrowLine } from '@/components/motion/grow-line'
import { Reveal } from '@/components/motion/reveal'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { Container, Section, type Surface } from '@/components/ui/section'

type ApproachItem = { title: string; text: string }

/**
 * Um ícone por frente de atuação, na ordem de `approach.items` em
 * `messages/*.json`.
 *
 * Ali estava uma numeração — 01, 02, 03… — e ela dizia menos do que
 * parecia: estas não são etapas de um processo, e nada acontece em ordem.
 * O polo na comunidade e a prestação de contas correm ao mesmo tempo. O
 * ícone nomeia cada frente sem sugerir uma fila que não existe.
 *
 * A lista mora aqui, e não no arquivo de tradução, porque ícone não se
 * traduz — e porque o tradutor que acrescentasse um item sem ícone
 * quebraria a seção. Item sem par na lista abaixo cai no primeiro, que é
 * o genérico do território.
 */
const ICONES: LucideIcon[] = [
  MapPin, //          polos esportivos na comunidade
  School, //          esporte dentro da escola
  GraduationCap, //   formação e conhecimento
  Handshake, //       rede institucional
  FileCheck, //       prestação de contas
]

export function ApproachSection({
  surface = 'dark',
  id = 'approach',
}: {
  surface?: Surface
  id?: string
}) {
  const t = useTranslations('home.approach')
  const tItems = useTranslations('approach')
  const items = tItems.raw('items') as ApproachItem[]

  return (
    <Section surface={surface} ariaLabelledby={`${id}-title`}>
      <Container className="flex flex-col gap-stack">
        <GrowLine />

        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8">
          <div className="lg:sticky lg:top-32 lg:col-span-4">
            <Reveal duration={0.5}>
              <p className="eyebrow mb-8">{t('eyebrow')}</p>
            </Reveal>
            <MaskedWords
              id={`${id}-title`}
              text={t('title')}
              className="max-w-[16ch] text-h1 font-bold tracking-[-0.04em]"
            />
            <Reveal delay={0.12} distance={24}>
              <p className="mt-8 max-w-[44ch] text-lead text-(--fg-muted)">
                {t('description')}
              </p>
            </Reveal>
          </div>

          {/* `ul`, e não `ol`: sem a numeração, a ordem deixou de ter
              significado — as frentes acontecem ao mesmo tempo. */}
          <StaggerContainer
            as="ul"
            className="flex flex-col lg:col-span-7 lg:col-start-6"
          >
            {items.map((item, index) => {
              const Icone = ICONES[index] ?? ICONES[0]

              return (
                <StaggerItem
                  key={item.title}
                  as="li"
                  className="group/frente grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 border-t border-(--border) py-7 last:border-b sm:gap-x-8"
                >
                  {/* O quadrado do ícone é o mesmo módulo inclinado da
                      marca, reto: mesma medida para os cinco, para a
                      coluna de texto ficar alinhada de cima a baixo. */}
                  <span
                    aria-hidden="true"
                    className="flex size-11 shrink-0 items-center justify-center border border-(--border-strong) text-(--accent) transition-colors duration-300 ease-brand group-hover/frente:border-(--accent) group-hover/frente:bg-(--accent) group-hover/frente:text-(--accent-contrast)"
                  >
                    <Icone strokeWidth={1.6} className="size-5" />
                  </span>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-h3 font-bold tracking-[-0.03em]">
                      {item.title}
                    </h3>
                    <p className="max-w-[52ch] text-body text-(--fg-muted)">
                      {item.text}
                    </p>
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        </div>
      </Container>
    </Section>
  )
}
