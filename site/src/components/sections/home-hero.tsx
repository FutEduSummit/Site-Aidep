'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { MagneticButton } from '@/components/motion/magnetic'
import { SplitTextReveal } from '@/components/motion/animated-text'
import { ButtonAnchor } from '@/components/ui/anchor-link'
import { ButtonLink } from '@/components/ui/button'
import {
  BannerCarousel,
  FOLGA_DO_VIDEO,
  PERMANENCIA_DA_FOTO,
  useBannerRotation,
} from '@/components/ui/banner-carousel'
import { Container, Section } from '@/components/ui/section'
import { carrosselDaHome } from '@/content/media'
import { symbolMark } from '@/lib/brand'
import { DURATION, EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.base, ease: EASE, delay },
})

/**
 * Quanto tempo o quadro `posicao` fica no ar, em milissegundos.
 *
 * A fotografia usa a permanência padrão do rodízio, curta; o vídeo pede o
 * tempo de uma tomada — uma só, mais a folga de partida. Não há piso nem
 * teto: cortar a tomada no meio para acompanhar o passo das fotografias
 * mostraria só o começo de cada filme, e repeti-la atrasaria o rodízio.
 */
function permanenciaDoQuadro(posicao: number): number {
  const video = carrosselDaHome[posicao]?.video
  if (!video) return PERMANENCIA_DA_FOTO

  return video.duration * 1000 + FOLGA_DO_VIDEO
}

/**
 * HERO DA PÁGINA INICIAL
 * ======================
 * As fotografias do acervo passam sangradas na seção inteira, com o título
 * por cima — a abertura é a imagem, não uma moldura ao lado do texto. O
 * álbum é `carrosselDaHome`, em `content/media.ts`, e o véu do carrossel
 * mantém o contraste do texto sobre qualquer foto do rodízio.
 *
 * A abertura ocupa a tela inteira: nada da seção seguinte aparece embaixo
 * dela na primeira dobra. A medida é `100svh` — a altura da janela com a
 * barra do navegador aberta —, e não `100vh`: em monitor as duas são a
 * mesma coisa, mas no celular `100vh` conta a área que a barra cobre e
 * empurraria o rodapé da abertura para fora da tela.
 *
 * A altura cheia é do bloco, não do texto: o miolo fica centrado e a
 * chamada de rolagem com os controles do carrossel fecham a seção na
 * base, na mesma linha — é o que segura a composição sem inflar o título.
 */
