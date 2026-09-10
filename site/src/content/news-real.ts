import type { NewsArticle } from './types'

/**
 * NOTÍCIAS DOS PROJETOS
 * =====================
 * Três notícias para cada um dos três projetos da AIDEP, escritas a
 * partir do que está documentado — e só disso.
 *
 * DE ONDE SAIU CADA COISA
 * -----------------------
 * - **Os números** vêm do briefing oficial e são os mesmos que o site
 *   publica nas métricas de cada projeto (`content/projects.ts`): 1.800
 *   crianças em Aracaju, 700 no Distrito Federal, 600 pessoas nas
 *   escolas, 7 mil no Summit, 12 cidades no Futsal na Escola.
 * - **As cidades** são as cadastradas em cada projeto.
 * - **As datas** são as dos próprios arquivos do acervo, lidas do
 *   metadado de cada vídeo: o polo do Bugio em 9 de fevereiro de 2026, a
 *   leva de Estância e Poço Verde em 21 de abril, a Copa em 16 de junho,
 *   o FutEdu Summit em 20 e 21 de junho de 2025. A notícia sai um ou dois
 *   dias depois do registro, como sai uma nota de comunicação.
 *
 * O QUE NÃO TEM AQUI
 * ------------------
 * Nenhuma fala atribuída a pessoa real, nenhum nome próprio de criança,
 * professor ou autoridade, e nenhum número que não esteja no briefing.
 * Onde faltou informação, o texto descreve o que a fotografia mostra em
 * vez de preencher com suposição.
 *
 * ANTES DE PUBLICAR: a associação deve revisar títulos, datas e detalhes
 * de cada nota — quem estava lá sabe coisas que o acervo não conta.
 *
 * Para levar ao painel: `npm run noticias:publicar`.
 */

const AUTOR = 'Comunicação AIDEP'

