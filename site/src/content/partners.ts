import type { Partner } from './types'

/**
 * PARCEIROS E APOIADORES
 * Lista conforme briefing oficial.
 *
 * As logomarcas vêm do arquivo oficial de cada instituição ou de reprodução
 * em domínio público — nenhuma foi recriada ou redesenhada. A procedência e o
 * passo a passo para substituir um arquivo estão em
 * `public/images/parceiros/README.md`.
 *
 * `width`/`height` precisam ser as dimensões reais do arquivo: o `next/image`
 * usa a proporção para reservar o espaço e não deixar a página saltar.
 * Sem logo (`logo: null`), o parceiro aparece como placa tipográfica com o
 * nome — ver `PartnerLogo` e `LogoMarquee`.
 */
export const partners: Partner[] = [
  {
    id: 'caixa',
    name: 'Caixa Econômica Federal',
    kind: 'public',
    logo: {
      src: '/images/parceiros/caixa.png',
      width: 512,
      height: 118,
      alt: {
        pt: 'Caixa Econômica Federal',
        en: 'Caixa Econômica Federal',
        es: 'Caixa Econômica Federal',
      },
    },
    url: 'https://www.caixa.gov.br',
  },
  {
    id: 'honda',
    name: 'Moto Honda da Amazônia Ltda.',
    kind: 'private',
    logo: {
      src: '/images/parceiros/honda.png',
      width: 512,
      height: 65,
      alt: {
        pt: 'Honda',
        en: 'Honda',
        es: 'Honda',
      },
    },
    url: 'https://www.honda.com.br/motos',
  },
  {
    id: 'governo-federal',
    name: 'Governo Federal Brasileiro',
    kind: 'government',
    logo: {
      src: '/images/parceiros/governo-federal.png',
      width: 512,
      height: 246,
      alt: {
        pt: 'Governo do Brasil',
        en: 'Government of Brazil',
        es: 'Gobierno de Brasil',
      },
    },
    url: 'https://www.gov.br',
  },
  {
    id: 'curitiba',
    name: 'Prefeitura Municipal de Curitiba',
    kind: 'government',
    logo: {
      src: '/images/parceiros/curitiba.png',
      width: 512,
      height: 175,
      alt: {
        pt: 'Prefeitura de Curitiba',
        en: 'Curitiba City Hall',
        es: 'Alcaldía de Curitiba',
      },
    },
    url: 'https://www.curitiba.pr.gov.br',
  },
  {
    id: 'dni-sports',
    name: 'DNI Sports',
    kind: 'private',
    logo: {
      src: '/images/parceiros/dni-sports.png',
      width: 512,
      height: 239,
      alt: {
        pt: 'DNI Sports',
        en: 'DNI Sports',
        es: 'DNI Sports',
      },
    },
    url: null,
  },
  {
    id: 'cbfs-academy',
    name: 'CBFS Academy',
    kind: 'private',
    logo: {
      src: '/images/parceiros/cbfs-academy.png',
      width: 263,
      height: 315,
      alt: {
        pt: 'CBFS Academy',
        en: 'CBFS Academy',
        es: 'CBFS Academy',
      },
    },
    url: null,
  },
]

/**
 * Apoio institucional sem logomarca associada — apresentado como texto,
 * conforme informado no briefing.
 */
export const institutionalSupport = {
  pt: ['Apoiadores e representantes públicos'],
  en: ['Supporters and public representatives'],
  es: ['Apoyadores y representantes públicos'],
}

export function getPartners(ids: string[]): Partner[] {
  return ids
    .map((id) => partners.find((partner) => partner.id === id))
    .filter((partner): partner is Partner => Boolean(partner))
}
