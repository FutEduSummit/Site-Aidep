import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { gateEnabled } from '@/lib/gate'

export default function robots(): MetadataRoute.Robots {
  /* Fase de pré-lançamento: nada é indexado nem apontado por sitemap. */
  if (gateEnabled) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    /* O painel do cliente nunca é indexado. O proxy já manda
       `X-Robots-Tag: noindex` em toda resposta de /admin; isto evita que o
       robô sequer bata na porta. */
    rules: [{ userAgent: '*', allow: '/', disallow: '/admin' }],
    sitemap: new URL('/sitemap.xml', site.url).toString(),
    host: site.url,
  }
}
