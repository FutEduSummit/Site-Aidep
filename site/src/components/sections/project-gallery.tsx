'use client'

import { Maximize2 } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { Button } from '@/components/ui/button'
import { PhotoLightbox } from '@/components/ui/photo-lightbox'
import { Container, Section, type Surface } from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import type { MediaAsset } from '@/content/types'
import type { Locale } from '@/i18n/routing'

type ProjectGalleryProps = {
  id: string
  photos: MediaAsset[]
  locale: Locale
  surface?: Surface
}

/** Quantas fotos aparecem de saída, e quantas entram a cada clique. */
const LOTE = 12

/**
 * GALERIA DO PROJETO
 * ==================
 * Feita para arquivo grande: um projeto com duzentas fotos não pode
 * derrubar a página nem obrigar o visitante a rolar duzentas miniaturas.
 * Por isso as fotos entram em lotes (ver `LOTE`), e o botão diz quantas
 * ainda faltam.
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

  if (photos.length === 0) return null

  const naTela = photos.slice(0, visiveis)
  const faltam = photos.length - naTela.length

  return (
    <Section surface={surface} id={id} ariaLabelledby={`${id}-title`}>
      <Container className="flex flex-col gap-stack">
        <SectionHeader
          id={`${id}-title`}
          title={t('labels.gallery')}
          description={t('gallery.count', { count: photos.length })}
        />

        <Reveal>
          {/* Colunas, não grade quadrada: o acervo mistura paisagem e
              retrato, e recortar tudo em 4/3 cortaria justamente o que
              faz a foto — o time inteiro perfilado, a criança de corpo
              inteiro. Aqui cada foto entra na proporção em que foi
              tirada, e a coluna se acomoda. */}
          <ul className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>li]:mb-3 [&>li]:break-inside-avoid">
            {naTela.map((foto, indice) => (
              <li key={`${foto.src}-${indice}`}>
                <button
                  type="button"
                  onClick={() => setAberta(indice)}
                  className="group/foto relative block w-full cursor-pointer overflow-hidden bg-paper-3"
                >
                  <Image
                    src={foto.src}
                    alt={foto.alt[locale]}
                    width={foto.width}
                    height={foto.height}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="h-auto w-full transition-transform duration-500 ease-brand group-hover/foto:scale-105"
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
        </Reveal>

        {faltam > 0 ? (
          <div className="flex flex-col items-start gap-4">
            <Button
              variant="outline"
              onClick={() => setVisiveis((atual) => atual + LOTE)}
            >
              {t('gallery.showMore', { count: Math.min(faltam, LOTE) })}
            </Button>
            <p className="text-micro uppercase tracking-[0.14em] text-(--fg-subtle)">
              {t('gallery.position', {
                current: naTela.length,
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
