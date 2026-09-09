import Image from 'next/image'
import type { ReactNode } from 'react'
import { getMedia } from '@/content/media'
import { getLockup, symbolMark } from '@/lib/brand'

/** Sublinhado sempre visível: em texto corrido, cor sozinha não sinaliza link. */
export const classesDeLigacao =
  'font-semibold text-(--fg) underline decoration-brand-500 decoration-2 underline-offset-4 transition-colors hover:text-(--accent-text) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus)'

/**
 * MOLDURA DAS TELAS DE PORTA
 * ==========================
 * Entrar, pedir link de nova senha e definir a nova senha são a mesma
 * tela com outro miolo. Ficam aqui para que as três não saiam de sincronia
 * quando a fotografia, o véu ou o espaçamento mudarem.
 *
 * À esquerda a fotografia, com o texto institucional embaixo — nada é
 * sobreposto ao topo da imagem, onde a foto tem o seu ponto de interesse.
 * À direita o formulário, com o logotipo da AIDEP no papel branco.
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
  /* Retrato de propósito: a coluna é alta e estreita. */
  const foto = getMedia('home.sport')

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Fotografia — coluna de altura inteira, só a partir de lg. */}
      <div
        data-surface="dark"
        className="relative hidden overflow-hidden bg-ink-950 lg:block"
      >
        {foto ? (
          <Image
            src={foto.src}
            alt=""
            fill
            priority
            sizes="55vw"
            className="object-cover"
          />
        ) : null}

        {/* Véu: sem ele o contraste do texto depende da foto que estiver no
            ar. O degradê é mais forte embaixo, onde o texto vive, e alivia
            em cima — assim a fotografia ainda aparece. */}
        <div aria-hidden="true" className="absolute inset-0 bg-ink-950/40" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-ink-950 via-ink-950/60 to-transparent"
        />

        {/* Grafismo oficial: o símbolo ampliado, sangrando pela borda. Vive
            na metade de cima, longe do texto — a 7% de opacidade ele é
            textura, e sobre letra viraria ruído. */}
        <Image
          aria-hidden="true"
          src={symbolMark.white.src}
          alt=""
          width={symbolMark.white.width}
          height={symbolMark.white.height}
          sizes="70vw"
          className="pointer-events-none absolute -right-[20%] top-[6%] w-[72%] max-w-none opacity-[0.07]"
        />

        {/* `justify-end`: o texto assenta no rodapé da coluna. */}
        <div className="relative flex h-full flex-col justify-end gap-8 p-10 xl:p-14">
          <div className="flex max-w-[34ch] flex-col gap-5">
            <span className="modulo" aria-hidden="true" />
            <p className="text-h3 font-bold leading-tight tracking-[-0.03em] text-paper">
              O esporte como ferramenta de desenvolvimento humano.
            </p>
            <p className="text-small leading-relaxed text-paper/70">
              Este é o painel onde a associação publica suas notícias, seus
              projetos e sua prestação de contas.
            </p>
          </div>

          {foto?.credit ? (
            <p className="max-w-[52ch] text-[0.6875rem] leading-relaxed text-paper/40">
              {foto.credit}
            </p>
          ) : null}
        </div>
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
