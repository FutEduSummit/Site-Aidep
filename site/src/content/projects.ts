import { lerProjetos } from '@/lib/cms/leitura'
import { galeriaCoracaoValente } from './media'
import type { Project } from './types'

/**
 * PROJETOS DA AIDEP
 * Todo o conteúdo abaixo vem do briefing oficial. Campos sem informação
 * fornecida (metodologia detalhada, galeria, resultados descritivos e
 * parceiros por projeto) permanecem vazios e os blocos correspondentes
 * ficam ocultos até que o conteúdo seja entregue.
 */
export const projetosDoBriefing: Project[] = [
  {
    slug: 'coracao-valente',
    name: 'Projeto Social Coração Valente',
    category: {
      pt: 'Projeto social',
      en: 'Social project',
      es: 'Proyecto social',
    },
    summary: {
      pt: 'O futebol como ferramenta de desenvolvimento humano, inclusão social e transformação de crianças e adolescentes.',
      en: 'Football as a tool for human development, social inclusion and the transformation of children and teenagers.',
      es: 'El fútbol como herramienta de desarrollo humano, inclusión social y transformación de niños y adolescentes.',
    },
    description: {
      pt: [
        'O Projeto Social Coração Valente utiliza o futebol como ferramenta de desenvolvimento humano, inclusão social e transformação de crianças e adolescentes.',
        'O projeto atua em comunidades e regiões de vulnerabilidade social, utilizando polos esportivos como espaços de desenvolvimento.',
      ],
      en: [
        'The Coração Valente Social Project uses football as a tool for human development, social inclusion and the transformation of children and teenagers.',
        'The project operates in communities and regions of social vulnerability, using sports hubs as spaces for development.',
      ],
      es: [
        'El Proyecto Social Coração Valente utiliza el fútbol como herramienta de desarrollo humano, inclusión social y transformación de niños y adolescentes.',
        'El proyecto actúa en comunidades y regiones de vulnerabilidad social, utilizando polos deportivos como espacios de desarrollo.',
      ],
    },
    objective: {
      pt: 'Usar o futebol como ferramenta de desenvolvimento humano e inclusão social de crianças e adolescentes em comunidades e regiões de vulnerabilidade.',
      en: 'To use football as a tool for the human development and social inclusion of children and teenagers in vulnerable communities and regions.',
      es: 'Usar el fútbol como herramienta de desarrollo humano e inclusión social de niños y adolescentes en comunidades y regiones de vulnerabilidad.',
    },
    audience: {
      pt: ['Crianças', 'Adolescentes', 'Comunidades em situação de vulnerabilidade'],
      en: ['Children', 'Teenagers', 'Communities in situations of vulnerability'],
      es: ['Niños', 'Adolescentes', 'Comunidades en situación de vulnerabilidad'],
    },
    locations: [
      { city: { pt: 'Aracaju', en: 'Aracaju', es: 'Aracaju' }, region: 'SE' },
      {
        city: {
          pt: 'Distrito Federal',
          en: 'Federal District',
          es: 'Distrito Federal',
        },
      },
    ],
    metrics: [
      {
        id: 'aracaju',
        value: 1800,
        label: {
          pt: 'crianças atendidas em Aracaju',
          en: 'children reached in Aracaju',
          es: 'niños atendidos en Aracaju',
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
      },
      {
        id: 'hubs',
        value: 2,
        label: {
          pt: 'territórios de atuação',
          en: 'territories of operation',
          es: 'territorios de actuación',
        },
      },
    ],
    methodology: null,
    results: null,
    gallery: galeriaCoracaoValente,
    partnerIds: [],
    coverKey: 'project.coracao-valente.cover',
  },

  {
    slug: 'futsal-na-escola',
    name: 'Futsal na Escola',
    category: {
      pt: 'Projeto educacional e esportivo',
      en: 'Education and sport project',
      es: 'Proyecto educativo y deportivo',
    },
    summary: {
      pt: 'O futsal como ferramenta para o desenvolvimento integral de crianças e adolescentes dentro do ambiente escolar.',
      en: 'Futsal as a tool for the integral development of children and teenagers within the school environment.',
      es: 'El futsal como herramienta para el desarrollo integral de niños y adolescentes dentro del entorno escolar.',
    },
    description: {
      pt: [
        'O Futsal na Escola é um projeto educacional e esportivo que utiliza o futsal como ferramenta para promover o desenvolvimento integral de crianças e adolescentes dentro do ambiente escolar.',
      ],
      en: [
        'Futsal na Escola is an education and sport project that uses futsal as a tool to promote the integral development of children and teenagers within the school environment.',
      ],
      es: [
        'Futsal na Escola es un proyecto educativo y deportivo que utiliza el futsal como herramienta para promover el desarrollo integral de niños y adolescentes dentro del entorno escolar.',
      ],
    },
    objective: {
      pt: 'Promover o desenvolvimento integral de crianças e adolescentes dentro do ambiente escolar, tendo o futsal como ferramenta educacional.',
      en: 'To promote the integral development of children and teenagers within the school environment, using futsal as an educational tool.',
      es: 'Promover el desarrollo integral de niños y adolescentes dentro del entorno escolar, con el futsal como herramienta educativa.',
    },
    audience: {
      pt: ['Crianças', 'Adolescentes', 'Comunidade escolar'],
      en: ['Children', 'Teenagers', 'School community'],
      es: ['Niños', 'Adolescentes', 'Comunidad escolar'],
    },
    /**
     * CIDADES PROVISÓRIAS — TROCAR PELAS REAIS.
     * O briefing informa o número (12 cidades, ver a métrica `cities`
     * abaixo), mas não os nomes. As doze abaixo estão aqui para que o mapa
     * de atuação possa ser conferido enquanto a lista oficial não chega;
     * são cidades plausíveis, não as cidades atendidas.
     *
     * Para corrigir, basta trocar nome e sigla: a coordenada de cada ponto
     * é resolvida sozinha pelo cadastro do IBGE (ver `lib/mapa.ts`). Mais
     * de uma cidade no mesmo estado é normal e cada uma recebe seu ponto —
     * `region` é o que separa homônimas ("Itabaiana" existe em SE e na PB).
     */
    locations: [
      { city: { pt: 'Aracaju', en: 'Aracaju', es: 'Aracaju' }, region: 'SE' },
      { city: { pt: 'Itabaiana', en: 'Itabaiana', es: 'Itabaiana' }, region: 'SE' },
      { city: { pt: 'Lagarto', en: 'Lagarto', es: 'Lagarto' }, region: 'SE' },
      { city: { pt: 'Brasília', en: 'Brasília', es: 'Brasilia' }, region: 'DF' },
      { city: { pt: 'Goiânia', en: 'Goiânia', es: 'Goiania' }, region: 'GO' },
      { city: { pt: 'Anápolis', en: 'Anápolis', es: 'Anapolis' }, region: 'GO' },
      { city: { pt: 'Salvador', en: 'Salvador', es: 'Salvador' }, region: 'BA' },
      {
        city: {
          pt: 'Feira de Santana',
          en: 'Feira de Santana',
          es: 'Feira de Santana',
        },
        region: 'BA',
      },
      { city: { pt: 'Curitiba', en: 'Curitiba', es: 'Curitiba' }, region: 'PR' },
      { city: { pt: 'Londrina', en: 'Londrina', es: 'Londrina' }, region: 'PR' },
      { city: { pt: 'São Paulo', en: 'São Paulo', es: 'São Paulo' }, region: 'SP' },
      { city: { pt: 'Campinas', en: 'Campinas', es: 'Campinas' }, region: 'SP' },
    ],
    metrics: [
      {
        id: 'cities',
        value: 12,
        label: {
          pt: 'cidades com o projeto',
          en: 'cities running the project',
          es: 'ciudades con el proyecto',
        },
      },
      {
        id: 'people',
        value: 600,
        label: {
          pt: 'pessoas atendidas',
          en: 'people reached',
          es: 'personas atendidas',
        },
      },
    ],
    methodology: null,
    results: null,
    gallery: [],
    partnerIds: [],
    coverKey: 'project.futsal-na-escola.cover',
  },

  {
    slug: 'futedu-summit',
    name: 'FutEdu Summit',
    category: {
      pt: 'Congresso internacional',
      en: 'International congress',
      es: 'Congreso internacional',
    },
    summary: {
      pt: 'Congresso internacional dedicado ao desenvolvimento do futebol, do futsal e do beach soccer.',
      en: 'An international congress dedicated to the development of football, futsal and beach soccer.',
      es: 'Congreso internacional dedicado al desarrollo del fútbol, el futsal y el beach soccer.',
    },
    description: {
      pt: [
        'O FutEdu Summit é um congresso internacional dedicado ao desenvolvimento do futebol, do futsal e do beach soccer.',
        'O encontro reúne profissionais, clubes, escolas, pesquisadores, gestores, treinadores, empresas e instituições para compartilhar conhecimento, desenvolver pessoas, gerar conexões e criar novas oportunidades para o esporte.',
      ],
      en: [
        'FutEdu Summit is an international congress dedicated to the development of football, futsal and beach soccer.',
        'It brings together professionals, clubs, schools, researchers, managers, coaches, companies and institutions to share knowledge, develop people, create connections and open new opportunities for sport.',
      ],
      es: [
        'FutEdu Summit es un congreso internacional dedicado al desarrollo del fútbol, el futsal y el beach soccer.',
        'El encuentro reúne a profesionales, clubes, escuelas, investigadores, gestores, entrenadores, empresas e instituciones para compartir conocimiento, desarrollar personas, generar conexiones y crear nuevas oportunidades para el deporte.',
      ],
    },
    objective: {
      pt: 'Compartilhar conhecimento, desenvolver pessoas, gerar conexões e criar novas oportunidades para o esporte.',
      en: 'To share knowledge, develop people, create connections and open new opportunities for sport.',
      es: 'Compartir conocimiento, desarrollar personas, generar conexiones y crear nuevas oportunidades para el deporte.',
    },
    audience: {
      pt: [
        'Profissionais do esporte',
        'Clubes',
        'Escolas',
        'Pesquisadores',
        'Gestores',
        'Treinadores',
        'Empresas e instituições',
      ],
      en: [
        'Sport professionals',
        'Clubs',
        'Schools',
        'Researchers',
        'Managers',
        'Coaches',
        'Companies and institutions',
      ],
      es: [
        'Profesionales del deporte',
        'Clubes',
        'Escuelas',
        'Investigadores',
        'Gestores',
        'Entrenadores',
        'Empresas e instituciones',
      ],
    },
    locations: [
      {
        city: { pt: 'Curitiba', en: 'Curitiba', es: 'Curitiba' },
        region: 'PR',
        venue: 'Arena da Baixada',
      },
    ],
    metrics: [
      {
        id: 'people',
        value: 7,
        suffix: { pt: 'mil', en: 'k', es: 'mil' },
        label: {
          pt: 'pessoas atendidas',
          en: 'people reached',
          es: 'personas atendidas',
        },
      },
      {
        id: 'modalities',
        value: 3,
        label: {
          pt: 'modalidades: futebol, futsal e beach soccer',
          en: 'disciplines: football, futsal and beach soccer',
          es: 'modalidades: fútbol, futsal y beach soccer',
        },
      },
    ],
    methodology: null,
    results: null,
    gallery: [],
    partnerIds: [],
    coverKey: 'project.futedu-summit.cover',
  },
]


/* ------------------------------------------------------------------ */
/* Leitura                                                            */
/* ------------------------------------------------------------------ */

/**
 * A fonte da verdade é o painel do cliente (`/admin/projetos`), gravado na
 * tabela `projetos` do Supabase.
 *
 * Enquanto essa tabela estiver vazia — ou se o Supabase estiver fora do ar
 * — valem os projetos do briefing acima, exatamente como estavam. O botão
 * "Importar conteúdo do site" no painel copia os três para o banco de uma
 * vez, e a partir daí o cliente edita cada um por lá.
 */
export async function getProjects(): Promise<Project[]> {
  const doPainel = await lerProjetos()
  return doPainel ?? projetosDoBriefing
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const todos = await getProjects()
  return todos.find((project) => project.slug === slug)
}

export async function getProjectSlugs(): Promise<string[]> {
  const todos = await getProjects()
  return todos.map((project) => project.slug)
}
