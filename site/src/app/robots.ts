import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { gateEnabled } from '@/lib/gate'

export default function robots(): MetadataRoute.Robots {
  /* Fase de pré-lançamento: nada é indexado nem apontado por sitemap. */
  if (gateEnabled) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: new URL('/sitemap.xml', site.url).toString(),
    host: site.url,
  }
}