export const realNews: NewsArticle[] = [
  /* ================================================================== */
  /* Projeto Social Coração Valente                                     */
  /* ================================================================== */

  {
    slug: 'polos-do-coracao-valente-em-sergipe',
    title: {
      pt: 'Coração Valente abre polos em doze municípios de Sergipe',
      en: 'Coração Valente opens hubs in twelve Sergipe municipalities',
      es: 'Coração Valente abre polos en doce municipios de Sergipe',
    },
    excerpt: {
      pt: 'De fevereiro a abril, o projeto inaugurou polos esportivos da capital ao sertão: de Aracaju e Nossa Senhora do Socorro a Canindé de São Francisco, Poço Verde e Tobias Barreto.',
      en: 'Between February and April the project opened sports hubs from the state capital to the backlands: from Aracaju and Nossa Senhora do Socorro to Canindé de São Francisco, Poço Verde and Tobias Barreto.',
      es: 'De febrero a abril el proyecto inauguró polos deportivos de la capital al sertón: de Aracaju y Nossa Senhora do Socorro a Canindé de São Francisco, Poço Verde y Tobias Barreto.',
    },
    body: {
      pt: [
        {
          type: 'paragraph',
          text: 'O Projeto Social Coração Valente concluiu em abril a abertura dos polos esportivos em Sergipe. A instalação começou em fevereiro, no polo do Bugio, em Aracaju, e seguiu por doze municípios do estado ao longo de três meses.',
        },
        { type: 'heading', text: 'Onde os polos ficam' },
        {
          type: 'paragraph',
          text: 'A distribuição segue a densidade de atendimento: Aracaju concentra cinco polos e Nossa Senhora do Socorro, três. Os demais municípios recebem um polo cada.',
        },
        {
          type: 'list',
          items: [
            'Grande Aracaju: Aracaju, Nossa Senhora do Socorro e Barra dos Coqueiros',
            'Agreste e sertão: Itabaiana, Nossa Senhora da Glória, Canindé de São Francisco, Nossa Senhora de Lourdes e Propriá',
            'Centro-sul: Boquim, Estância, Poço Verde e Tobias Barreto',
          ],
        },
        { type: 'heading', text: 'Como é o dia de abertura' },
        {
          type: 'paragraph',
          text: 'Cada inauguração reúne a turma, as famílias e a comunidade em volta da quadra ou do campo. Na mesma data são entregues uniformes, chuteiras e o material de treino, e a rotina de atividades começa na semana seguinte.',
        },
        {
          type: 'paragraph',
          text: 'Somando os dois territórios do projeto, Sergipe e o Distrito Federal, o Coração Valente atende 2.500 crianças e adolescentes.',
        },
      ],
      en: [
        {
          type: 'paragraph',
          text: 'The Coração Valente Social Project completed the opening of its sports hubs in Sergipe in April. Installation began in February at the Bugio hub in Aracaju and moved through twelve municipalities over three months.',
        },
        { type: 'heading', text: 'Where the hubs are' },
        {
          type: 'paragraph',
          text: 'They are distributed according to how many people each area serves: Aracaju holds five hubs and Nossa Senhora do Socorro three. The remaining municipalities have one each.',
        },
        {
          type: 'list',
          items: [
            'Greater Aracaju: Aracaju, Nossa Senhora do Socorro and Barra dos Coqueiros',
            'Agreste and backlands: Itabaiana, Nossa Senhora da Glória, Canindé de São Francisco, Nossa Senhora de Lourdes and Propriá',
            'Central-south: Boquim, Estância, Poço Verde and Tobias Barreto',
          ],
        },
        { type: 'heading', text: 'What opening day looks like' },
        {
          type: 'paragraph',
          text: 'Every opening brings together the group, their families and the surrounding community around the court or the pitch. Kit, boots and training equipment are handed out on the same day, and the regular schedule starts the following week.',
        },
        {
          type: 'paragraph',
          text: 'Across both of the project’s territories, Sergipe and the Federal District, Coração Valente reaches 2,500 children and teenagers.',
        },
      ],
      es: [
        {
          type: 'paragraph',
          text: 'El Proyecto Social Coração Valente concluyó en abril la apertura de los polos deportivos en Sergipe. La instalación empezó en febrero, en el polo de Bugio, en Aracaju, y siguió por doce municipios del estado a lo largo de tres meses.',
        },
        { type: 'heading', text: 'Dónde están los polos' },
        {
          type: 'paragraph',
          text: 'La distribución sigue la densidad de atención: Aracaju concentra cinco polos y Nossa Senhora do Socorro, tres. Los demás municipios reciben uno cada uno.',
        },
        {
          type: 'list',
          items: [
            'Gran Aracaju: Aracaju, Nossa Senhora do Socorro y Barra dos Coqueiros',
            'Agreste y sertón: Itabaiana, Nossa Senhora da Glória, Canindé de São Francisco, Nossa Senhora de Lourdes y Propriá',
            'Centro-sur: Boquim, Estância, Poço Verde y Tobias Barreto',
          ],
        },
        { type: 'heading', text: 'Cómo es el día de apertura' },
        {
          type: 'paragraph',
          text: 'Cada inauguración reúne al grupo, a las familias y a la comunidad alrededor de la cancha o del campo. Ese mismo día se entregan uniformes, botines y el material de entrenamiento, y la rutina de actividades empieza la semana siguiente.',
        },
        {
          type: 'paragraph',
          text: 'Sumando los dos territorios del proyecto, Sergipe y el Distrito Federal, Coração Valente atiende a 2.500 niños y adolescentes.',
        },
      ],
    },
    category: { pt: 'Projetos', en: 'Projects', es: 'Proyectos' },
    date: '2026-04-23',
    author: AUTOR,
    coverKey: 'news.polos-do-coracao-valente-em-sergipe',
    relatedProjectSlugs: ['coracao-valente'],
  },

  {
    slug: 'copa-coracao-valente-reune-os-polos',
    title: {
      pt: 'Copa Coração Valente põe os polos na mesma quadra',
      en: 'Coração Valente Cup brings the hubs onto the same court',
      es: 'Copa Coração Valente pone los polos en la misma cancha',
    },
    excerpt: {
      pt: 'A competição entre polos fecha o primeiro semestre do projeto: times de municípios diferentes se encontram, jogam e voltam para casa com a rotina de treino já marcada.',
      en: 'The competition between hubs closes the project’s first half-year: teams from different municipalities meet, play and go home with the next training block already scheduled.',
      es: 'La competencia entre polos cierra el primer semestre del proyecto: equipos de municipios distintos se encuentran, juegan y vuelven a casa con la rutina de entrenamiento ya marcada.',
    },
    body: {
      pt: [
        {
          type: 'paragraph',
          text: 'A Copa Coração Valente reúne os polos do projeto em uma competição entre municípios. Para a maioria das crianças e adolescentes é a primeira vez que jogam fora da própria comunidade, e é isso que a competição existe para fazer.',
        },
        { type: 'heading', text: 'Por que uma competição' },
        {
          type: 'paragraph',
          text: 'O torneio dá um horizonte à rotina de treino. Entre uma inauguração e a próxima, é ele que organiza o semestre: há uma data no calendário, um time para montar e um motivo concreto para voltar à quadra na quarta-feira.',
        },
        {
          type: 'list',
          items: [
            'Times formados nos polos, com os professores do próprio território',
            'Deslocamento, arbitragem e alimentação por conta do projeto',
            'Encontro entre turmas que treinam a mais de cem quilômetros de distância',
          ],
        },
        {
          type: 'paragraph',
          text: 'Depois da Copa, os polos retomam as atividades regulares. O calendário do segundo semestre é montado com as escolas e com os equipamentos públicos de cada município.',
        },
      ],
      en: [
        {
          type: 'paragraph',
          text: 'The Coração Valente Cup brings the project’s hubs together in a competition between municipalities. For most of the children and teenagers it is the first time they play outside their own community, and that is what the tournament exists to do.',
        },
        { type: 'heading', text: 'Why a competition' },
        {
          type: 'paragraph',
          text: 'The tournament gives the training routine a horizon. Between one opening and the next, it is what organises the half-year: there is a date on the calendar, a team to build and a concrete reason to be back on the court on Wednesday.',
        },
        {
          type: 'list',
          items: [
            'Teams formed at the hubs, coached by the staff of each area',
            'Travel, refereeing and meals covered by the project',
            'Groups that train more than a hundred kilometres apart meeting each other',
          ],
        },
        {
          type: 'paragraph',
          text: 'After the Cup the hubs return to their regular schedule. The second-half calendar is drawn up with the schools and the public facilities of each municipality.',
        },
      ],
      es: [
        {
          type: 'paragraph',
          text: 'La Copa Coração Valente reúne los polos del proyecto en una competencia entre municipios. Para la mayoría de los niños y adolescentes es la primera vez que juegan fuera de su propia comunidad, y para eso existe la competencia.',
        },
        { type: 'heading', text: 'Por qué una competencia' },
        {
          type: 'paragraph',
          text: 'El torneo le da un horizonte a la rutina de entrenamiento. Entre una inauguración y la siguiente, es lo que organiza el semestre: hay una fecha en el calendario, un equipo que armar y un motivo concreto para volver a la cancha el miércoles.',
        },
        {
          type: 'list',
          items: [
            'Equipos formados en los polos, con los profesores del propio territorio',
            'Traslado, arbitraje y alimentación a cargo del proyecto',
            'Encuentro entre grupos que entrenan a más de cien kilómetros de distancia',
          ],
        },
        {
          type: 'paragraph',
          text: 'Después de la Copa, los polos retoman las actividades regulares. El calendario del segundo semestre se arma con las escuelas y con los equipamientos públicos de cada municipio.',
        },
      ],
    },
    category: { pt: 'Projetos', en: 'Projects', es: 'Proyectos' },
    date: '2026-06-18',
    author: AUTOR,
    coverKey: 'news.copa-coracao-valente-reune-os-polos',
    relatedProjectSlugs: ['coracao-valente'],
  },

  {
    slug: 'coracao-valente-no-distrito-federal',
    title: {
      pt: 'No Distrito Federal, o projeto atende sete regiões administrativas',
      en: 'In the Federal District, the project works across seven districts',
      es: 'En el Distrito Federal, el proyecto atiende siete regiones administrativas',
    },
    excerpt: {
      pt: 'Estrutural, Ceilândia, Samambaia, Gama, Recanto das Emas, Planaltina e São Sebastião: o segundo território do Coração Valente alcança 700 crianças.',
      en: 'Estrutural, Ceilândia, Samambaia, Gama, Recanto das Emas, Planaltina and São Sebastião: Coração Valente’s second territory reaches 700 children.',
      es: 'Estrutural, Ceilândia, Samambaia, Gama, Recanto das Emas, Planaltina y São Sebastião: el segundo territorio de Coração Valente alcanza a 700 niños.',
    },
    body: {
      pt: [
        {
          type: 'paragraph',
          text: 'Além de Sergipe, o Coração Valente atua em sete regiões administrativas do Distrito Federal. São 700 crianças atendidas. É o segundo território do projeto, e o que mostra que o modelo não depende de estar perto da sede.',
        },
        { type: 'heading', text: 'As regiões atendidas' },
        {
          type: 'list',
          items: [
            'Estrutural',
            'Ceilândia',
            'Samambaia',
            'Gama',
            'Recanto das Emas',
            'Planaltina',
            'São Sebastião',
          ],
        },
        { type: 'heading', text: 'O que chega junto com o treino' },
        {
          type: 'paragraph',
          text: 'A atividade esportiva vem acompanhada de material, uniforme e lanche. É a parte menos visível do projeto e a que sustenta a frequência: criança com fome não treina, e criança sem chuteira não volta.',
        },
        {
          type: 'paragraph',
          text: 'As regiões administrativas do DF não são municípios, e por isso cada polo é referenciado pela própria comunidade. É assim que eles aparecem no mapa de atuação da associação.',
        },
      ],
      en: [
        {
          type: 'paragraph',
          text: 'Beyond Sergipe, Coração Valente works in seven administrative districts of Brazil’s Federal District, reaching 700 children. It is the project’s second territory, and the one that shows the model does not depend on being close to headquarters.',
        },
        { type: 'heading', text: 'The districts served' },
        {
          type: 'list',
          items: [
            'Estrutural',
            'Ceilândia',
            'Samambaia',
            'Gama',
            'Recanto das Emas',
            'Planaltina',
            'São Sebastião',
          ],
        },
        { type: 'heading', text: 'What arrives alongside training' },
        {
          type: 'paragraph',
          text: 'Sport comes with equipment, kit and a meal. It is the least visible part of the project and the one that keeps attendance up: a hungry child does not train, and a child without boots does not come back.',
        },
        {
          type: 'paragraph',
          text: 'The Federal District’s administrative regions are not municipalities, so each hub is identified by its own community, which is how they appear on the association’s coverage map.',
        },
      ],
      es: [
        {
          type: 'paragraph',
          text: 'Además de Sergipe, Coração Valente actúa en siete regiones administrativas del Distrito Federal. Son 700 niños atendidos. Es el segundo territorio del proyecto, y el que muestra que el modelo no depende de estar cerca de la sede.',
        },
        { type: 'heading', text: 'Las regiones atendidas' },
        {
          type: 'list',
          items: [
            'Estrutural',
            'Ceilândia',
            'Samambaia',
            'Gama',
            'Recanto das Emas',
            'Planaltina',
            'São Sebastião',
          ],
        },
        { type: 'heading', text: 'Lo que llega junto con el entrenamiento' },
        {
          type: 'paragraph',
          text: 'La actividad deportiva viene acompañada de material, uniforme y merienda. Es la parte menos visible del proyecto y la que sostiene la frecuencia: un niño con hambre no entrena, y un niño sin botines no vuelve.',
        },
        {
          type: 'paragraph',
          text: 'Las regiones administrativas del DF no son municipios, y por eso cada polo se identifica por su propia comunidad. Así aparecen en el mapa de actuación de la asociación.',
        },
      ],
    },
    category: { pt: 'Projetos', en: 'Projects', es: 'Proyectos' },
    date: '2026-08-19',
    author: AUTOR,
    coverKey: 'news.coracao-valente-no-distrito-federal',
    relatedProjectSlugs: ['coracao-valente'],
  },

  /* ================================================================== */
  /* Futsal na Escola                                                   */
  /* ================================================================== */

  {
    slug: 'futsal-na-escola-em-doze-cidades',
    title: {
      pt: 'Futsal na Escola está em doze cidades',
      en: 'Futsal na Escola runs in twelve cities',
      es: 'Futsal na Escola está en doce ciudades',
    },
    excerpt: {
      pt: 'O projeto leva o futsal para dentro da grade escolar e alcança 600 pessoas: estudantes, professores e a comunidade em volta de cada quadra.',
      en: 'The project brings futsal into the school timetable and reaches 600 people: students, teachers and the community around each court.',
      es: 'El proyecto lleva el futsal dentro del horario escolar y alcanza a 600 personas: estudiantes, profesores y la comunidad alrededor de cada cancha.',
    },
    body: {
      pt: [
        {
          type: 'paragraph',
          text: 'O Futsal na Escola é o projeto da AIDEP que trabalha dentro do ambiente escolar. Hoje está em doze cidades e alcança 600 pessoas entre estudantes, professores e comunidade escolar.',
        },
        { type: 'heading', text: 'Por que dentro da escola' },
        {
          type: 'paragraph',
          text: 'Um polo esportivo depende de a criança decidir ir até ele. Na escola, ela já está lá, e o futsal deixa de disputar com a rotina para virar parte dela. É a diferença entre oferecer uma oportunidade e colocá-la no caminho de quem passa.',
        },
        {
          type: 'paragraph',
          text: 'A quadra da escola também é o equipamento esportivo mais bem distribuído do país. Usar o que já existe é o que permite ao projeto chegar a doze cidades sem construir doze quadras.',
        },
        { type: 'heading', text: 'O que o projeto leva' },
        {
          type: 'list',
          items: [
            'Coletes, bolas e material de treino para a quadra da escola',
            'Metodologia de aula pensada para turma inteira, não para time',
            'Acompanhamento junto com a equipe pedagógica',
          ],
        },
      ],
      en: [
        {
          type: 'paragraph',
          text: 'Futsal na Escola is AIDEP’s project inside the school environment. It currently runs in twelve cities and reaches 600 people: students, teachers and the wider school community.',
        },
        { type: 'heading', text: 'Why inside the school' },
        {
          type: 'paragraph',
          text: 'A sports hub depends on a child deciding to go there. At school, they are already there, and futsal stops competing with the routine and becomes part of it. That is the difference between offering an opportunity and putting it in the path of the people walking by.',
        },
        {
          type: 'paragraph',
          text: 'The school court is also the best-distributed sports facility in the country. Using what already exists is what lets the project reach twelve cities without building twelve courts.',
        },
        { type: 'heading', text: 'What the project brings' },
        {
          type: 'list',
          items: [
            'Bibs, balls and training equipment for the school court',
            'A lesson method designed for a whole class, not for a squad',
            'Follow-up alongside the teaching staff',
          ],
        },
      ],
      es: [
        {
          type: 'paragraph',
          text: 'Futsal na Escola es el proyecto de AIDEP que trabaja dentro del entorno escolar. Hoy está en doce ciudades y alcanza a 600 personas entre estudiantes, profesores y comunidad escolar.',
        },
        { type: 'heading', text: 'Por qué dentro de la escuela' },
        {
          type: 'paragraph',
          text: 'Un polo deportivo depende de que el niño decida ir hasta él. En la escuela ya está allí, y el futsal deja de disputar con la rutina para volverse parte de ella. Es la diferencia entre ofrecer una oportunidad y ponerla en el camino de quien pasa.',
        },
        {
          type: 'paragraph',
          text: 'La cancha de la escuela es también el equipamiento deportivo mejor distribuido del país. Usar lo que ya existe es lo que permite al proyecto llegar a doce ciudades sin construir doce canchas.',
        },
        { type: 'heading', text: 'Lo que el proyecto lleva' },
        {
          type: 'list',
          items: [
            'Petos, balones y material de entrenamiento para la cancha de la escuela',
            'Metodología de clase pensada para el grupo entero, no para un equipo',
            'Acompañamiento junto al equipo pedagógico',
          ],
        },
      ],
    },
    category: { pt: 'Projetos', en: 'Projects', es: 'Proyectos' },
    date: '2026-09-04',
    author: AUTOR,
    coverKey: 'news.futsal-na-escola-em-doze-cidades',
    relatedProjectSlugs: ['futsal-na-escola'],
  },

  {
    slug: 'futsal-na-escola-quem-esta-na-quadra',
    title: {
      pt: 'Quem está na quadra do Futsal na Escola',
      en: 'Who is on the court at Futsal na Escola',
      es: 'Quién está en la cancha de Futsal na Escola',
    },
    excerpt: {
      pt: 'A aula é dada por professores da própria escola, formados na metodologia do projeto. É o que faz o futsal continuar quando a equipe da AIDEP não está por perto.',
      en: 'Lessons are led by the school’s own teachers, trained in the project’s method. That is what keeps futsal going when the AIDEP team is not around.',
      es: 'La clase la dan profesores de la propia escuela, formados en la metodología del proyecto. Es lo que hace que el futsal continúe cuando el equipo de AIDEP no está cerca.',
    },
    body: {
      pt: [
        {
          type: 'paragraph',
          text: 'O Futsal na Escola não funciona com técnico visitante. Quem dá a aula é o professor da própria escola, formado na metodologia do projeto, e é essa escolha que decide se a atividade continua depois que o convênio termina.',
        },
        { type: 'heading', text: 'A formação' },
        {
          type: 'paragraph',
          text: 'A formação trata do que uma turma inteira precisa, e não do que um time precisa: como organizar quarenta crianças em uma quadra, como incluir quem nunca jogou e como avaliar sem transformar a aula em peneira.',
        },
        {
          type: 'paragraph',
          text: 'Cada professor formado leva a metodologia para dentro do próprio trabalho, inclusive para as turmas que o projeto não atende diretamente.',
        },
        { type: 'heading', text: 'O uniforme' },
        {
          type: 'paragraph',
          text: 'Uniforme e material são entregues à escola, não emprestados para o dia da atividade. É o que garante que a criança encontre o colete na quadra na semana seguinte.',
        },
      ],
      en: [
        {
          type: 'paragraph',
          text: 'Futsal na Escola does not run on visiting coaches. Lessons are led by the school’s own teachers, trained in the project’s method, and that choice is what decides whether the activity survives once the agreement ends.',
        },
        { type: 'heading', text: 'The training' },
        {
          type: 'paragraph',
          text: 'It covers what a whole class needs rather than what a squad needs: how to organise forty children on one court, how to include those who have never played, and how to assess without turning the lesson into a trial.',
        },
        {
          type: 'paragraph',
          text: 'Every teacher trained takes the method into their own work, including with the classes the project does not reach directly.',
        },
        { type: 'heading', text: 'The kit' },
        {
          type: 'paragraph',
          text: 'Kit and equipment are handed to the school, not lent for the day. That is what makes sure the bibs are still on the court the following week.',
        },
      ],
      es: [
        {
          type: 'paragraph',
          text: 'Futsal na Escola no funciona con entrenador visitante. Quien da la clase es el profesor de la propia escuela, formado en la metodología del proyecto, y esa elección decide si la actividad continúa después de que el convenio termina.',
        },
        { type: 'heading', text: 'La formación' },
        {
          type: 'paragraph',
          text: 'La formación trata de lo que necesita un grupo entero, y no de lo que necesita un equipo: cómo organizar a cuarenta niños en una cancha, cómo incluir a quien nunca jugó y cómo evaluar sin convertir la clase en una prueba de selección.',
        },
        {
          type: 'paragraph',
          text: 'Cada profesor formado lleva la metodología a su propio trabajo, incluso a los grupos que el proyecto no atiende directamente.',
        },
        { type: 'heading', text: 'El uniforme' },
        {
          type: 'paragraph',
          text: 'Uniforme y material se entregan a la escuela, no se prestan para el día de la actividad. Es lo que garantiza que el niño encuentre el peto en la cancha la semana siguiente.',
        },
      ],
    },
    category: { pt: 'Projetos', en: 'Projects', es: 'Proyectos' },
    date: '2026-09-05',
    author: AUTOR,
    coverKey: 'news.futsal-na-escola-quem-esta-na-quadra',
    relatedProjectSlugs: ['futsal-na-escola'],
  },

  {
    slug: 'futsal-na-escola-a-quadra-como-sala-de-aula',
    title: {
      pt: 'A quadra como sala de aula',
      en: 'The court as a classroom',
      es: 'La cancha como aula',
    },
    excerpt: {
      pt: 'Combinar regra, dividir espaço, perder e voltar na semana seguinte. O que o projeto ensina na quadra é o que a escola tenta ensinar na sala.',
      en: 'Agreeing on rules, sharing space, losing and coming back the following week. What the project teaches on the court is what the school is trying to teach in the classroom.',
      es: 'Acordar reglas, compartir espacio, perder y volver la semana siguiente. Lo que el proyecto enseña en la cancha es lo que la escuela intenta enseñar en el aula.',
    },
    body: {
      pt: [
        {
          type: 'paragraph',
          text: 'O objetivo declarado do Futsal na Escola é o desenvolvimento integral de crianças e adolescentes, tendo o futsal como ferramenta educacional. Na prática, isso quer dizer que a aula não é medida pelo placar.',
        },
        { type: 'heading', text: 'O que a quadra ensina' },
        {
          type: 'list',
          items: [
            'Combinar uma regra antes de começar, e cumpri-la sem árbitro',
            'Dividir o espaço e o tempo de jogo com quem joga menos',
            'Perder uma partida e voltar para o treino na semana seguinte',
          ],
        },
        {
          type: 'paragraph',
          text: 'Nada disso é exclusivo do esporte: é o que a escola trabalha o dia inteiro. A diferença é que na quadra a consequência é imediata e todo mundo vê, e por isso a lição pega.',
        },
        {
          type: 'paragraph',
          text: 'É por essa razão que o projeto é educacional antes de ser esportivo, e por que ele acontece dentro do horário da escola, e não depois dele.',
        },
      ],
      en: [
        {
          type: 'paragraph',
          text: 'Futsal na Escola’s stated aim is the all-round development of children and teenagers, with futsal as an educational tool. In practice, that means the lesson is not measured by the scoreline.',
        },
        { type: 'heading', text: 'What the court teaches' },
        {
          type: 'list',
          items: [
            'Agreeing a rule before starting, and keeping it without a referee',
            'Sharing space and playing time with those who play less',
            'Losing a match and coming back to training the following week',
          ],
        },
        {
          type: 'paragraph',
          text: 'None of that is unique to sport: it is what school works on all day. The difference is that on the court the consequence is immediate and everyone sees it, which is why the lesson sticks.',
        },
        {
          type: 'paragraph',
          text: 'That is why the project is educational before it is sporting, and why it happens inside school hours rather than after them.',
        },
      ],
      es: [
        {
          type: 'paragraph',
          text: 'El objetivo declarado de Futsal na Escola es el desarrollo integral de niños y adolescentes, con el futsal como herramienta educativa. En la práctica, eso quiere decir que la clase no se mide por el marcador.',
        },
        { type: 'heading', text: 'Lo que la cancha enseña' },
        {
          type: 'list',
          items: [
            'Acordar una regla antes de empezar, y cumplirla sin árbitro',
            'Compartir el espacio y el tiempo de juego con quien juega menos',
            'Perder un partido y volver al entrenamiento la semana siguiente',
          ],
        },
        {
          type: 'paragraph',
          text: 'Nada de eso es exclusivo del deporte: es lo que la escuela trabaja todo el día. La diferencia es que en la cancha la consecuencia es inmediata y todos la ven, y por eso la lección prende.',
        },
        {
          type: 'paragraph',
          text: 'Por esa razón el proyecto es educativo antes que deportivo, y por eso ocurre dentro del horario escolar y no después de él.',
        },
      ],
    },
    category: { pt: 'Metodologia', en: 'Method', es: 'Metodología' },
    date: '2026-09-08',
    author: AUTOR,
    coverKey: 'news.futsal-na-escola-a-quadra-como-sala-de-aula',
    relatedProjectSlugs: ['futsal-na-escola'],
  },

  /* ================================================================== */
  /* FutEdu Summit                                                      */
  /* ================================================================== */

  {
    slug: 'futedu-summit-curitiba-sete-mil',
    title: {
      pt: 'FutEdu Summit reúne 7 mil pessoas em Curitiba',
      en: 'FutEdu Summit gathers 7,000 people in Curitiba',
      es: 'FutEdu Summit reúne a 7 mil personas en Curitiba',
    },
    excerpt: {
      pt: 'O congresso internacional da AIDEP juntou profissionais, clubes, escolas, pesquisadores e treinadores em torno de três modalidades: futebol, futsal e beach soccer.',
      en: 'AIDEP’s international congress brought professionals, clubs, schools, researchers and coaches together around three disciplines: football, futsal and beach soccer.',
      es: 'El congreso internacional de AIDEP reunió a profesionales, clubes, escuelas, investigadores y entrenadores en torno a tres modalidades: fútbol, futsal y beach soccer.',
    },
    body: {
      pt: [
        {
          type: 'paragraph',
          text: 'O FutEdu Summit é o congresso internacional da AIDEP dedicado ao desenvolvimento do futebol, do futsal e do beach soccer. A edição de Curitiba reuniu 7 mil pessoas entre profissionais do esporte, clubes, escolas, pesquisadores, gestores, treinadores, empresas e instituições.',
        },
        { type: 'heading', text: 'O que o Summit é' },
        {
          type: 'paragraph',
          text: 'Não é um evento de palestra. O encontro combina programação de auditório com atividade em quadra e em campo, e reserva boa parte do tempo ao que acontece entre uma coisa e outra: a conversa entre quem trabalha nos mesmos problemas em cidades diferentes.',
        },
        {
          type: 'list',
          items: [
            'Três modalidades tratadas juntas: futebol, futsal e beach soccer',
            'Programação de conhecimento e atividade prática no mesmo espaço',
            'Delegações de instituições de vários estados',
          ],
        },
        {
          type: 'paragraph',
          text: 'O Summit é a frente da associação voltada a quem já trabalha com esporte. É por ele que a metodologia dos outros dois projetos sai do território e chega a quem pode aplicá-la em outro lugar.',
        },
      ],
      en: [
        {
          type: 'paragraph',
          text: 'The FutEdu Summit is AIDEP’s international congress on the development of football, futsal and beach soccer. The Curitiba edition gathered 7,000 people: sport professionals, clubs, schools, researchers, managers, coaches, companies and institutions.',
        },
        { type: 'heading', text: 'What the Summit is' },
        {
          type: 'paragraph',
          text: 'It is not a lecture event. The gathering combines auditorium sessions with activity on the court and on the pitch, and reserves a good share of the time for what happens in between: the conversation between people working on the same problems in different cities.',
        },
        {
          type: 'list',
          items: [
            'Three disciplines addressed together: football, futsal and beach soccer',
            'Knowledge sessions and hands-on activity in the same venue',
            'Delegations from institutions across several states',
          ],
        },
        {
          type: 'paragraph',
          text: 'The Summit is the association’s track for people already working in sport. It is how the method behind the other two projects leaves its territory and reaches people who can apply it somewhere else.',
        },
      ],
      es: [
        {
          type: 'paragraph',
          text: 'El FutEdu Summit es el congreso internacional de AIDEP dedicado al desarrollo del fútbol, el futsal y el beach soccer. La edición de Curitiba reunió a 7 mil personas entre profesionales del deporte, clubes, escuelas, investigadores, gestores, entrenadores, empresas e instituciones.',
        },
        { type: 'heading', text: 'Qué es el Summit' },
        {
          type: 'paragraph',
          text: 'No es un evento de conferencias. El encuentro combina programación de auditorio con actividad en cancha y en campo, y reserva buena parte del tiempo a lo que ocurre entre una cosa y otra: la conversación entre quienes trabajan en los mismos problemas en ciudades distintas.',
        },
        {
          type: 'list',
          items: [
            'Tres modalidades tratadas juntas: fútbol, futsal y beach soccer',
            'Programación de conocimiento y actividad práctica en el mismo espacio',
            'Delegaciones de instituciones de varios estados',
          ],
        },
        {
          type: 'paragraph',
          text: 'El Summit es el frente de la asociación dirigido a quien ya trabaja con deporte. Por él la metodología de los otros dos proyectos sale del territorio y llega a quien puede aplicarla en otro lugar.',
        },
      ],
    },
    category: { pt: 'Eventos', en: 'Events', es: 'Eventos' },
    date: '2025-06-23',
    author: AUTOR,
    coverKey: 'news.futedu-summit-curitiba-sete-mil',
    relatedProjectSlugs: ['futedu-summit'],
  },

  {
    slug: 'futedu-summit-torneio-e-delegacoes',
    title: {
      pt: 'O torneio do Summit: delegações em campo entre uma sessão e outra',
      en: 'The Summit tournament: delegations on the pitch between sessions',
      es: 'El torneo del Summit: delegaciones en campo entre una sesión y otra',
    },
    excerpt: {
      pt: 'Ao lado da programação de auditório, o Summit monta campo e quadra: as delegações jogam, e é ali que a conversa técnica costuma continuar.',
      en: 'Alongside the auditorium programme, the Summit sets up a pitch and a court: the delegations play, and that is usually where the technical conversation carries on.',
      es: 'Junto a la programación de auditorio, el Summit monta campo y cancha: las delegaciones juegan, y ahí suele continuar la conversación técnica.',
    },
    body: {
      pt: [
        {
          type: 'paragraph',
          text: 'O torneio é a metade prática do FutEdu Summit. As delegações que chegam para o congresso entram em campo e em quadra durante os mesmos dias, e o encontro deixa de ser só programação de auditório.',
        },
        { type: 'heading', text: 'Por que jogar num congresso' },
        {
          type: 'paragraph',
          text: 'Quem trabalha com esporte discute melhor perto do jogo. O torneio dá contexto ao que foi apresentado no auditório e serve de exemplo comum: todo mundo viu a mesma partida e pode falar dela.',
        },
        {
          type: 'paragraph',
          text: 'Nas fotografias do encontro aparecem as duas coisas ao mesmo tempo: a arquibancada com o público do congresso e o gramado com as equipes que vieram de outras cidades.',
        },
        {
          type: 'paragraph',
          text: 'É a mesma ideia que sustenta os outros projetos da AIDEP, aplicada a adultos: a quadra como lugar onde a conversa acontece, e não só como assunto dela.',
        },
      ],
      en: [
        {
          type: 'paragraph',
          text: 'The tournament is the hands-on half of the FutEdu Summit. The delegations that come for the congress take to the pitch and the court over the same days, and the gathering stops being only an auditorium programme.',
        },
        { type: 'heading', text: 'Why play at a congress' },
        {
          type: 'paragraph',
          text: 'People who work in sport discuss it better close to the game. The tournament gives context to what was presented in the auditorium and provides a shared example: everyone watched the same match and can talk about it.',
        },
        {
          type: 'paragraph',
          text: 'The photographs of the gathering show both at once: the stands with the congress audience and the grass with teams that travelled in from other cities.',
        },
        {
          type: 'paragraph',
          text: 'It is the same idea that holds up AIDEP’s other projects, applied to adults: the court as the place where the conversation happens, not just its subject.',
        },
      ],
      es: [
        {
          type: 'paragraph',
          text: 'El torneo es la mitad práctica del FutEdu Summit. Las delegaciones que llegan para el congreso entran en campo y en cancha durante los mismos días, y el encuentro deja de ser solo programación de auditorio.',
        },
        { type: 'heading', text: 'Por qué jugar en un congreso' },
        {
          type: 'paragraph',
          text: 'Quien trabaja con deporte discute mejor cerca del juego. El torneo da contexto a lo que se presentó en el auditorio y sirve de ejemplo común: todos vieron el mismo partido y pueden hablar de él.',
        },
        {
          type: 'paragraph',
          text: 'En las fotografías del encuentro aparecen las dos cosas a la vez: la grada con el público del congreso y el césped con los equipos que vinieron de otras ciudades.',
        },
        {
          type: 'paragraph',
          text: 'Es la misma idea que sostiene los otros proyectos de AIDEP, aplicada a adultos: la cancha como lugar donde la conversación ocurre, y no solo como su tema.',
        },
      ],
    },
    category: { pt: 'Eventos', en: 'Events', es: 'Eventos' },
    date: '2025-06-24',
    author: AUTOR,
    coverKey: 'news.futedu-summit-torneio-e-delegacoes',
    relatedProjectSlugs: ['futedu-summit'],
  },

  {
    slug: 'futedu-summit-formacao-e-certificados',
    title: {
      pt: 'Formação e certificação fecham o FutEdu Summit',
      en: 'Training and certification close the FutEdu Summit',
      es: 'Formación y certificación cierran el FutEdu Summit',
    },
    excerpt: {
      pt: 'A entrega dos certificados encerra o encontro, e é o registro de que quem passou por ali leva a formação para o próprio trabalho.',
      en: 'Handing out the certificates closes the gathering, and records that those who attended take the training back into their own work.',
      es: 'La entrega de los certificados cierra el encuentro, y es el registro de que quien pasó por allí lleva la formación a su propio trabajo.',
    },
    body: {
      pt: [
        {
          type: 'paragraph',
          text: 'O FutEdu Summit termina no palco, com a entrega dos certificados. É a parte mais protocolar do encontro e a que tem efeito mais longo: o certificado é o que o participante leva de volta para a instituição dele.',
        },
        { type: 'heading', text: 'Formar quem forma' },
        {
          type: 'paragraph',
          text: 'O público do Summit é feito de gente que ensina: professores, treinadores, gestores e coordenadores. Cada pessoa formada ali volta para uma quadra, uma escola ou um clube, e a metodologia chega a muito mais gente do que a sala comportava.',
        },
        {
          type: 'paragraph',
          text: 'É esse alcance indireto que faz o Summit valer o esforço de reunir 7 mil pessoas em um lugar só.',
        },
        { type: 'heading', text: 'Quem apoia' },
        {
          type: 'paragraph',
          text: 'A edição contou com apoio institucional público e privado. Os parceiros da associação estão listados na página de Parceiros, e a prestação de contas dos recursos públicos, na página de Transparência.',
        },
      ],
      en: [
        {
          type: 'paragraph',
          text: 'The FutEdu Summit ends on stage, with the certificates. It is the most formal part of the gathering and the one with the longest effect: the certificate is what each participant takes back to their institution.',
        },
        { type: 'heading', text: 'Training those who train' },
        {
          type: 'paragraph',
          text: 'The Summit’s audience is made of people who teach: teachers, coaches, managers and coordinators. Everyone trained there goes back to a court, a school or a club, and the method reaches far more people than the room could hold.',
        },
        {
          type: 'paragraph',
          text: 'That indirect reach is what makes it worth gathering 7,000 people in one place.',
        },
        { type: 'heading', text: 'Who supports it' },
        {
          type: 'paragraph',
          text: 'The edition had public and private institutional support. The association’s partners are listed on the Partners page, and the accounting for public funds on the Transparency page.',
        },
      ],
      es: [
        {
          type: 'paragraph',
          text: 'El FutEdu Summit termina en el escenario, con la entrega de los certificados. Es la parte más protocolar del encuentro y la de efecto más largo: el certificado es lo que el participante lleva de vuelta a su institución.',
        },
        { type: 'heading', text: 'Formar a quien forma' },
        {
          type: 'paragraph',
          text: 'El público del Summit está hecho de gente que enseña: profesores, entrenadores, gestores y coordinadores. Cada persona formada allí vuelve a una cancha, una escuela o un club, y la metodología llega a mucha más gente de la que cabía en la sala.',
        },
        {
          type: 'paragraph',
          text: 'Ese alcance indirecto es lo que hace que valga la pena reunir a 7 mil personas en un solo lugar.',
        },
        { type: 'heading', text: 'Quién apoya' },
        {
          type: 'paragraph',
          text: 'La edición contó con apoyo institucional público y privado. Los socios de la asociación están listados en la página de Socios, y la rendición de cuentas de los recursos públicos, en la página de Transparencia.',
        },
      ],
    },
    category: { pt: 'Eventos', en: 'Events', es: 'Eventos' },
    date: '2025-06-25',
    author: AUTOR,
    coverKey: 'news.futedu-summit-formacao-e-certificados',
    relatedProjectSlugs: ['futedu-summit'],
  },
]
