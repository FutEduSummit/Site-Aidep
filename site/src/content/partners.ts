import type { Partner } from './types'

/**
 * PARCEIROS E APOIADORES
 * Lista conforme briefing oficial. Nenhuma logomarca de terceiros foi
 * fornecida: até que os arquivos oficiais sejam entregues, cada parceiro é
 * apresentado por uma placa tipográfica com o nome — nunca por uma logo
 * recriada, redesenhada ou obtida de outra fonte.
 *
 * Para publicar uma logo oficial:
 *   logo: {
 *     src: '/images/parceiros/caixa.svg',
 *     width: 320, height: 96,
 *     alt: { pt: 'Caixa Econômica Federal', en: '…', es: '…' },
 *   }
 */
export const partners: Partner[] = [
  {
    id: 'caixa',
    name: 'Caixa Econômica Federal',
    kind: 'public',
    logo: null,
    url: null,
  },
  {
    id: 'honda',
    name: 'Moto Honda da Amazônia Ltda.',
    kind: 'private',
    logo: null,
    url: null,
  },
  {
    id: 'governo-federal',
    name: 'Governo Federal Brasileiro',
    kind: 'government',
    logo: null,
    url: null,
  },
  {
    id: 'curitiba',
    name: 'Prefeitura Municipal de Curitiba',
    kind: 'government',
    logo: null,
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
