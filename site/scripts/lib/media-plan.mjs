/**
 * DIREÇÃO DE ARTE DA PRÉ-VISUALIZAÇÃO
 * ===================================
 * Uma entrada por chave de `src/content/media.ts`. É a fonte única dos dois
 * geradores:
 *
 *   fetch-preview-images.mjs  → busca no Pexels usando `query`  (recomendado)
 *   gen-preview-images.mjs    → gera por IA usando `prompt`      (sem chave)
 *
 * Campos:
 *   ratio        proporção da moldura no site — orienta o corte e a busca
 *   query        termo de busca no Pexels, em inglês
 *   prompt       descrição para o gerador de imagem
 *   alt          texto alternativo nos três idiomas
 */

/** Linguagem visual comum ao gerador por IA. */
export const STYLE =
  'documentary sports photography, natural available light, candid unposed moment, ' +
  'shallow depth of field, 35mm editorial look, warm realistic color grading, ' +
  'authentic Brazilian community setting, no text, no logo, no watermark, no lettering on clothing'

export const NEGATIVE =
  'text, letters, words, watermark, logo, brand names, distorted hands, extra limbs, deformed faces, cgi, 3d render, illustration, cartoon'

export const PLAN = {
  'home.hero': {
    ratio: [3, 4],
    query: 'young football player standing on street court sunset',
    prompt:
      'vertical portrait of a young Brazilian athlete standing on an outdoor community futsal court at dusk, ' +
      'strong backlight, dark cinematic background, quiet determined expression, ' +
      'holding a football under one arm',
    alt: {
      pt: '[Prévia] Jovem atleta em uma quadra comunitária ao entardecer',
      en: '[Preview] Young athlete on a community court at dusk',
      es: '[Vista previa] Joven atleta en una cancha comunitaria al atardecer',
    },
  },
  'home.about': {
    ratio: [4, 5],
    query: 'youth football coach talking to children team',
    prompt:
      'a coach kneeling to talk with a small group of children before training, outdoor sports court, ' +
      'attentive faces, late afternoon sunlight, sense of guidance and belonging',
    alt: {
      pt: '[Prévia] Treinador conversando com crianças antes do treino',
      en: '[Preview] Coach talking with children before training',
      es: '[Vista previa] Entrenador hablando con niños antes del entrenamiento',
    },
  },
  'home.sport': {
    ratio: [5, 6],
    query: 'children playing futsal indoor court training',
    prompt:
      'children in a futsal training drill inside a modest community sports hall, ball in motion, ' +
      'movement blur on the feet, painted court lines, daylight through high windows',
    alt: {
      pt: '[Prévia] Crianças em treino de futsal em ginásio comunitário',
      en: '[Preview] Children in a futsal drill at a community sports hall',
      es: '[Vista previa] Niños entrenando futsal en un gimnasio comunitario',
    },
  },
  'home.parasport': {
    ratio: [5, 6],
    query: 'wheelchair basketball athlete training court',
    prompt:
      'para-athlete in a sports wheelchair training on an indoor court, focused expression, ' +
      'teammate visible in the background, natural gym light, dignified and athletic framing',
    alt: {
      pt: '[Prévia] Paratleta em cadeira esportiva durante treino em quadra',
      en: '[Preview] Para-athlete in a sports wheelchair training on court',
      es: '[Vista previa] Paratleta en silla deportiva entrenando en cancha',
    },
  },
  'home.impact': {
    ratio: [4, 3],
    query: 'youth football tournament crowd community field',
    prompt:
      'wide view of a full community sports court during a youth tournament, families watching from the side, ' +
      'many children in plain kits, celebratory atmosphere, golden hour',
    alt: {
      pt: '[Prévia] Quadra comunitária cheia durante um torneio de base',
      en: '[Preview] A full community court during a youth tournament',
      es: '[Vista previa] Cancha comunitaria llena durante un torneo juvenil',
    },
  },
  'home.reach': {
    ratio: [4, 3],
    query: 'aerial view football pitch neighbourhood sunset',
    prompt:
      'aerial view of a small sports court between houses in a Brazilian town at sunset, ' +
      'children playing far below, long shadows, wide landscape context',
    alt: {
      pt: '[Prévia] Vista aérea de uma quadra entre casas ao pôr do sol',
      en: '[Preview] Aerial view of a court among houses at sunset',
      es: '[Vista previa] Vista aérea de una cancha entre casas al atardecer',
    },
  },

  'about.hero': {
    ratio: [4, 5],
    query: 'football coach portrait sideline whistle',
    prompt:
      'portrait of a sports educator on the sideline of an outdoor court, arms crossed, ' +
      'watching a training session out of frame, soft afternoon light, calm authority',
    alt: {
      pt: '[Prévia] Educador esportivo acompanhando um treino à beira da quadra',
      en: '[Preview] Sports educator watching a session from the sideline',
      es: '[Vista previa] Educador deportivo observando un entrenamiento',
    },
  },
  'about.history': {
    ratio: [1, 1],
    query: 'old football balls cones training equipment',
    prompt:
      'square composition of worn footballs, cones and bibs stacked on the edge of a community court, ' +
      'still life, morning light, texture of daily use, no people',
    alt: {
      pt: '[Prévia] Bolas, cones e coletes usados na borda da quadra',
      en: '[Preview] Worn balls, cones and bibs at the edge of the court',
      es: '[Vista previa] Balones, conos y petos usados al borde de la cancha',
    },
  },
  'about.method': {
    ratio: [4, 5],
    query: 'coach tactics board explaining team players',
    prompt:
      'coach drawing a play on a small tactical board while young players lean in to look, ' +
      'indoor court, focused faces, teaching moment',
    alt: {
      pt: '[Prévia] Treinador explicando uma jogada para jovens jogadores',
      en: '[Preview] Coach explaining a play to young players',
      es: '[Vista previa] Entrenador explicando una jugada a jóvenes jugadores',
    },
  },

  'impact.hero': {
    ratio: [16, 9],
    query: 'children running together sport field',
    prompt:
      'wide cinematic frame of children running together across a community sports court, ' +
      'motion, dust in the light, horizon of simple houses behind, late afternoon',
    alt: {
      pt: '[Prévia] Crianças correndo juntas em uma quadra comunitária',
      en: '[Preview] Children running together across a community court',
      es: '[Vista previa] Niños corriendo juntos en una cancha comunitaria',
    },
  },
  'impact.story': {
    ratio: [4, 5],
    query: 'teenage athlete resting after training towel',
    prompt:
      'close portrait of a teenage athlete resting after training, towel on the shoulder, ' +
      'honest tired smile, court fence blurred behind, warm light',
    alt: {
      pt: '[Prévia] Atleta adolescente descansando após o treino',
      en: '[Preview] Teenage athlete resting after training',
      es: '[Vista previa] Atleta adolescente descansando tras el entrenamiento',
    },
  },

  'project.coracao-valente.cover': {
    ratio: [3, 2],
    query: 'children sitting circle coach community sport',
    prompt:
      'group of children of mixed ages sitting in a circle on a community court with a coach, ' +
      'conversation before training, social project atmosphere, warm afternoon light',
    alt: {
      pt: '[Prévia] Roda de conversa entre crianças e treinador na quadra',
      en: '[Preview] Children and coach in a circle on the court',
      es: '[Vista previa] Ronda de conversación entre niños y entrenador',
    },
  },
  'project.coracao-valente.hero': {
    ratio: [4, 5],
    query: 'child tying shoelaces sport court',
    prompt:
      'vertical frame of a child tying their shoelaces on the edge of a community court, ' +
      'other children warming up behind, low angle, morning light',
    alt: {
      pt: '[Prévia] Criança amarrando o tênis na beira da quadra',
      en: '[Preview] Child tying their shoes at the edge of the court',
      es: '[Vista previa] Niño atándose los tenis al borde de la cancha',
    },
  },
  'project.futsal-na-escola.cover': {
    ratio: [3, 2],
    query: 'school gym physical education class students sport',
    prompt:
      'futsal class inside a school gym, students in plain sports kit lined up for a drill, ' +
      'teacher with a whistle, painted court lines, daylight from high windows',
    alt: {
      pt: '[Prévia] Aula de futsal no ginásio de uma escola',
      en: '[Preview] Futsal class inside a school gym',
      es: '[Vista previa] Clase de futsal en el gimnasio de una escuela',
    },
  },
  'project.futsal-na-escola.hero': {
    ratio: [4, 5],
    query: 'boy kicking football indoor court action',
    prompt:
      'vertical frame of a student striking a futsal ball inside a school gym, ' +
      'sharp movement, empty bleachers behind, natural light',
    alt: {
      pt: '[Prévia] Estudante chutando a bola em quadra escolar',
      en: '[Preview] Student striking the ball in a school gym',
      es: '[Vista previa] Estudiante golpeando el balón en cancha escolar',
    },
  },
  'project.futedu-summit.cover': {
    ratio: [3, 2],
    query: 'conference audience auditorium speaker seminar',
    prompt:
      'audience of educators and coaches in a conference auditorium, speaker on stage seen from behind, ' +
      'plain neutral stage, attentive room, soft professional lighting, no readable text on screens',
    alt: {
      pt: '[Prévia] Plateia de educadores em um auditório de congresso',
      en: '[Preview] Audience of educators in a conference auditorium',
      es: '[Vista previa] Público de educadores en un auditorio de congreso',
    },
  },
  'project.futedu-summit.hero': {
    ratio: [4, 5],
    query: 'conference networking people talking event badge',
    prompt:
      'vertical frame of two professionals talking in a conference foyer between sessions, ' +
      'lanyards, coffee cups, natural window light, blurred crowd behind',
    alt: {
      pt: '[Prévia] Profissionais conversando no intervalo do congresso',
      en: '[Preview] Professionals talking during a conference break',
      es: '[Vista previa] Profesionales conversando en el receso del congreso',
    },
  },

  'partners.hero': {
    ratio: [16, 9],
    query: 'business handshake partnership meeting',
    prompt:
      'wide frame of a handshake between two adults on the sideline of a sports court, ' +
      'training happening out of focus behind, natural light, partnership atmosphere',
    alt: {
      pt: '[Prévia] Aperto de mãos à beira de uma quadra esportiva',
      en: '[Preview] A handshake at the sideline of a sports court',
      es: '[Vista previa] Apretón de manos al borde de una cancha deportiva',
    },
  },
  'donate.hero': {
    ratio: [16, 9],
    query: 'volunteers carrying donation boxes charity',
    prompt:
      'wide frame of volunteers unloading boxes of sports equipment from a van next to a community court, ' +
      'children watching curiously, bright daylight',
    alt: {
      pt: '[Prévia] Voluntários descarregando material esportivo ao lado da quadra',
      en: '[Preview] Volunteers unloading sports equipment beside the court',
      es: '[Vista previa] Voluntarios descargando material deportivo junto a la cancha',
    },
  },
  'contact.hero': {
    ratio: [16, 9],
    query: 'small office team working desk daylight',
    prompt:
      'wide frame of a small bright office with two people working at a shared table, ' +
      'sports equipment stored in the corner, plants, window light, calm workday',
    alt: {
      pt: '[Prévia] Equipe trabalhando em um escritório claro',
      en: '[Preview] Team working in a bright office',
      es: '[Vista previa] Equipo trabajando en una oficina luminosa',
    },
  },
  'transparency.hero': {
    ratio: [16, 9],
    query: 'documents folders desk paperwork organised',
    prompt:
      'wide frame of hands organizing printed reports and folders on a wooden table, ' +
      'neutral office, daylight, orderly and sober, no readable text on the pages',
    alt: {
      pt: '[Prévia] Relatórios impressos organizados sobre uma mesa',
      en: '[Preview] Printed reports organised on a table',
      es: '[Vista previa] Informes impresos organizados sobre una mesa',
    },
  },
  'news.hero': {
    ratio: [16, 9],
    query: 'photographer camera sports event sideline',
    prompt:
      'wide frame of a photographer covering a youth sports event from the sideline, ' +
      'court and players out of focus behind, late afternoon light',
    alt: {
      pt: '[Prévia] Fotógrafo cobrindo um evento esportivo de base',
      en: '[Preview] Photographer covering a youth sports event',
      es: '[Vista previa] Fotógrafo cubriendo un evento deportivo juvenil',
    },
  },

  /* Capas das notícias de exemplo (ver src/content/news-example.ts). */
  'news.futedu-summit-2026-inscricoes': {
    ratio: [16, 10],
    query: 'conference audience sports education panel',
    prompt:
      'wide frame of an auditorium during a sports education conference, speakers on ' +
      'a low stage, attentive audience taking notes, warm stage light, no readable ' +
      'text on the screen',
    alt: {
      pt: '[Prévia] Plateia durante um painel de esporte e educação',
      en: '[Preview] Audience during a sport and education panel',
      es: '[Vista previa] Público durante un panel de deporte y educación',
    },
  },
  'news.prestacao-de-contas-primeiro-semestre-2026': {
    ratio: [16, 10],
    query: 'documents folders table accountability paperwork',
    prompt:
      'wide frame of printed reports stacked beside a notebook and a pen on a plain ' +
      'table, daylight from the side, sober and orderly, no people, no readable text',
    alt: {
      pt: '[Prévia] Relatórios impressos ao lado de um caderno sobre a mesa',
      en: '[Preview] Printed reports beside a notebook on a table',
      es: '[Vista previa] Informes impresos junto a un cuaderno sobre la mesa',
    },
  },
  'news.coracao-valente-nova-turma-aracaju': {
    ratio: [16, 10],
    query: 'children team lining up outdoor court training start',
    prompt:
      'wide frame of a new group of children lining up at the edge of an outdoor ' +
      'community court before the first training session, coach in front of them, ' +
      'morning light',
    alt: {
      pt: '[Prévia] Crianças em fila na quadra antes do primeiro treino',
      en: '[Preview] Children lining up on the court before the first session',
      es: '[Vista previa] Niños en fila en la cancha antes del primer entrenamiento',
    },
  },
  'news.futsal-na-escola-formacao-de-professores': {
    ratio: [16, 10],
    query: 'teachers training workshop gymnasium notes',
    prompt:
      'wide frame of physical education teachers in a training workshop inside a ' +
      'school gym, sitting in a semicircle with notebooks, whiteboard out of focus, ' +
      'daylight',
    alt: {
      pt: '[Prévia] Professores em oficina de formação no ginásio da escola',
      en: '[Preview] Teachers in a training workshop at the school gym',
      es: '[Vista previa] Profesores en un taller de formación en el gimnasio escolar',
    },
  },
  'news.oficinas-de-paradesporto-nos-polos': {
    ratio: [16, 10],
    query: 'wheelchair sport workshop coach athlete court',
    prompt:
      'wide frame of a coach guiding a para-athlete in a sports wheelchair during a ' +
      'workshop on an indoor court, other participants watching, natural gym light, ' +
      'dignified framing',
    alt: {
      pt: '[Prévia] Oficina de paradesporto em quadra coberta',
      en: '[Preview] Parasport workshop on an indoor court',
      es: '[Vista previa] Taller de paradeporte en cancha cubierta',
    },
  },
  'news.articulacao-internacional-2027': {
    ratio: [16, 10],
    query: 'meeting table international cooperation handshake documents',
    prompt:
      'wide frame of a small working meeting around a table, four people talking over ' +
      'printed material, neutral meeting room, window light, collaborative atmosphere',
    alt: {
      pt: '[Prévia] Reunião de trabalho em torno de uma mesa',
      en: '[Preview] Working meeting around a table',
      es: '[Vista previa] Reunión de trabajo alrededor de una mesa',
    },
  },
}

/** Orientação que o Pexels deve buscar, deduzida da proporção da moldura. */
export function orientationOf([w, h]) {
  if (w === h) return 'square'
  return w > h ? 'landscape' : 'portrait'
}
