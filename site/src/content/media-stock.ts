import type { MediaAsset } from './types'

/**
 * FOTOGRAFIAS DE BANCO — ARQUIVO GERADO
 * =====================================
 * NÃO EDITE À MÃO. Gere de novo com:
 *
 *     npm run images:stock
 *
 * Origem: fotografias de banco do Pexels (licença Pexels — uso comercial livre)
 *
 * São fotografias de BANCO, exibidas enquanto o registro oficial de imagens
 * não estiver completo. Não retratam pessoas, projetos ou eventos reais da
 * AIDEP e não podem ser apresentadas como registro institucional — o
 * crédito do fotógrafo acompanha cada arquivo.
 *
 * Nenhuma imagem deste projeto é gerada por IA.
 *
 * Assim que a fotografia real da AIDEP for cadastrada na mesma chave em
 * `content/media.ts`, ela passa a valer e a foto de banco deixa de ser
 * usada — ver `getMedia()`.
 */
export const stockMedia: Record<string, MediaAsset> = {
  'home.hero': {
    src: '/images/stock/home.hero.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Jovens em treino de futebol em uma quadra comunitária ao entardecer",
      en: "Young players training football on a community pitch at dusk",
      es: "Jóvenes entrenando fútbol en una cancha comunitaria al atardecer",
    },
    credit: "Foto: César O'neill / Pexels — https://www.pexels.com/photo/youth-soccer-match-during-golden-hour-31422302/",
  },
  'home.about': {
    src: '/images/stock/home.about.jpg',
    width: 867,
    height: 1300,
    alt: {
      pt: "Treinador conversando com crianças antes do treino",
      en: "Coach talking with children before training",
      es: "Entrenador hablando con niños antes del entrenamiento",
    },
    credit: "Foto: Марина  Шишкина / Pexels — https://www.pexels.com/photo/football-team-having-a-meeting-10347865/",
  },
  'home.audience': {
    src: '/images/stock/home.audience.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Crianças correndo juntas em uma quadra comunitária",
      en: "Children running together across a community court",
      es: "Niños corriendo juntos en una cancha comunitaria",
    },
    credit: "Foto: Antonius Ferret / Pexels — https://www.pexels.com/photo/little-girls-playing-superheros-outdoors-on-a-court-in-city-5275833/",
  },
  'home.sport': {
    src: '/images/stock/home.sport.jpg',
    width: 867,
    height: 1300,
    alt: {
      pt: "Crianças em treino de futsal em ginásio comunitário",
      en: "Children in a futsal drill at a community sports hall",
      es: "Niños entrenando futsal en un gimnasio comunitario",
    },
    credit: "Foto: Jean-Daniel Francoeur / Pexels — https://www.pexels.com/photo/men-playing-football-on-a-sports-hall-14690053/",
  },
  'home.parasport': {
    src: '/images/stock/home.parasport.jpg',
    width: 868,
    height: 1300,
    alt: {
      pt: "Paratleta em cadeira esportiva durante treino em quadra",
      en: "Para-athlete in a sports wheelchair training on court",
      es: "Paratleta en silla deportiva entrenando en cancha",
    },
    credit: "Foto: Kampus Production / Pexels — https://www.pexels.com/photo/men-on-wheelchairs-playing-basketball-6763747/",
  },
  'home.presence': {
    src: '/images/stock/home.presence.jpg',
    width: 1300,
    height: 1300,
    alt: {
      pt: "Vista aérea de uma quadra entre casas",
      en: "Aerial view of a court among houses",
      es: "Vista aérea de una cancha entre casas",
    },
    credit: "Foto: Josh Sorenson / Pexels — https://www.pexels.com/photo/little-big-planet-photography-of-brown-concrete-buildings-1311155/",
  },
  'home.contact': {
    src: '/images/stock/home.contact.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Equipe em reunião de trabalho em um escritório claro",
      en: "Team in a working meeting in a bright office",
      es: "Equipo en una reunión de trabajo en una oficina luminosa",
    },
    credit: "Foto: olia danilevich / Pexels — https://www.pexels.com/photo/people-working-together-at-the-office-6326260/",
  },
  'home.impact.banner': {
    src: '/images/stock/home.impact.banner.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Crianças comemorando juntas em um campo esportivo",
      en: "Children celebrating together on a sports field",
      es: "Niños celebrando juntos en un campo deportivo",
    },
    credit: "Foto: Thirdman / Pexels — https://www.pexels.com/photo/children-having-fun-playing-soccer-8927016/",
  },
  'home.partnership.banner': {
    src: '/images/stock/home.partnership.banner.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Treinadores reunidos com o time à beira da quadra",
      en: "Coaches meeting with the team at the side of the court",
      es: "Entrenadores reunidos con el equipo junto a la cancha",
    },
    credit: "Foto: Anastasia  Shuraeva / Pexels — https://www.pexels.com/photo/team-of-football-players-together-with-their-coach-9501968/",
  },
  'home.donate.banner': {
    src: '/images/stock/home.donate.banner.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Crianças jogando futebol juntas em um campo comunitário",
      en: "Children playing football together on a community field",
      es: "Niños jugando fútbol juntos en un campo comunitario",
    },
    credit: "Foto: Pew Nguyen / Pexels — https://www.pexels.com/photo/children-playing-soccer-in-lush-outdoor-setting-36871452/",
  },
  'page.projects.banner': {
    src: '/images/stock/page.projects.banner.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Treino esportivo com jovens em quadra ao ar livre",
      en: "Youth sports session on an outdoor court",
      es: "Entrenamiento deportivo con jóvenes en cancha al aire libre",
    },
    credit: "Foto: Ridwan Nugraha / Pexels — https://www.pexels.com/photo/tennis-coaching-lesson-on-outdoor-court-35214649/",
  },
  'page.news.banner': {
    src: '/images/stock/page.news.banner.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Registro de bastidores durante um evento esportivo",
      en: "Behind-the-scenes record during a sports event",
      es: "Registro de bastidores durante un evento deportivo",
    },
    credit: "Foto: Rodolfo Quirós / Pexels — https://www.pexels.com/photo/black-conference-journalism-news-2040015/",
  },
  'page.transparency.banner': {
    src: '/images/stock/page.transparency.banner.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Documentos e relatórios organizados sobre uma mesa de trabalho",
      en: "Documents and reports organised on a working desk",
      es: "Documentos e informes organizados sobre una mesa de trabajo",
    },
    credit: "Foto: RDNE Stock project / Pexels — https://www.pexels.com/photo/a-person-wearing-white-long-sleeves-holding-a-piece-of-paper-on-a-wooden-table-9034223/",
  },
  'page.partners.banner': {
    src: '/images/stock/page.partners.banner.jpg',
    width: 1880,
    height: 1255,
    alt: {
      pt: "Reunião entre parceiros institucionais em um escritório claro",
      en: "Meeting between institutional partners in a bright office",
      es: "Reunión entre socios institucionales en una oficina luminosa",
    },
    credit: "Foto: George Morina / Pexels — https://www.pexels.com/photo/business-people-doing-handshake-6918529/",
  },
  'page.donate.banner': {
    src: '/images/stock/page.donate.banner.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Crianças sorrindo durante uma atividade esportiva comunitária",
      en: "Children smiling during a community sports activity",
      es: "Niños sonriendo durante una actividad deportiva comunitaria",
    },
    credit: "Foto: Long Bà Mùi / Pexels — https://www.pexels.com/photo/smiling-boys-in-soccer-t-shirts-21033099/",
  },
  'project.coracao-valente.cover': {
    src: '/images/stock/project.coracao-valente.cover.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Roda de conversa entre crianças e treinador na quadra",
      en: "Children and coach in a circle on the court",
      es: "Rueda de conversación entre niños y entrenador en la cancha",
    },
    credit: "Foto: RDNE Stock project / Pexels — https://www.pexels.com/photo/kids-playing-basketball-with-their-coach-8336951/",
  },
  'project.futsal-na-escola.cover': {
    src: '/images/stock/project.futsal-na-escola.cover.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Aula de futsal no ginásio de uma escola",
      en: "Futsal class inside a school gym",
      es: "Clase de futsal en el gimnasio de una escuela",
    },
    credit: "Foto: cottonbro studio / Pexels — https://www.pexels.com/photo/class-of-students-at-a-school-gym-7396377/",
  },
  'project.futedu-summit.cover': {
    src: '/images/stock/project.futedu-summit.cover.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Plateia de educadores em um auditório de congresso",
      en: "Audience of educators in a conference auditorium",
      es: "Público de educadores en un auditorio de congreso",
    },
    credit: "Foto: Atlantic Ambience / Pexels — https://www.pexels.com/photo/people-sitting-inside-the-auditorium-9275222/",
  },
  'news.futedu-summit-2026-inscricoes': {
    src: '/images/stock/news.futedu-summit-2026-inscricoes.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Plateia durante um painel de esporte e educação",
      en: "Audience during a sport and education panel",
      es: "Público durante un panel de deporte y educación",
    },
    credit: "Foto: Wiseboy Wissebo / Pexels — https://www.pexels.com/photo/diverse-audience-at-a-professional-conference-38111333/",
  },
  'news.prestacao-de-contas-primeiro-semestre-2026': {
    src: '/images/stock/news.prestacao-de-contas-primeiro-semestre-2026.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Relatórios impressos ao lado de um caderno sobre a mesa",
      en: "Printed reports beside a notebook on a table",
      es: "Informes impresos junto a un cuaderno sobre la mesa",
    },
    credit: "Foto: RDNE Stock project / Pexels — https://www.pexels.com/photo/person-holding-a-white-printed-paper-8123871/",
  },
  'news.coracao-valente-nova-turma-aracaju': {
    src: '/images/stock/news.coracao-valente-nova-turma-aracaju.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Crianças em fila na quadra antes do primeiro treino",
      en: "Children lining up on the court before the first session",
      es: "Niños en fila en la cancha antes del primer entrenamiento",
    },
    credit: "Foto: cottonbro studio / Pexels — https://www.pexels.com/photo/children-lined-up-beside-their-teacher-7207560/",
  },
  'news.futsal-na-escola-formacao-de-professores': {
    src: '/images/stock/news.futsal-na-escola-formacao-de-professores.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Professores em oficina de formação no ginásio da escola",
      en: "Teachers in a training workshop at the school gym",
      es: "Profesores en un taller de formación en el gimnasio escolar",
    },
    credit: "Foto: cottonbro studio / Pexels — https://www.pexels.com/photo/a-male-coach-talking-to-his-students-7207366/",
  },
  'news.oficinas-de-paradesporto-nos-polos': {
    src: '/images/stock/news.oficinas-de-paradesporto-nos-polos.jpg',
    width: 1880,
    height: 1255,
    alt: {
      pt: "Oficina de paradesporto em quadra coberta",
      en: "Parasport workshop on an indoor court",
      es: "Taller de paradeporte en cancha cubierta",
    },
    credit: "Foto: Kampus Production / Pexels — https://www.pexels.com/photo/men-playing-basketball-in-a-court-6763766/",
  },
  'news.articulacao-internacional-2027': {
    src: '/images/stock/news.articulacao-internacional-2027.jpg',
    width: 1880,
    height: 1253,
    alt: {
      pt: "Reunião de trabalho em torno de uma mesa",
      en: "Working meeting around a table",
      es: "Reunión de trabajo alrededor de una mesa",
    },
    credit: "Foto: fauxels / Pexels — https://www.pexels.com/photo/group-of-people-sitting-indoors-3184319/",
  },
}

export function getStockMedia(key: string): MediaAsset | null {
  return stockMedia[key] ?? null
}
