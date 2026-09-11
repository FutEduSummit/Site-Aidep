import type { Localized, Metric } from './types'

/**
 * NÚMEROS DE IMPACTO
 * Todos os valores vêm do briefing oficial.
 *
 * Só o consolidado mora aqui. O número de cada projeto fica no próprio
 * projeto (`content/projects.ts`), que é de onde o cartão da Home e a
 * página do projeto o leem — a Home teve por um tempo as duas contas em
 * faixas seguidas, dizendo a mesma coisa duas vezes.
 */
export const headlineMetrics: Metric[] = [
  {
    id: 'people',
    value: 40,
    prefix: '+',
    suffix: { pt: 'mil', en: 'k', es: 'mil' },
    label: {
      pt: 'pessoas atendidas',
      en: 'people reached',
      es: 'personas atendidas',
    },
    note: {
      pt: 'Somando todos os projetos e iniciativas da associação.',
      en: 'Across every project and initiative run by the association.',
      es: 'Sumando todos los proyectos e iniciativas de la asociación.',
    },
  },
  {
    id: 'projects',
    value: 3,
    label: {
      pt: 'projetos em andamento',
      en: 'projects under way',
      es: 'proyectos en marcha',
    },
  },
  {
    id: 'cities',
    value: 5,
    label: {
      pt: 'cidades com o Futsal na Escola',
      en: 'cities running Futsal na Escola',
      es: 'ciudades con Futsal na Escola',
    },
  },
  {
    id: 'summit',
    value: 7,
    suffix: { pt: 'mil', en: 'k', es: 'mil' },
    label: {
      pt: 'participantes no FutEdu Summit',
      en: 'people at the FutEdu Summit',
      es: 'participantes en el FutEdu Summit',
    },
  },
]

/** Públicos atendidos, conforme briefing. */
export const audiences: Localized<string[]> = {
  pt: ['Crianças', 'Adolescentes', 'Jovens', 'Adultos', 'Comunidades em situação de vulnerabilidade'],
  en: ['Children', 'Teenagers', 'Young people', 'Adults', 'Communities in situations of vulnerability'],
  es: ['Niños', 'Adolescentes', 'Jóvenes', 'Adultos', 'Comunidades en situación de vulnerabilidad'],
}

/**
 * SISTEMA CONTINENTAL DA MARCA
 * O Manual de Marca da AIDEP define uma cor oficial para cada continente.
 * O verde é, ao mesmo tempo, a cor principal da associação e a cor das
 * Américas — por isso transita entre a comunicação internacional e a
 * comunicação continental.
 */
export type ContinentEntry = {
  id: string
  color: string
  name: Localized
  /** Verde acumula o papel de cor institucional principal. */
  isPrimary?: boolean
}

export const continents: ContinentEntry[] = [
  {
    id: 'americas',
    color: 'var(--color-continent-americas)',
    name: { pt: 'Américas', en: 'Americas', es: 'Américas' },
    isPrimary: true,
  },
  {
    id: 'europe',
    color: 'var(--color-continent-europe)',
    name: { pt: 'Europa', en: 'Europe', es: 'Europa' },
  },
  {
    id: 'africa',
    color: 'var(--color-continent-africa)',
    name: { pt: 'África', en: 'Africa', es: 'África' },
  },
  {
    id: 'asia',
    color: 'var(--color-continent-asia)',
    name: { pt: 'Ásia', en: 'Asia', es: 'Asia' },
  },
  {
    id: 'oceania',
    color: 'var(--color-continent-oceania)',
    name: { pt: 'Oceania', en: 'Oceania', es: 'Oceanía' },
  },
  {
    id: 'antarctica',
    color: 'var(--color-continent-antarctica)',
    name: { pt: 'Antártica', en: 'Antarctica', es: 'Antártida' },
  },
]
