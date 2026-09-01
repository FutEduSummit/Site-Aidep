import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import {
  gateCookie,
  gateEnabled,
  gateFromHeader,
  gatePath,
  gateUnlocked,
} from './lib/gate'

/**
 * Roteamento de idiomas.
 *
 * Redireciona a raiz para o idioma adequado e reescreve os caminhos
 * traduzidos (`/pt/a-aidep`, `/es/proyectos`…) para as rotas internas do
 * App Router, preservando a página ao trocar de idioma.
 */
const intl = createMiddleware(routing)

/**
 * Portão de pré-lançamento + roteamento de idiomas.
 *
 * Enquanto `gateEnabled` (em `lib/gate.ts`) for `true`, todo endereço do
 * site é reescrito para a página "Site em construção" até que a senha
 * libere o navegador. Desligando a chave, este arquivo volta a se
 * comportar exatamente como o roteamento de idiomas puro.
 */
export default function proxy(request: NextRequest) {
  if (!gateEnabled) return intl(request)

  const { pathname, search } = request.nextUrl
  const liberado = gateUnlocked(request.cookies.get(gateCookie)?.value)

  /* A própria página de construção não passa pelo roteamento de idiomas. */
  if (pathname === gatePath) {
    if (liberado) return NextResponse.redirect(new URL('/', request.url))
    return semIndexacao(NextResponse.next())
  }

  if (!liberado) {
    /* O destino pedido viaja no cabeçalho para ser devolvido após a senha. */
    const headers = new Headers(request.headers)
    headers.set(gateFromHeader, `${pathname}${search}`)

    return semIndexacao(
      NextResponse.rewrite(new URL(gatePath, request.url), {
        request: { headers },
      }),
    )
  }

  return intl(request)
}

/** Nenhuma resposta desta fase deve ser indexada por buscadores. */
function semIndexacao(response: NextResponse) {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}

export const config = {
  /**
   * Os padrões abaixo cobrem, nesta ordem: a raiz, a página de construção,
   * todos os caminhos já prefixados por idioma e os demais caminhos sem
   * prefixo — sempre ignorando arquivos e rotas internas do Next.
   */
  matcher: [
    '/',
    '/em-construcao',
    '/(pt|en|es)/:path*',
    '/((?!api|_next|_vercel|.*\..*).*)',
  ],
}
