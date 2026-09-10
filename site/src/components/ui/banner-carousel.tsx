'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { MediaAsset } from '@/content/types'
import { useReducedMotionSafe } from '@/hooks/use-media'
import {
  bannerLayers,
  type BannerStrength,
  type BannerTone,
} from '@/lib/banner-veil'
import { QUALIDADE_DA_IMAGEM } from '@/lib/image-quality'
import { cn } from '@/lib/utils'

/** Tempo que cada fotografia fica no ar, em milissegundos. */
export const PERMANENCIA_DA_FOTO = 2500

/**
 * Folga somada à duração da tomada no quadro de vídeo.
 *
 * O `<video>` não começa a tocar no instante em que é montado — ele ainda
 * decodifica o primeiro quadro e entra por fade. Sem esta folga o rodízio
 * viraria em cima dos últimos quadros do filme, e a tomada nunca chegaria
 * a terminar de passar.
 */
export const FOLGA_DO_VIDEO = 500

/**
 * RODÍZIO DAS FOTOGRAFIAS
 * =======================
 * O índice mora aqui, e não dentro do carrossel, porque quem desenha os
 * controles é a seção — o Hero alinha as setas e o contador no rodapé da
 * abertura. O componente de fundo é só a pintura.
 *
 * A troca é agendada quadro a quadro com `setTimeout`, não com um intervalo
 * contínuo: assim uma escolha manual reinicia a contagem em vez de trocar a
 * foto logo depois do clique.
 *
 * O rodízio para quando o sistema pede menos movimento e quando a aba sai
 * de vista — nesses casos a fotografia continua no ar, parada, e os
 * indicadores seguem funcionando para quem quiser passar à mão.
 */
export function useBannerRotation(
  total: number,
  /**
   * Milissegundos que cada quadro fica no ar. Um número vale para todos;
   * uma função recebe o índice e responde por quadro — é como a abertura
   * dá ao quadro de vídeo o tempo da tomada inteira, em vez de cortá-la
   * no meio.
   */
  interval: number | ((index: number) => number) = PERMANENCIA_DA_FOTO,
) {
  const semMovimento = useReducedMotionSafe()
  const [index, setIndex] = useState(0)
  const [emSegundoPlano, setEmSegundoPlano] = useState(false)

  useEffect(() => {
    function aoTrocarDeAba() {
      setEmSegundoPlano(document.hidden)
    }
    aoTrocarDeAba()
    document.addEventListener('visibilitychange', aoTrocarDeAba)
    return () => document.removeEventListener('visibilitychange', aoTrocarDeAba)
  }, [])

  const parado = semMovimento || emSegundoPlano || total < 2

  const permanencia =
    typeof interval === 'function' ? interval(index % Math.max(total, 1)) : interval

  useEffect(() => {
    if (parado) return
    const timer = window.setTimeout(() => {
      setIndex((atual) => (atual + 1) % total)
    }, permanencia)
    return () => window.clearTimeout(timer)
  }, [index, permanencia, parado, total])

  /* Índice fora da faixa — a lista de fotos encurtou entre renderizações. */
  const atual = total > 0 ? index % total : 0

  return { index: atual, goTo: setIndex, parado }
}

type BannerCarouselProps = {
  /** Álbum da faixa. Com uma foto só, funciona como faixa fixa. */
  media: MediaAsset[]
  /** Quadro no ar — vem de `useBannerRotation`. */
  index: number
  tone?: BannerTone
  strength?: BannerStrength
  /** Carrega a primeira fotografia com prioridade — só na abertura da página. */
  priority?: boolean
  className?: string
}

/**
 * CARROSSEL DE FUNDO
 * ==================
 * As fotografias do acervo passam sangradas atrás do conteúdo de uma
 * `Section`, em travessia cruzada: a que entra cresce de volta ao tamanho
 * cheio enquanto a que sai se afasta. Fica sempre em `-z-10`, dentro do
 * `isolate` da seção, e nunca captura ponteiro — o texto e os botões por
 * cima continuam clicáveis.
 *
 * Só o quadro no ar e o seguinte ficam montados — e o segundo espera a
 * abertura terminar de carregar. A travessia precisa da próxima imagem já
 * decodificada (senão a foto pisca ao entrar), mas baixar o álbum inteiro
 * na abertura da página, não: como todos os quadros ficam dentro da
 * janela, o `loading="lazy"` do `next/image` não seguraria nada. Quem
 * segura é a montagem.
 *
 * As camadas do véu são as mesmas da faixa de foto única — vêm de
 * `lib/banner-veil.ts` —, e é o que mantém o texto legível sobre qualquer
 * fotografia do rodízio, inclusive a mais clara do álbum.
 */
