import type { Localized } from './types'

/**
 * Dados institucionais da AIDEP.
 *
 * Origem: briefing oficial + papelaria institucional entregue pela
 * associação. Campos ainda não confirmados permanecem `null` e os blocos
 * correspondentes ficam ocultos na interface — nada é inventado.
 */
export const site = {
  shortName: 'AIDEP',

  legalName: {
    pt: 'Associação Internacional para o Desenvolvimento do Desporto e Paradesporto',
    en: 'International Sports and Parasports Development Association',
    es: 'Asociación Internacional para el Desarrollo del Deporte y el Paradeporte',
  } satisfies Localized,

  /** Posicionamento oficial, conforme briefing. */
  positioning: {
    pt: 'A AIDEP é uma plataforma internacional de desenvolvimento humano por meio do esporte e do paradesporto, que reúne projetos, escolas, metodologias e iniciativas voltadas à formação, inclusão e transformação social.',
    en: 'AIDEP is an international platform for human development through sport and parasport, bringing together projects, schools, methodologies and initiatives dedicated to education, inclusion and social transformation.',
    es: 'AIDEP es una plataforma internacional de desarrollo humano a través del deporte y el paradeporte, que reúne proyectos, escuelas, metodologías e iniciativas orientadas a la formación, la inclusión y la transformación social.',
  } satisfies Localized,

  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aidepoficial.com',

  contact: {
    /** Confirmado na papelaria institucional oficial. */
    email: 'atendimento@aidepoficial.com',
    /** Pendente de confirmação — o bloco de telefone fica oculto. */
    phone: null as string | null,
    /** Endereço completo ainda não fornecido. */
    street: null as string | null,
    city: 'Pato Branco',
    region: 'PR',
    country: {
      pt: 'Brasil',
      en: 'Brazil',
      es: 'Brasil',
    } satisfies Localized,
    countryCode: 'BR',
  },

  social: {
    instagram: {
      handle: '@aidep.oficial',
      url: 'https://www.instagram.com/aidep.oficial',
    },
  },

  /** Registro público (CNPJ) ainda não fornecido. */
  registration: null as string | null,

  /** Dados de doação ainda não fornecidos — a etapa de pagamento fica oculta. */
  donation: {
    pix: null as string | null,
    bank: null as {
      bank: string
      agency: string
      account: string
      holder: string
    } | null,
  },
} as const

export type SiteConfig = typeof site

/** O envio dos formulários só é habilitado com endpoint configurado. */
export const contactEndpointConfigured = Boolean(process.env.CONTACT_WEBHOOK_URL)
