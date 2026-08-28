import type { Localized, Metric } from './types'

/**
 * NÚMEROS DE IMPACTO
 * Todos os valores vêm do briefing oficial. O total de 2.500 crianças do
 * Coração Valente é a soma direta dos dois territórios informados
 * (1.800 em Aracaju + 700 no Distrito Federal).
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
    value: 12,
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

export const projectMetrics: Metric[] = [
  {
    id: 'aracaju',
    value: 1800,
    label: {
      pt: 'crianças atendidas em Aracaju',
      en: 'children reached in Aracaju',
      es: 'niños atendidos en Aracaju',
    },
    note: {
      pt: 'Projeto Social Coração Valente',
      en: 'Coração Valente Social Project',
      es: 'Proyecto Social Coração Valente',
    },
  },
  {
    id: 'df',
    value: 700,
    label: {
      pt: 'crianças atendidas no Distrito Federal',
      en: 'children reached in the Federal District',
      es: 'niños atendidos en el Distrito Federal',
    },
    note: {
      pt: 'Projeto Social Coração Valente',
      en: 'Coração Valente Social Project',
      es: 'Proyecto Social Coração Valente',
    },
  },
  {
    id: 'school',
    value: 600,
    label: {
      pt: 'pessoas atendidas nas escolas',
      en: 'people reached in schools',
      es: 'personas atendidas en las escuelas',
    },
    note: {
      pt: 'Futsal na Escola',
      en: 'Futsal na Escola',
      es: 'Futsal na Escola',
    },
  },
  {
    id: 'summit-people',
    value: 7,
    suffix: { pt: 'mil', en: 'k', es: 'mil' },
    label: {
      pt: 'participantes reunidos em Curitiba',
      en: 'people gathered in Curitiba',
      es: 'participantes reunidos en Curitiba',
    },
    note: {
      pt: 'FutEdu Summit — Arena da Baixada',
      en: 'FutEdu Summit — Arena da Baixada',
      es: 'FutEdu Summit — Arena da Baixada',
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