export function BannerCarousel({
  media,
  index,
  tone = 'dark',
  strength = 'base',
  priority = false,
  className,
}: BannerCarouselProps) {
  const total = media.length
  const semMovimento = useReducedMotionSafe()

  /* A fotografia da abertura é o maior download da página: enquanto ela
     não termina, nenhum outro quadro entra no DOM para dividir banda com
     ela. Depois, o tempo de permanência de cada foto é folga de sobra
     para a seguinte chegar antes da travessia.

     `index > 0` é a rede de segurança: se a primeira imagem falhar e o
     `onLoad` nunca vier, o rodízio ainda monta os quadros seguintes em vez
     de esvaziar a faixa. */
  const [aberturaPronta, setAberturaPronta] = useState(false)
  const [montados, setMontados] = useState(1)

  /* Ajuste durante a renderização, sem efeito. Só cresce — a foto já
     baixada não sai do ar quando o rodízio volta ao começo. */
  const alcance =
    aberturaPronta || index > 0 ? Math.min(index + 2, total) : Math.min(1, total)
  if (alcance > montados) setMontados(alcance)

  if (total === 0) return null

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
    >
      {media.slice(0, montados).map((foto, posicao) => (
        <div key={foto.src} className="absolute inset-0">
          <Image
            src={foto.src}
            quality={QUALIDADE_DA_IMAGEM}
            alt=""
            fill
            priority={priority && posicao === 0}
            sizes="100vw"
            onLoad={posicao === 0 ? () => setAberturaPronta(true) : undefined}
            onError={posicao === 0 ? () => setAberturaPronta(true) : undefined}
            className={cn(
              'object-cover transition-opacity duration-500 ease-brand',
              /* `scale` e não `transform`: as utilidades de escala do
                 Tailwind v4 escrevem a propriedade `scale`, e uma transição
                 declarada sobre `transform` não a animaria.

                 A travessia é curta porque a permanência também é: com
                 2,5s no ar, 1,6s de cruzamento deixaria o rodízio em
                 transição quase o tempo todo, e nenhuma fotografia
                 chegaria a ser vista parada. */
              'motion-safe:transition-[opacity,scale] motion-safe:duration-[800ms]',
              posicao === index ? 'opacity-100' : 'opacity-0 motion-safe:scale-[1.045]',
            )}
            style={foto.position ? { objectPosition: foto.position } : undefined}
          />

          {/* O vídeo só existe enquanto o quadro dele está no ar. É o que
              garante um `<video>` de cada vez e nenhum byte de vídeo antes
              da hora — a capa já está na tela e o filme entra por cima
              quando o primeiro quadro chega. */}
          {foto.video && posicao === index && !semMovimento ? (
            <VideoDeFundo src={foto.video.src} position={foto.position} />
          ) : null}
        </div>
      ))}
      {bannerLayers(tone, strength).map((camada) => (
        <div key={camada} className={cn('absolute inset-0', camada)} />
      ))}
    </div>
  )
}

/**
 * O VÍDEO DA ABERTURA
 * ===================
 * Um `<video>` mudo, de uma volta só, por cima da capa que já está na
 * tela. Sem `loop`: o quadro fica no ar o tempo da tomada e o rodízio
 * vira logo depois dela — repetir o filme no mesmo quadro só atrasaria a
 * próxima fotografia.
 *
 * Ele entra por fade quando o primeiro quadro chega (`onPlaying`), e não
 * quando o elemento é montado: sem isso o vídeo pisca preto por cima da
 * fotografia no instante em que aparece.
 *
 * `preload="auto"` é deliberado. O elemento só é montado quando o quadro
 * dele entra no rodízio, então "auto" aqui quer dizer *agora que é a vez
 * dele* — não é o mesmo que baixar as três tomadas na abertura da página.
 *
 * Se o vídeo falhar, o componente se apaga sozinho e a fotografia
 * continua no lugar dele. Uma abertura sem filme é uma abertura; uma
 * abertura com um retângulo preto, não.
 */
function VideoDeFundo({ src, position }: { src: string; position?: string }) {
  const [estado, setEstado] = useState<'esperando' | 'tocando' | 'falhou'>(
    'esperando',
  )

  if (estado === 'falhou') return null

  return (
    <video
      src={src}
      muted
      autoPlay
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setEstado('tocando')}
      onError={() => setEstado('falhou')}
      className={cn(
        'absolute inset-0 size-full object-cover transition-opacity duration-500 ease-brand',
        estado === 'tocando' ? 'opacity-100' : 'opacity-0',
      )}
      style={position ? { objectPosition: position } : undefined}
    />
  )
}
