'use client'

import { Maximize2 } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { MaskedWords } from '@/components/motion/animated-text'
import { GrowLine } from '@/components/motion/grow-line'
import { Reveal } from '@/components/motion/reveal'
import { Button } from '@/components/ui/button'
import { PhotoLightbox } from '@/components/ui/photo-lightbox'
import { Container, Section, type Surface } from '@/components/ui/section'
import type { MediaAsset } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { QUALIDADE_DA_IMAGEM } from '@/lib/image-quality'
import { DISTANCE } from '@/lib/motion'

type ProjectGalleryProps = {
  id: string
  photos: MediaAsset[]
  locale: Locale
  surface?: Surface
}

/** Quantas fotos aparecem de saída, e quantas entram a cada clique. */
const LOTE = 12

/**
 * Quanta proporção (largura ÷ altura, somada) cabe numa linha em cada
 * faixa de tela. É isto que decide quantas fotos entram por linha —
 * tela larga comporta mais — e a altura da linha sai sozinha: é a
 * largura disponível dividida por esta soma.
 */
const SOMA_POR_LINHA = { compacta: 2.2, media: 4.2, larga: 6.6 }

/** Abaixo disto a última linha é curta demais para ficar sozinha. */
const MINIMO_DA_ULTIMA = 0.62

type Quadro = { foto: MediaAsset; indice: number; proporcao: number }

/**
 * Proporção da foto, com um limite nas duas pontas: uma panorâmica ou um
 * retrato extremo espremeria as vizinhas de linha até virarem tira.
 */
function proporcaoDe(foto: MediaAsset) {
  const bruta = foto.width && foto.height ? foto.width / foto.height : 1.5
  return Math.min(Math.max(bruta, 0.58), 2.4)
}

/**
 * Reparte as fotos em linhas, na ordem em que vieram, cada linha somando
 * perto de `somaAlvo`. Como toda linha é depois esticada até a largura
 * cheia, não sobra buraco no meio da grade nem degrau no pé dela.
 */
function emLinhas(fotos: MediaAsset[], somaAlvo: number): Quadro[][] {
  const linhas: Quadro[][] = []
  let atual: Quadro[] = []
  let soma = 0

  fotos.forEach((foto, indice) => {
    const proporcao = proporcaoDe(foto)
    const passaDoAlvo = soma + proporcao > somaAlvo
    // Fecha a linha antes desta foto se ela já estiver mais perto do
    // alvo sem a foto do que ficaria com ela.
    const fechaMelhorAgora =
      Math.abs(soma - somaAlvo) <= Math.abs(soma + proporcao - somaAlvo)

    if (atual.length > 0 && passaDoAlvo && fechaMelhorAgora) {
      linhas.push(atual)
      atual = []
      soma = 0
    }

    atual.push({ foto, indice, proporcao })
    soma += proporcao
  })

  if (atual.length > 0) linhas.push(atual)

  // A sobra do fim, quando curta, entra na linha anterior: duas fotos
  // esticadas na largura toda virariam um paredão no pé da galeria.
  if (linhas.length > 1) {
    const ultima = linhas[linhas.length - 1]
    const somaUltima = ultima.reduce((total, q) => total + q.proporcao, 0)

    if (somaUltima < somaAlvo * MINIMO_DA_ULTIMA) {
      linhas[linhas.length - 2].push(...ultima)
      linhas.pop()
    }
  }

  return linhas
}

/** Faixa de tela em vigor, para saber quanto cabe numa linha. */
function useSomaPorLinha() {
  const [soma, setSoma] = useState(SOMA_POR_LINHA.larga)

  useEffect(() => {
    const larga = window.matchMedia('(min-width: 1024px)')
    const media = window.matchMedia('(min-width: 640px)')

    const ler = () => {
      if (larga.matches) setSoma(SOMA_POR_LINHA.larga)
      else if (media.matches) setSoma(SOMA_POR_LINHA.media)
      else setSoma(SOMA_POR_LINHA.compacta)
    }

    ler()
    larga.addEventListener('change', ler)
    media.addEventListener('change', ler)
    return () => {
      larga.removeEventListener('change', ler)
      media.removeEventListener('change', ler)
    }
  }, [])

  return soma
}

