import Image from 'next/image'
import { headers } from 'next/headers'
import { site } from '@/content/site'
import { getLockup } from '@/lib/brand'
import { gateFromHeader, gateUnlockPath, safeDestination } from '@/lib/gate'

/* A página lê cabeçalhos e query string: sempre renderizada por requisição. */
export const dynamic = 'force-dynamic'

const inputClasses =
  'w-full min-h-12 border border-(--border-strong) bg-transparent px-4 py-3 text-body text-(--fg) tracking-[0.3em] transition-colors duration-200 ease-brand placeholder:tracking-[0.3em] placeholder:text-(--fg-subtle) hover:border-(--fg-muted) focus-visible:border-(--focus) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus)'

const buttonClasses =
  'inline-flex min-h-12 items-center justify-center gap-3 rounded-xs bg-(--fg) px-8 py-4 text-[0.8125rem] font-semibold uppercase leading-none tracking-[0.1em] text-(--bg) transition-colors duration-200 ease-brand hover:bg-(--fg-muted)'

export default async function ConstrucaoPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; destino?: string }>
}) {
  const { erro, destino } = await searchParams
  const requestHeaders = await headers()

  /* Endereço que o visitante tentou abrir — devolvido a ele após a senha. */
  const alvo = safeDestination(destino ?? requestHeaders.get(gateFromHeader))
  const senhaIncorreta = erro === '1'

  const lockup = getLockup('pt', 'horizontalWhite')

  return (
    <main className="relative isolate flex min-h-svh flex-col justify-between overflow-hidden">
      {/* Grafismo institucional: barras inclinadas derivadas do símbolo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-y-32 -right-20 -z-10 flex gap-6 opacity-[0.07]"
      >
        <span className="block w-14 skew-x-[-12deg] bg-brand-400 sm:w-20" />
        <span className="block w-14 skew-x-[-12deg] bg-paper sm:w-20" />
        <span className="block w-14 skew-x-[-12deg] bg-brand-400 sm:w-20" />
      </div>

      <header className="container-site pt-8 sm:pt-14">
        <Image
          src={lockup.src}
          width={lockup.width}
          height={lockup.height}
          alt={site.legalName.pt}
          priority
          sizes="240px"
          className="h-auto w-[190px] sm:w-[240px]"
        />
      </header>

      <section className="container-site py-10 sm:py-20">
        <div className="max-w-(--container-text)">
          <p className="eyebrow">Pré-lançamento</p>

          <h1 className="mt-6 text-display">Site em construção</h1>

          <p className="mt-6 max-w-[46ch] text-lead text-(--fg-muted)">
            Estamos finalizando o novo site da AIDEP. Enquanto isso, o acesso à
            pré-visualização é restrito — informe a senha para continuar.
          </p>

          <p className="mt-4 text-small text-(--fg-subtle)">
            <span lang="en">Site under construction</span>
            <span aria-hidden="true"> · </span>
            <span lang="es">Sitio en construcción</span>
          </p>

          <form
            method="post"
            action={gateUnlockPath}
            className="mt-10 max-w-(--container-narrow)"
          >
            <input type="hidden" name="destino" value={alvo} />

            <label
              htmlFor="senha"
              className="block text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-muted)"
            >
              Senha de acesso
            </label>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                id="senha"
                name="senha"
                type="password"
                inputMode="text"
                autoComplete="current-password"
                autoFocus
                required
                placeholder="••••"
                aria-invalid={senhaIncorreta}
                aria-describedby={senhaIncorreta ? 'senha-erro' : undefined}
                className={inputClasses}
              />

              <button type="submit" className={buttonClasses}>
                Entrar
              </button>
            </div>

            {senhaIncorreta ? (
              <p
                id="senha-erro"
                role="alert"
                className="mt-3 flex items-center gap-2 text-small font-medium text-danger-soft"
              >
                <span
                  aria-hidden="true"
                  className="block h-[0.3125rem] w-4 shrink-0 skew-x-[-12deg] bg-danger"
                />
                Senha incorreta. Tente novamente.
              </p>
            ) : null}
          </form>
        </div>
      </section>

      <footer className="container-site pb-8 sm:pb-14">
        <div className="flex flex-col gap-2 border-t border-(--rule) pt-6 text-small text-(--fg-subtle) sm:flex-row sm:items-center sm:justify-between">
          <p>
            {site.shortName} — {site.contact.city}, {site.contact.region},{' '}
            {site.contact.country.pt}
          </p>

          <p className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href={`mailto:${site.contact.email}`}
              className="link-underline hover:text-(--fg)"
            >
              {site.contact.email}
            </a>
            <a
              href={site.social.instagram.url}
              target="_blank"
              rel="noreferrer noopener"
              className="link-underline hover:text-(--fg)"
            >
              {site.social.instagram.handle}
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}
