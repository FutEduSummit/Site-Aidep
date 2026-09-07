import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getMedia } from '@/content/media'
import { getLockup, symbolMark } from '@/lib/brand'
import { supabaseConfigurado } from '@/lib/supabase/config'
import { sessaoAdmin } from '@/lib/supabase/servidor'
import { Aviso } from '../componentes/ui'
import { FormularioDeEntrada } from './formulario'

/* A tela de entrada nunca pode ser servida de cache: ela decide entre
   mostrar o formulário e mandar para o painel, e isso depende do cookie. */
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  if (await sessaoAdmin()) redirect('/admin')

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
            ar. O degradê é mais forte embaixo, onde o texto começa, e alivia
            em cima — assim a fotografia ainda aparece. */}
        <div aria-hidden="true" className="absolute inset-0 bg-ink-950/45" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-ink-950 via-ink-950/55 to-ink-950/15"
        />
        {/* Véu curto no topo: a marca é branca e o teto do ginásio é claro. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-ink-950/75 to-transparent"
        />

        {/* Grafismo oficial: o símbolo ampliado, sangrando pela borda.
            Começa abaixo do logotipo de propósito — atrás dele, os dois
            desenhos se confundem. */}
        <Image
          aria-hidden="true"
          src={symbolMark.white.src}
          alt=""
          width={symbolMark.white.width}
          height={symbolMark.white.height}
          sizes="70vw"
          className="pointer-events-none absolute -right-[22%] top-[14%] w-[78%] max-w-none opacity-[0.07]"
        />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          {/* Só o símbolo aqui: a marca horizontal é larga e atravessaria a
              parte clara da fotografia, onde o branco deixa de ser legível.
              O logotipo completo fica na coluna do formulário. */}
          <Image
            src={symbolMark.white.src}
            alt="AIDEP"
            width={symbolMark.white.width}
            height={symbolMark.white.height}
            priority
            /* `self-start` não é enfeite: sem ele o flex estica a imagem na
               transversal e a marca sai deformada — o manual proíbe. */
            className="h-12 w-auto self-start"
          />

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
          ) : (
            <span />
          )}
        </div>
      </div>

      {/* Entrada */}
      <main className="flex items-center justify-center bg-(--bg) px-6 py-14 sm:px-10">
        <div className="flex w-full max-w-md flex-col gap-9">
          <div className="flex flex-col gap-7">
            <Image
              src={marca.src}
              alt="AIDEP"
              width={marca.width}
              height={marca.height}
              priority
              className="h-9 w-auto self-start"
            />

            <div className="flex flex-col gap-3">
              <p className="text-micro font-semibold uppercase tracking-[0.18em] text-(--accent-text)">
                Área restrita
              </p>
              <h1 className="text-h2 font-extrabold tracking-[-0.04em]">
                Painel de conteúdo
              </h1>
              <p className="text-small leading-relaxed text-(--fg-muted)">
                Entre para publicar notícias, projetos e documentos de
                transparência no site da AIDEP.
              </p>
            </div>
          </div>

          {supabaseConfigurado ? (
            <FormularioDeEntrada />
          ) : (
            <Aviso tom="erro">
              O painel ainda não está conectado ao banco. Preencha
              NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no
              arquivo <code>.env</code> e rode <code>npm run db:migrate</code>.
            </Aviso>
          )}

          <p className="border-t border-(--border) pt-6 text-small leading-relaxed tracking-normal text-(--fg-subtle)">
            Esqueceu a senha? Peça a quem cuida do site para gerar uma nova com{' '}
            <code className="text-micro tracking-normal text-(--fg-muted)">
              npm run admin:criar
            </code>
            .
          </p>
        </div>
      </main>
    </div>
  )
}
