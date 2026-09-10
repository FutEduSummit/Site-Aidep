import Image from 'next/image'
import type { ReactNode } from 'react'
import { getMedia } from '@/content/media'
import { getLockup } from '@/lib/brand'

/** Sublinhado sempre visível: em texto corrido, cor sozinha não sinaliza link. */
export const classesDeLigacao =
  'font-semibold text-(--fg) underline decoration-brand-500 decoration-2 underline-offset-4 transition-colors hover:text-(--accent-text) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus)'

/**
 * MOLDURA DAS TELAS DE PORTA
 * ==========================
 * Entrar, pedir link de nova senha e definir a nova senha são a mesma
 * tela com outro miolo. Ficam aqui para que as três não saiam de sincronia
 * quando a fotografia ou o espaçamento mudarem.
 *
 * À esquerda a fotografia, e só ela: nada de título, chamada institucional
 * ou véu por cima. Quem chega aqui é a equipe da associação, que já sabe o
 * que este endereço é — o texto que explicava isso só cobria a imagem. À
 * direita o formulário, com o logotipo da AIDEP no papel branco.
 */
export function MolduraDeEntrada({
  etiqueta,
  titulo,
  descricao,
  children,
  rodape,
}: {
  etiqueta: string
  titulo: string
  descricao: string
  children: ReactNode
  rodape?: ReactNode
}) {
  const marca = getLockup('pt', 'horizontalBlack')
  const foto = getMedia('admin.entrada')

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Fotografia — coluna de altura inteira, só a partir de lg. */}
      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        {foto ? (
          <Image
            src={foto.src}
            alt=""
            fill
            priority
            /* 85vw, e não os 51vw que a coluna mede: a foto é 3/2 numa
               coluna mais alta que larga, e o `object-cover` recorta pelos
               lados. O arquivo precisa cobrir a **altura** da tela, ou
               seja 1,5 × 100vh — que num monitor 16/9 dá justamente 84vw.
               Pela largura da coluna a imagem chegaria esticada. */
            sizes="85vw"
            className="object-cover"
          />
        ) : null}
      </div>

      {/* Miolo */}
      <main className="flex items-center justify-center bg-(--bg) px-6 py-14 sm:px-10">
        <div className="flex w-full max-w-md flex-col gap-9">
          <div className="flex flex-col gap-7">
            <Image
              src={marca.src}
              alt="AIDEP"
              width={marca.width}
              height={marca.height}
              priority
              /* `self-start` não é enfeite: sem ele o flex estica a imagem
                 na transversal e a marca sai deformada — o manual proíbe. */
              className="h-9 w-auto self-start"
            />

            <div className="flex flex-col gap-3">
              <p className="text-micro font-semibold uppercase tracking-[0.18em] text-(--accent-text)">
                {etiqueta}
              </p>
              <h1 className="text-h2 font-extrabold tracking-[-0.04em]">
                {titulo}
              </h1>
              <p className="text-small leading-relaxed text-(--fg-muted)">
                {descricao}
              </p>
            </div>
          </div>

          {children}

          {rodape ? (
            <div className="border-t border-(--border) pt-6 text-small leading-relaxed tracking-normal text-(--fg-subtle)">
              {rodape}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
