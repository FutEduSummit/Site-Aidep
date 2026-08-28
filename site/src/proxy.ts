import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

/**
 * Roteamento de idiomas.
 *
 * Redireciona a raiz para o idioma adequado e reescreve os caminhos
 * traduzidos (`/pt/a-aidep`, `/es/proyectos`…) para as rotas internas do
 * App Router, preservando a página ao trocar de idioma.
 */
export default createMiddleware(routing)

export const config = {
  /**
   * Os padrões abaixo cobrem, nesta ordem: a raiz, todos os caminhos já
   * prefixados por idioma e os demais caminhos sem prefixo — sempre
   * ignorando arquivos e rotas internas do Next.
   */
  matcher: [
    '/',
    '/(pt|en|es)/:path*',
    '/((?!api|_next|_vercel|.*\..*).*)',
  ],
}
