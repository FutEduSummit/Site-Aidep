/**
 * DIREÇÃO DE ARTE DAS FOTOGRAFIAS DE BANCO
 * ========================================
 * Uma entrada por chave usada pelas molduras do site. É a fonte única do
 * único gerador de imagens do projeto:
 *
 *   fetch-stock-images.mjs → busca no Pexels usando `query`
 *
 * Não existe geração de imagem por IA neste projeto. Toda fotografia de
 * demonstração vem do Pexels (licença de uso comercial livre) e é
 * substituída pelo registro real assim que a AIDEP entregar suas fotos —
 * ver `src/content/media.ts`.
 *
 * Campos:
 *   ratio  proporção dominante da moldura no site — orienta a busca e o corte
 *   query  termo de busca no Pexels, em inglês
 *   alt    texto alternativo nos três idiomas
 */

export const PLAN = {
  /* ---------------------------------------------------------------- */
  /* Página inicial                                                   */
  /* ---------------------------------------------------------------- */

  'home.hero': {
    ratio: [21, 9],
    query: 'youth football team training community pitch sunset wide',
    alt: {
      pt: 'Jovens em treino de futebol em uma quadra comunitária ao entardecer',
      en: 'Young players training football on a community pitch at dusk',
      es: 'Jóvenes entrenando fútbol en una cancha comunitaria al atardecer',
    },
  },
  'home.about': {
    ratio: [4, 5],
    query: 'youth football coach talking to children team',
    alt: {
      pt: 'Treinador conversando com crianças antes do treino',
      en: 'Coach talking with children before training',
      es: 'Entrenador hablando con niños antes del entrenamiento',
    },
  },
  'home.audience': {
    ratio: [4, 3],
    query: 'children running together on community sports court',
    alt: {
      pt: 'Crianças correndo juntas em uma quadra comunitária',
      en: 'Children running together across a community court',
      es: 'Niños corriendo juntos en una cancha comunitaria',
    },
  },
  'home.sport': {
    ratio: [5, 6],
    query: 'children playing futsal indoor court training',
    alt: {
      pt: 'Crianças em treino de futsal em ginásio comunitário',
      en: 'Children in a futsal drill at a community sports hall',
      es: 'Niños entrenando futsal en un gimnasio comunitario',
    },
  },
  'home.parasport': {
    ratio: [5, 6],
    query: 'wheelchair basketball athlete training court',
    alt: {
      pt: 'Paratleta em cadeira esportiva durante treino em quadra',
      en: 'Para-athlete in a sports wheelchair training on court',
      es: 'Paratleta en silla deportiva entrenando en cancha',
    },
  },
  'home.presence': {
    ratio: [1, 1],
    query: 'aerial view football pitch neighbourhood houses',
    alt: {
      pt: 'Vista aérea de uma quadra entre casas',
      en: 'Aerial view of a court among houses',
      es: 'Vista aérea de una cancha entre casas',
    },
  },
  'home.contact': {
    ratio: [4, 3],
    query: 'team working meeting bright office',
    alt: {
      pt: 'Equipe em reunião de trabalho em um escritório claro',
      en: 'Team in a working meeting in a bright office',
      es: 'Equipo en una reunión de trabajo en una oficina luminosa',
    },
  },

  'home.impact.banner': {
    ratio: [21, 9],
    query: 'children celebrating together on sports field wide',
    alt: {
      pt: 'Crianças comemorando juntas em um campo esportivo',
      en: 'Children celebrating together on a sports field',
      es: 'Niños celebrando juntos en un campo deportivo',
    },
  },
  'home.partnership.banner': {
    ratio: [21, 9],
    query: 'sport coaches planning meeting youth team court',
    alt: {
      pt: 'Treinadores reunidos com o time à beira da quadra',
      en: 'Coaches meeting with the team at the side of the court',
      es: 'Entrenadores reunidos con el equipo junto a la cancha',
    },
  },
  'home.donate.banner': {
    ratio: [21, 9],
    query: 'children playing football together community field wide',
    alt: {
      pt: 'Crianças jogando futebol juntas em um campo comunitário',
      en: 'Children playing football together on a community field',
      es: 'Niños jugando fútbol juntos en un campo comunitario',
    },
  },

  /* ---------------------------------------------------------------- */
  /* Faixas das páginas internas                                      */
  /* ---------------------------------------------------------------- */

  'page.projects.banner': {
    ratio: [21, 9],
    query: 'youth sports training session outdoor court wide',
    alt: {
      pt: 'Treino esportivo com jovens em quadra ao ar livre',
      en: 'Youth sports session on an outdoor court',
      es: 'Entrenamiento deportivo con jóvenes en cancha al aire libre',
    },
  },
  'page.news.banner': {
    ratio: [21, 9],
    query: 'sports journalist notebook stadium press wide',
    alt: {
      pt: 'Registro de bastidores durante um evento esportivo',
      en: 'Behind-the-scenes record during a sports event',
      es: 'Registro de bastidores durante un evento deportivo',
    },
  },
  'page.transparency.banner': {
    ratio: [21, 9],
    query: 'documents reports desk office wide',
    alt: {
      pt: 'Documentos e relatórios organizados sobre uma mesa de trabalho',
      en: 'Documents and reports organised on a working desk',
      es: 'Documentos e informes organizados sobre una mesa de trabajo',
    },
  },
  'page.partners.banner': {
    ratio: [21, 9],
    query: 'business partners meeting handshake bright office wide',
    alt: {
      pt: 'Reunião entre parceiros institucionais em um escritório claro',
      en: 'Meeting between institutional partners in a bright office',
      es: 'Reunión entre socios institucionales en una oficina luminosa',
    },
  },
  'page.donate.banner': {
    ratio: [21, 9],
    query: 'community sports children smiling field wide',
    alt: {
      pt: 'Crianças sorrindo durante uma atividade esportiva comunitária',
      en: 'Children smiling during a community sports activity',
      es: 'Niños sonriendo durante una actividad deportiva comunitaria',
    },
  },

  /* ---------------------------------------------------------------- */
  /* Projetos                                                         */
  /* ---------------------------------------------------------------- */

  'project.coracao-valente.cover': {
    ratio: [4, 3],
    query: 'children and coach circle on outdoor sports court',
    alt: {
      pt: 'Roda de conversa entre crianças e treinador na quadra',
      en: 'Children and coach in a circle on the court',
      es: 'Rueda de conversación entre niños y entrenador en la cancha',
    },
  },
  'project.futsal-na-escola.cover': {
    ratio: [4, 3],
    query: 'futsal class school gym students',
    alt: {
      pt: 'Aula de futsal no ginásio de uma escola',
      en: 'Futsal class inside a school gym',
      es: 'Clase de futsal en el gimnasio de una escuela',
    },
  },
  'project.futedu-summit.cover': {
    ratio: [4, 3],
    query: 'audience educators conference auditorium',
    alt: {
      pt: 'Plateia de educadores em um auditório de congresso',
      en: 'Audience of educators in a conference auditorium',
      es: 'Público de educadores en un auditorio de congreso',
    },
  },

  /* ---------------------------------------------------------------- */
  /* Notícias de exemplo                                              */
  /* ---------------------------------------------------------------- */

  'news.futedu-summit-2026-inscricoes': {
    ratio: [16, 10],
    query: 'audience sport education panel conference',
    alt: {
      pt: 'Plateia durante um painel de esporte e educação',
      en: 'Audience during a sport and education panel',
      es: 'Público durante un panel de deporte y educación',
    },
  },
  'news.prestacao-de-contas-primeiro-semestre-2026': {
    ratio: [16, 10],
    query: 'printed reports notebook desk documents',
    alt: {
      pt: 'Relatórios impressos ao lado de um caderno sobre a mesa',
      en: 'Printed reports beside a notebook on a table',
      es: 'Informes impresos junto a un cuaderno sobre la mesa',
    },
  },
  'news.coracao-valente-nova-turma-aracaju': {
    ratio: [16, 10],
    query: 'children lining up sports court before training',
    alt: {
      pt: 'Crianças em fila na quadra antes do primeiro treino',
      en: 'Children lining up on the court before the first session',
      es: 'Niños en fila en la cancha antes del primer entrenamiento',
    },
  },
  'news.futsal-na-escola-formacao-de-professores': {
    ratio: [16, 10],
    query: 'teachers training workshop school gym',
    alt: {
      pt: 'Professores em oficina de formação no ginásio da escola',
      en: 'Teachers in a training workshop at the school gym',
      es: 'Profesores en un taller de formación en el gimnasio escolar',
    },
  },
  'news.oficinas-de-paradesporto-nos-polos': {
    ratio: [16, 10],
    query: 'wheelchair athletes indoor sports hall workshop',
    alt: {
      pt: 'Oficina de paradesporto em quadra coberta',
      en: 'Parasport workshop on an indoor court',
      es: 'Taller de paradeporte en cancha cubierta',
    },
  },
  'news.articulacao-internacional-2027': {
    ratio: [16, 10],
    query: 'working meeting around table top view',
    alt: {
      pt: 'Reunião de trabalho em torno de uma mesa',
      en: 'Working meeting around a table',
      es: 'Reunión de trabajo alrededor de una mesa',
    },
  },
}

/** Orientação que o Pexels deve buscar, deduzida da proporção da moldura. */
export function orientationOf([w, h]) {
  if (w === h) return 'square'
  return w > h ? 'landscape' : 'portrait'
}