export function HomeHero() {
  const t = useTranslations('home.hero')
  const tActions = useTranslations('actions')
  const tA11y = useTranslations('a11y')
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  /* Movimento sutil da composição conforme o Hero sai de cena. */
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const grafismoY = useTransform(scrollYProgress, [0, 1], [0, 140])

  /* O quadro de vídeo fica no ar o tempo de uma tomada, e só uma. A
     fotografia mantém a permanência padrão do rodízio. */
  const { index, goTo } = useBannerRotation(
    carrosselDaHome.length,
    permanenciaDoQuadro,
  )
  const hasBanner = carrosselDaHome.length > 0
  const lines = t.raw('titleLines') as string[]
  const totalDeQuadros = carrosselDaHome.length

  /* As setas dão a volta no álbum: do último quadro a de avançar volta ao
     primeiro, e do primeiro a de voltar vai ao último. O rodízio já corre
     em laço sozinho — a navegação à mão não teria por que parar na ponta. */
  function passarQuadro(passo: -1 | 1) {
    goTo((index + passo + totalDeQuadros) % totalDeQuadros)
  }

  return (
    <Section
      surface="dark"
      space="none"
      className="flex min-h-[100svh] flex-col pb-10 pt-18 lg:pb-14 lg:pt-22"
      ariaLabel="AIDEP"
      overPhoto
    >
      <BannerCarousel media={carrosselDaHome} index={index} tone="dark" priority />

      <div ref={ref} className="flex flex-1 flex-col">
        {/* Sem fotografia de capa, o grafismo institucional abre a página no
            lugar dela — nunca os dois ao mesmo tempo. */}
        {hasBanner ? null : (
          <motion.div
            aria-hidden="true"
            data-motion="parallax"
            style={{ y: grafismoY }}
            className="pointer-events-none absolute -right-[22%] -top-[12%] -z-10 w-[92vw] max-w-[1100px] opacity-[0.07] lg:-right-[10%] lg:w-[58vw]"
          >
            <Image
              src={symbolMark.white.src}
              alt=""
              width={symbolMark.white.width}
              height={symbolMark.white.height}
              priority
              sizes="(max-width: 1024px) 92vw, 58vw"
              className="h-auto w-full"
            />
          </motion.div>
        )}

        <Container className="flex flex-1 flex-col justify-center py-8">
          <motion.div
            style={{ y: textY, opacity: textOpacity }}
            className="flex max-w-[52rem] flex-col"
          >
            <motion.p className="eyebrow mb-6" {...enter(0.15)}>
              {t('eyebrow')}
            </motion.p>

            {/* `text-hero` — um degrau acima do `text-h1` da primeira
                seção, sem chegar perto do `display`: a abertura é a
                fotografia, e o título por cima dela não pode tomar a
                dobra inteira. O piso é baixo o bastante para as três
                linhas caberem em tela pequena sem quebrar no meio. */}
            <SplitTextReveal
              as="h1"
              lines={lines}
              animateOnMount
              delay={0.25}
              className="text-hero font-extrabold tracking-[-0.045em]"
            />

            <motion.p
              className="mt-7 max-w-[46ch] text-lead text-(--fg-muted)"
              {...enter(0.55)}
            >
              {t('lead')}
            </motion.p>

            <motion.div
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
              {...enter(0.68)}
            >
              <MagneticButton>
                <ButtonAnchor href="#a-aidep" variant="accent" size="md">
                  {tActions('knowAidep')}
                </ButtonAnchor>
              </MagneticButton>
              <MagneticButton>
                <ButtonLink href="/donate" variant="outline" size="md">
                  {tActions('supportProjects')}
                </ButtonLink>
              </MagneticButton>
            </motion.div>
          </motion.div>
        </Container>

        <Container className="relative z-10 flex items-center justify-between gap-6">
          {/* Setas de navegação do rodízio. Passar à mão é o que dá
              controle sobre o carrossel: dois alvos de 44px, na mesma
              linha e no mesmo desenho dos controles da fileira de vídeos.

              Sem contador entre elas. O número dizia em quantos quadros o
              álbum tem e em qual deles se está, e a abertura não é um
              catálogo: quem chega aqui vê a fotografia, não o tamanho da
              pilha. Quem não vê a tela continua sabendo a posição — o
              aviso abaixo é lido a cada troca de quadro, e só por leitor
              de tela. */}
          {totalDeQuadros > 1 ? (
            <motion.div
              role="group"
              aria-label={tA11y('carouselLabel')}
              className="ml-auto flex items-center gap-2"
              {...enter(1.02)}
            >
              <p aria-live="polite" className="sr-only">
                {tA11y('carouselPosition', {
                  current: index + 1,
                  total: totalDeQuadros,
                })}
              </p>

              <SetaDoRodizio
                label={tA11y('carouselPrev')}
                onClick={() => passarQuadro(-1)}
              >
                <ArrowLeft aria-hidden="true" strokeWidth={2} className="size-4" />
              </SetaDoRodizio>

              <SetaDoRodizio
                label={tA11y('carouselNext')}
                onClick={() => passarQuadro(1)}
              >
                <ArrowRight aria-hidden="true" strokeWidth={2} className="size-4" />
              </SetaDoRodizio>
            </motion.div>
          ) : null}
        </Container>
      </div>
    </Section>
  )
}

/**
 * SETA DO RODÍZIO
 * ===============
 * O mesmo botão quadrado dos controles da fileira de vídeos, vestido para
 * ficar sobre fotografia: a moldura sai dos tokens da superfície escura e
 * um véu próprio garante que o quadrado se leia mesmo sobre um realce
 * estourado — o véu da faixa reforça a beirada de baixo, mas não é ele que
 * sustenta o contraste de um controle de 44px.
 */
function SetaDoRodizio({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex size-11 items-center justify-center border border-(--border-strong) bg-ink-950/25 text-(--fg)',
        'transition-colors duration-200 ease-brand',
        'hover:border-(--accent) hover:bg-(--accent) hover:text-(--accent-contrast)',
      )}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  )
}