/**
 * GALERIA DO PROJETO
 * ==================
 * Feita para arquivo grande: um projeto com duzentas fotos não pode
 * derrubar a página nem obrigar o visitante a rolar duzentas miniaturas.
 * Por isso as fotos entram em lotes (ver `LOTE`), e o botão diz quantas
 * ainda faltam.
 *
 * O arranjo é por linhas justificadas, como uma folha de contato: cada
 * foto entra na proporção em que foi tirada — o time inteiro perfilado, a
 * criança de corpo inteiro —, as fotos de uma mesma linha dividem a
 * altura e a linha vai de margem a margem. Nada de coluna que termina
 * antes das outras: não há rasgo de branco no meio da grade, e o pé fica
 * reto tanto antes quanto depois do "ver mais".
 *
 * Cada miniatura abre a foto inteira em tela cheia (ver `PhotoLightbox`),
 * de onde se passa para a próxima sem voltar para a grade — é assim que se
 * olha um álbum.
 *
 * As miniaturas carregam sob demanda (`loading="lazy"`, que é o padrão do
 * next/image) e são servidas no recorte do tamanho em que aparecem: a foto
 * de 4 MB do celular não é baixada inteira para caber em 300 px.
 */
export function ProjectGallery({
  id,
  photos,
  locale,
  surface = 'muted',
}: ProjectGalleryProps) {
  const t = useTranslations('projects')
  const [visiveis, setVisiveis] = useState(LOTE)
  const [aberta, setAberta] = useState<number | null>(null)
  const somaAlvo = useSomaPorLinha()

  const linhas = useMemo(
    () => emLinhas(photos.slice(0, visiveis), somaAlvo),
    [photos, visiveis, somaAlvo],
  )

  if (photos.length === 0) return null

  const naTela = Math.min(visiveis, photos.length)
  const faltam = photos.length - naTela

  return (
    <Section surface={surface} id={id} ariaLabelledby={`${id}-title`}>
      <Container className="flex flex-col gap-stack">
        {/* Título e contagem ocupam a largura toda, um em cada ponta — a
            contagem encostada na margem, não solta no meio da tela. */}
        <header className="flex flex-col gap-stack">
          <GrowLine />
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <MaskedWords
              as="h2"
              id={`${id}-title`}
              text={t('labels.gallery')}
              className="text-h2 font-bold tracking-[-0.03em]"
            />
            <Reveal distance={DISTANCE.sm} delay={0.08}>
              <p className="text-lead text-(--fg-muted)">
                {t('gallery.count', { count: photos.length })}
              </p>
            </Reveal>
          </div>
        </header>

        <Reveal>
          <div className="flex flex-col gap-3">
            {linhas.map((linha) => {
              const somaLinha = linha.reduce((tot, q) => tot + q.proporcao, 0)
              // Só sobra curta quando a galeria inteira cabe numa linha:
              // aí ela não estica, para a foto não virar cartaz. Nas
              // demais, a linha vai de ponta a ponta.
              const curta = somaLinha < somaAlvo * MINIMO_DA_ULTIMA

              return (
                <ul
                  key={`linha-${linha[0].indice}`}
                  className="flex gap-3"
                  style={
                    curta
                      ? { maxWidth: `${(somaLinha / somaAlvo) * 100}%` }
                      : undefined
                  }
                >
                  {linha.map(({ foto, indice, proporcao }) => (
                    <li
                      key={`${foto.src}-${indice}`}
                      className="min-w-0"
                      style={{ flex: `${proporcao} 1 0%` }}
                    >
                      <button
                        type="button"
                        onClick={() => setAberta(indice)}
                        style={{ aspectRatio: proporcao }}
                        className="group/foto relative block w-full cursor-pointer overflow-hidden bg-paper-3"
                      >
                        <Image
                          src={foto.src}
                          quality={QUALIDADE_DA_IMAGEM}
                          alt={foto.alt[locale]}
                          fill
                          sizes="(max-width: 640px) 55vw, (max-width: 1024px) 38vw, 28vw"
                          style={{ objectPosition: foto.position }}
                          className="object-cover transition-transform duration-500 ease-brand group-hover/foto:scale-105"
                        />

                        {/* Sinal de que a foto abre — aparece só no hover e no
                            foco pelo teclado, para não sujar a grade. */}
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 flex items-end justify-end bg-ink-950/0 p-3 opacity-0 transition-all duration-300 ease-brand group-hover/foto:bg-ink-950/20 group-hover/foto:opacity-100 group-focus-visible/foto:bg-ink-950/20 group-focus-visible/foto:opacity-100"
                        >
                          <span className="flex size-9 items-center justify-center bg-(--bg) text-(--fg)">
                            <Maximize2 className="size-4" strokeWidth={2} />
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )
            })}
          </div>
        </Reveal>

        {faltam > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setVisiveis((atual) => atual + LOTE)}
            >
              {t('gallery.showMore', { count: Math.min(faltam, LOTE) })}
            </Button>
            <p className="text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
              {t('gallery.position', {
                current: naTela,
                total: photos.length,
              })}
            </p>
          </div>
        ) : null}
      </Container>

      <PhotoLightbox
        photos={photos}
        index={aberta}
        locale={locale}
        onClose={() => setAberta(null)}
        onNavigate={setAberta}
      />
    </Section>
  )
}
