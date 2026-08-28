import type { NewsArticle } from './types'

/**
 * NOTÍCIAS DE EXEMPLO
 * ===================
 * Conteúdo de DEMONSTRAÇÃO. Nenhuma notícia abaixo foi publicada pela
 * AIDEP: os textos são plausíveis de propósito — para que a lista, a
 * página de leitura, as notícias relacionadas, o compartilhamento e a
 * seção da Home possam ser avaliados como ficarão no ar —, mas não
 * relatam fato ocorrido, não trazem números de atendimento e não atribuem
 * fala a nenhuma pessoa real.
 *
 * Estão no ar enquanto o conteúdo de exemplo estiver ligado — o padrão,
 * ver `lib/example-content.ts`. Com `NEXT_PUBLIC_EXAMPLE_CONTENT=0` a lista
 * volta a ser vazia: a página de Notícias exibe o estado vazio
 * institucional e a Home não renderiza a seção.
 *
 * Para publicar notícia real: cadastre em `content/news.ts` — a estrutura
 * é a mesma daqui — e apague este arquivo quando ele não fizer mais falta.
 */
export const exampleNews: NewsArticle[] = [
  {
    slug: 'futedu-summit-2026-inscricoes',
    title: {
      pt: 'FutEdu Summit 2026: inscrições abrem em setembro',
      en: 'FutEdu Summit 2026: registration opens in September',
      es: 'FutEdu Summit 2026: las inscripciones abren en septiembre',
    },
    excerpt: {
      pt: 'O encontro de esporte e educação da AIDEP volta a reunir educadores, técnicos e gestores públicos para três dias de painéis, oficinas e troca de metodologia.',
      en: 'AIDEP’s sport and education gathering brings educators, coaches and public managers together again for three days of panels, workshops and methodology exchange.',
      es: 'El encuentro de deporte y educación de AIDEP vuelve a reunir a educadores, técnicos y gestores públicos durante tres días de paneles, talleres e intercambio de metodología.',
    },
    body: {
      pt: [
        {
          type: 'paragraph',
          text: 'O FutEdu Summit é o encontro da AIDEP dedicado ao cruzamento entre esporte e educação. A edição de 2026 mantém o formato de três dias, com painéis abertos ao público, oficinas práticas para educadores e espaços de trabalho reservados às instituições parceiras.',
        },
        { type: 'heading', text: 'O que esperar da programação' },
        {
          type: 'paragraph',
          text: 'A programação é organizada em três frentes, pensadas para que quem chega ao encontro saia com material aplicável no dia seguinte, na própria quadra ou na própria escola.',
        },
        {
          type: 'list',
          items: [
            'Painéis abertos sobre esporte, educação e políticas públicas',
            'Oficinas práticas de metodologia para professores e técnicos',
            'Encontros de articulação entre associações, escolas e poder público',
          ],
        },
        {
          type: 'quote',
          text: 'Formar quem forma é o caminho mais curto para chegar a mais crianças.',
          cite: 'Coordenação técnica da AIDEP',
        },
        {
          type: 'paragraph',
          text: 'As inscrições abrem em setembro. A programação completa, o local do encontro e as condições de participação serão divulgados nesta página e no perfil oficial da associação.',
        },
      ],
      en: [
        {
          type: 'paragraph',
          text: 'The FutEdu Summit is AIDEP’s gathering dedicated to where sport and education meet. The 2026 edition keeps the three-day format, with panels open to the public, hands-on workshops for educators and working sessions reserved for partner institutions.',
        },
        { type: 'heading', text: 'What the programme looks like' },
        {
          type: 'paragraph',
          text: 'The programme is organised along three tracks, designed so that everyone who attends leaves with material they can apply the next day, on their own court or in their own school.',
        },
        {
          type: 'list',
          items: [
            'Open panels on sport, education and public policy',
            'Hands-on methodology workshops for teachers and coaches',
            'Working sessions between associations, schools and public authorities',
          ],
        },
        {
          type: 'quote',
          text: 'Training those who train is the shortest path to reaching more children.',
          cite: 'AIDEP technical coordination',
        },
        {
          type: 'paragraph',
          text: 'Registration opens in September. The full programme, the venue and the terms of participation will be published on this page and on the association’s official profile.',
        },
      ],
      es: [
        {
          type: 'paragraph',
          text: 'El FutEdu Summit es el encuentro de AIDEP dedicado al cruce entre deporte y educación. La edición de 2026 mantiene el formato de tres días, con paneles abiertos al público, talleres prácticos para educadores y espacios de trabajo reservados a las instituciones socias.',
        },
        { type: 'heading', text: 'Qué esperar de la programación' },
        {
          type: 'paragraph',
          text: 'La programación se organiza en tres frentes, pensados para que quien llega al encuentro salga con material aplicable al día siguiente, en su propia cancha o en su propia escuela.',
        },
        {
          type: 'list',
          items: [
            'Paneles abiertos sobre deporte, educación y políticas públicas',
            'Talleres prácticos de metodología para profesores y técnicos',
            'Encuentros de articulación entre asociaciones, escuelas y poder público',
          ],
        },
        {
          type: 'quote',
          text: 'Formar a quien forma es el camino más corto para llegar a más niños.',
          cite: 'Coordinación técnica de AIDEP',
        },
        {
          type: 'paragraph',
          text: 'Las inscripciones abren en septiembre. La programación completa, el lugar del encuentro y las condiciones de participación se publicarán en esta página y en el perfil oficial de la asociación.',
        },
      ],
    },
    category: { pt: 'Eventos', en: 'Events', es: 'Eventos' },
    date: '2026-08-12',
    author: 'Comunicação AIDEP',
    coverKey: 'news.futedu-summit-2026-inscricoes',
    relatedProjectSlugs: ['futedu-summit'],
  },

  {
    slug: 'prestacao-de-contas-primeiro-semestre-2026',
    title: {
      pt: 'AIDEP publica a prestação de contas do 1º semestre de 2026',
      en: 'AIDEP publishes its accountability report for the first half of 2026',
      es: 'AIDEP publica la rendición de cuentas del primer semestre de 2026',
    },
    excerpt: {
      pt: 'Os documentos do período já estão na página de Transparência, com filtro por ano e por categoria, visualização e download.',
      en: 'The documents for the period are now on the Transparency page, with filters by year and category, viewing and download.',
      es: 'Los documentos del período ya están en la página de Transparencia, con filtro por año y por categoría, visualización y descarga.',
    },
    body: {
      pt: [
        {
          type: 'paragraph',
          text: 'A prestação de contas da AIDEP é preparada mensalmente e publicada integralmente na página de Transparência. O conjunto do primeiro semestre reúne a origem e a aplicação dos recursos, as demonstrações contábeis do exercício anterior e os relatórios de cada projeto.',
        },
        { type: 'heading', text: 'O que está publicado' },
        {
          type: 'list',
          items: [
            'Prestação de contas do semestre, com origem e aplicação dos recursos',
            'Demonstrações contábeis do exercício anterior',
            'Relatórios de atividades por projeto',
            'Planilha aberta de repasses, para consulta e recálculo',
          ],
        },
        {
          type: 'paragraph',
          text: 'Todos os arquivos podem ser visualizados no navegador ou baixados. Documentos anteriores permanecem no ar: o histórico não é removido da página.',
        },
        {
          type: 'paragraph',
          text: 'Dúvidas sobre qualquer documento podem ser enviadas pelo canal de contato da associação.',
        },
      ],
      en: [
        {
          type: 'paragraph',
          text: 'AIDEP’s accountability reporting is prepared monthly and published in full on the Transparency page. The set for the first half of the year covers the origin and application of funds, the previous year’s financial statements and the report for each project.',
        },
        { type: 'heading', text: 'What is published' },
        {
          type: 'list',
          items: [
            'Accountability report for the half-year, with origin and application of funds',
            'Financial statements for the previous year',
            'Activity reports by project',
            'Open spreadsheet of transfers, for review and recalculation',
          ],
        },
        {
          type: 'paragraph',
          text: 'Every file can be viewed in the browser or downloaded. Earlier documents stay online: the page keeps the full history.',
        },
        {
          type: 'paragraph',
          text: 'Questions about any document can be sent through the association’s contact channel.',
        },
      ],
      es: [
        {
          type: 'paragraph',
          text: 'La rendición de cuentas de AIDEP se prepara mensualmente y se publica íntegramente en la página de Transparencia. El conjunto del primer semestre reúne el origen y la aplicación de los recursos, los estados contables del ejercicio anterior y los informes de cada proyecto.',
        },
        { type: 'heading', text: 'Qué está publicado' },
        {
          type: 'list',
          items: [
            'Rendición de cuentas del semestre, con origen y aplicación de los recursos',
            'Estados contables del ejercicio anterior',
            'Informes de actividades por proyecto',
            'Planilla abierta de transferencias, para consulta y recálculo',
          ],
        },
        {
          type: 'paragraph',
          text: 'Todos los archivos pueden verse en el navegador o descargarse. Los documentos anteriores siguen disponibles: el historial no se retira de la página.',
        },
        {
          type: 'paragraph',
          text: 'Las dudas sobre cualquier documento pueden enviarse por el canal de contacto de la asociación.',
        },
      ],
    },
    category: { pt: 'Transparência', en: 'Transparency', es: 'Transparencia' },
    date: '2026-08-10',
    author: 'Comunicação AIDEP',
    coverKey: 'news.prestacao-de-contas-primeiro-semestre-2026',
    relatedProjectSlugs: [],
  },

  {
    slug: 'coracao-valente-nova-turma-aracaju',
    title: {
      pt: 'Coração Valente abre nova turma em Aracaju',
      en: 'Coração Valente opens a new group in Aracaju',
      es: 'Coração Valente abre un nuevo grupo en Aracaju',
    },
    excerpt: {
      pt: 'Novo grupo de crianças e adolescentes começa as atividades no polo esportivo da capital sergipana, com treinos semanais e acompanhamento pedagógico.',
      en: 'A new group of children and teenagers begins activities at the sports hub in Aracaju, with weekly training and educational follow-up.',
      es: 'Un nuevo grupo de niños y adolescentes comienza las actividades en el polo deportivo de Aracaju, con entrenamientos semanales y acompañamiento pedagógico.',
    },
    body: {
      pt: [
        {
          type: 'paragraph',
          text: 'O Projeto Social Coração Valente abre uma nova turma no polo esportivo de Aracaju. As atividades seguem o calendário escolar e combinam treino, formação e acompanhamento das famílias.',
        },
        { type: 'heading', text: 'Como participar' },
        {
          type: 'paragraph',
          text: 'A participação é gratuita. As inscrições são feitas presencialmente no polo esportivo, com a presença de um responsável, enquanto houver vagas na turma.',
        },
        {
          type: 'list',
          items: [
            'Treinos semanais em horário alternado ao da escola',
            'Material esportivo fornecido pelo projeto',
            'Acompanhamento pedagógico e reuniões periódicas com as famílias',
          ],
        },
        {
          type: 'paragraph',
          text: 'A abertura de novas turmas depende da estrutura disponível em cada polo e das parcerias firmadas no território.',
        },
      ],
      en: [
        {
          type: 'paragraph',
          text: 'The Coração Valente social project is opening a new group at the Aracaju sports hub. Activities follow the school calendar and combine training, education and follow-up with families.',
        },
        { type: 'heading', text: 'How to take part' },
        {
          type: 'paragraph',
          text: 'Taking part is free of charge. Registration happens in person at the sports hub, accompanied by a guardian, while places remain available.',
        },
        {
          type: 'list',
          items: [
            'Weekly training outside school hours',
            'Sports equipment provided by the project',
            'Educational follow-up and regular meetings with families',
          ],
        },
        {
          type: 'paragraph',
          text: 'Opening new groups depends on the facilities available at each hub and on the partnerships established locally.',
        },
      ],
      es: [
        {
          type: 'paragraph',
          text: 'El Proyecto Social Coração Valente abre un nuevo grupo en el polo deportivo de Aracaju. Las actividades siguen el calendario escolar y combinan entrenamiento, formación y acompañamiento de las familias.',
        },
        { type: 'heading', text: 'Cómo participar' },
        {
          type: 'paragraph',
          text: 'La participación es gratuita. Las inscripciones se realizan presencialmente en el polo deportivo, con la presencia de un responsable, mientras haya plazas disponibles.',
        },
        {
          type: 'list',
          items: [
            'Entrenamientos semanales en horario alterno al escolar',
            'Material deportivo proporcionado por el proyecto',
            'Acompañamiento pedagógico y reuniones periódicas con las familias',
          ],
        },
        {
          type: 'paragraph',
          text: 'La apertura de nuevos grupos depende de la estructura disponible en cada polo y de las alianzas firmadas en el territorio.',
        },
      ],
    },
    category: { pt: 'Projetos', en: 'Projects', es: 'Proyectos' },
    date: '2026-07-24',
    author: 'Comunicação AIDEP',
    coverKey: 'news.coracao-valente-nova-turma-aracaju',
    relatedProjectSlugs: ['coracao-valente'],
  },

  {
    slug: 'futsal-na-escola-formacao-de-professores',
    title: {
      pt: 'Futsal na Escola conclui ciclo de formação de professores',
      en: 'Futsal na Escola completes its teacher training cycle',
      es: 'Futsal na Escola concluye el ciclo de formación de profesores',
    },
    excerpt: {
      pt: 'Encontros de formação continuada fecham o semestre com material metodológico atualizado e um plano de acompanhamento para as escolas participantes.',
      en: 'Continuing education sessions close the term with updated methodology material and a follow-up plan for participating schools.',
      es: 'Los encuentros de formación continua cierran el semestre con material metodológico actualizado y un plan de acompañamiento para las escuelas participantes.',
    },
    body: {
      pt: [
        {
          type: 'paragraph',
          text: 'O ciclo de formação do Futsal na Escola encerra o semestre com os professores das escolas participantes. A proposta é simples: o que se aprende na formação precisa caber na aula da semana seguinte, com a estrutura que a escola já tem.',
        },
        { type: 'heading', text: 'O que fica com as escolas' },
        {
          type: 'list',
          items: [
            'Caderno de metodologia com os planos de aula do ciclo',
            'Roteiro de avaliação das turmas ao longo do ano',
            'Acompanhamento da equipe técnica da AIDEP entre um ciclo e o próximo',
          ],
        },
        {
          type: 'quote',
          text: 'A metodologia só vale quando o professor consegue aplicá-la sozinho, na quadra que ele tem.',
          cite: 'Equipe de formação do projeto',
        },
        {
          type: 'paragraph',
          text: 'O próximo ciclo será aberto às escolas da rede conforme o calendário letivo e a articulação com as secretarias de educação.',
        },
      ],
      en: [
        {
          type: 'paragraph',
          text: 'The Futsal na Escola training cycle closes the term with teachers from the participating schools. The premise is simple: whatever is learned in training has to fit into next week’s lesson, using the facilities the school already has.',
        },
        { type: 'heading', text: 'What the schools keep' },
        {
          type: 'list',
          items: [
            'A methodology handbook with the lesson plans from the cycle',
            'An assessment guide for the groups through the year',
            'Follow-up from AIDEP’s technical team between one cycle and the next',
          ],
        },
        {
          type: 'quote',
          text: 'A methodology only works when the teacher can apply it alone, on the court they actually have.',
          cite: 'Project training team',
        },
        {
          type: 'paragraph',
          text: 'The next cycle will open to public schools in line with the school calendar and the arrangements made with education authorities.',
        },
      ],
      es: [
        {
          type: 'paragraph',
          text: 'El ciclo de formación de Futsal na Escola cierra el semestre con los profesores de las escuelas participantes. La propuesta es simple: lo que se aprende en la formación tiene que caber en la clase de la semana siguiente, con la estructura que la escuela ya tiene.',
        },
        { type: 'heading', text: 'Qué queda en las escuelas' },
        {
          type: 'list',
          items: [
            'Cuaderno de metodología con los planes de clase del ciclo',
            'Guía de evaluación de los grupos a lo largo del año',
            'Acompañamiento del equipo técnico de AIDEP entre un ciclo y el siguiente',
          ],
        },
        {
          type: 'quote',
          text: 'La metodología solo sirve cuando el profesor logra aplicarla solo, en la cancha que tiene.',
          cite: 'Equipo de formación del proyecto',
        },
        {
          type: 'paragraph',
          text: 'El próximo ciclo se abrirá a las escuelas de la red según el calendario escolar y la articulación con las secretarías de educación.',
        },
      ],
    },
    category: { pt: 'Formação', en: 'Training', es: 'Formación' },
    date: '2026-06-18',
    author: 'Comunicação AIDEP',
    coverKey: 'news.futsal-na-escola-formacao-de-professores',
    relatedProjectSlugs: ['futsal-na-escola'],
  },

  {
    slug: 'oficinas-de-paradesporto-nos-polos',
    title: {
      pt: 'Oficinas de paradesporto ampliam o acesso nos polos',
      en: 'Parasport workshops widen access at the hubs',
      es: 'Talleres de paradeporte amplían el acceso en los polos',
    },
    excerpt: {
      pt: 'Adaptação de atividades, formação da equipe e revisão da acessibilidade dos espaços: as oficinas preparam os polos para receber mais atletas.',
      en: 'Adapting activities, training the team and reviewing accessibility: the workshops prepare the hubs to welcome more athletes.',
      es: 'Adaptación de actividades, formación del equipo y revisión de la accesibilidad: los talleres preparan los polos para recibir a más atletas.',
    },
    body: {
      pt: [
        {
          type: 'paragraph',
          text: 'O paradesporto está no nome da associação e precisa estar na quadra. As oficinas realizadas nos polos tratam de três coisas ao mesmo tempo: adaptar as atividades, preparar a equipe e olhar de perto a acessibilidade do espaço.',
        },
        { type: 'heading', text: 'Frentes de trabalho' },
        {
          type: 'list',
          items: [
            'Adaptação das atividades e do material esportivo',
            'Formação da equipe técnica e dos monitores',
            'Revisão de acessibilidade dos espaços e dos percursos de chegada',
          ],
        },
        {
          type: 'paragraph',
          text: 'A continuidade do trabalho depende de parcerias locais — com escolas, com o poder público e com as instituições que já atendem as famílias no território.',
        },
      ],
      en: [
        {
          type: 'paragraph',
          text: 'Parasport is in the association’s name and it has to be on the court. The workshops held at the hubs address three things at once: adapting activities, preparing the team and taking a close look at the accessibility of the space.',
        },
        { type: 'heading', text: 'Lines of work' },
        {
          type: 'list',
          items: [
            'Adapting activities and sports equipment',
            'Training for the technical team and monitors',
            'Accessibility review of the spaces and of the routes to reach them',
          ],
        },
        {
          type: 'paragraph',
          text: 'Continuing this work depends on local partnerships — with schools, with public authorities and with the institutions already supporting families in the area.',
        },
      ],
      es: [
        {
          type: 'paragraph',
          text: 'El paradeporte está en el nombre de la asociación y tiene que estar en la cancha. Los talleres realizados en los polos abordan tres cosas a la vez: adaptar las actividades, preparar al equipo y revisar de cerca la accesibilidad del espacio.',
        },
        { type: 'heading', text: 'Frentes de trabajo' },
        {
          type: 'list',
          items: [
            'Adaptación de las actividades y del material deportivo',
            'Formación del equipo técnico y de los monitores',
            'Revisión de accesibilidad de los espacios y de los trayectos de llegada',
          ],
        },
        {
          type: 'paragraph',
          text: 'La continuidad del trabajo depende de alianzas locales — con escuelas, con el poder público y con las instituciones que ya atienden a las familias en el territorio.',
        },
      ],
    },
    category: { pt: 'Paradesporto', en: 'Parasport', es: 'Paradeporte' },
    date: '2026-05-27',
    author: 'Comunicação AIDEP',
    coverKey: 'news.oficinas-de-paradesporto-nos-polos',
    relatedProjectSlugs: ['coracao-valente'],
  },

  {
    slug: 'articulacao-internacional-2027',
    title: {
      pt: 'AIDEP amplia a articulação internacional para 2027',
      en: 'AIDEP expands its international work towards 2027',
      es: 'AIDEP amplía la articulación internacional para 2027',
    },
    excerpt: {
      pt: 'A associação avança na aproximação com instituições de outros países para trocar metodologia, formação e experiências de gestão esportiva.',
      en: 'The association moves forward with institutions in other countries to exchange methodology, training and sports management experience.',
      es: 'La asociación avanza en el acercamiento con instituciones de otros países para intercambiar metodología, formación y experiencias de gestión deportiva.',
    },
    body: {
      pt: [
        {
          type: 'paragraph',
          text: 'A AIDEP é uma plataforma internacional de desenvolvimento humano por meio do esporte e do paradesporto. Levar essa vocação adiante significa conversar com quem enfrenta os mesmos desafios em outros territórios.',
        },
        {
          type: 'paragraph',
          text: 'A agenda de 2027 prevê aproximação com associações, escolas e federações interessadas em trocar metodologia de formação, modelos de gestão de polos esportivos e caminhos de financiamento para projetos sociais.',
        },
        {
          type: 'quote',
          text: 'Esporte é linguagem comum. O que muda de um país para outro é o caminho até a quadra.',
          cite: 'Diretoria da AIDEP',
        },
        {
          type: 'paragraph',
          text: 'Instituições interessadas em cooperação podem procurar a associação pelo canal de contato do site.',
        },
      ],
      en: [
        {
          type: 'paragraph',
          text: 'AIDEP is an international platform for human development through sport and parasport. Carrying that vocation forward means talking to those facing the same challenges elsewhere.',
        },
        {
          type: 'paragraph',
          text: 'The 2027 agenda includes approaching associations, schools and federations interested in exchanging training methodology, management models for sports hubs and funding paths for social projects.',
        },
        {
          type: 'quote',
          text: 'Sport is a shared language. What changes from one country to another is the road to the court.',
          cite: 'AIDEP board',
        },
        {
          type: 'paragraph',
          text: 'Institutions interested in cooperation can reach the association through the contact channel on this site.',
        },
      ],
      es: [
        {
          type: 'paragraph',
          text: 'AIDEP es una plataforma internacional de desarrollo humano a través del deporte y el paradeporte. Llevar esa vocación adelante significa conversar con quienes enfrentan los mismos desafíos en otros territorios.',
        },
        {
          type: 'paragraph',
          text: 'La agenda de 2027 prevé el acercamiento con asociaciones, escuelas y federaciones interesadas en intercambiar metodología de formación, modelos de gestión de polos deportivos y caminos de financiamiento para proyectos sociales.',
        },
        {
          type: 'quote',
          text: 'El deporte es un lenguaje común. Lo que cambia de un país a otro es el camino hasta la cancha.',
          cite: 'Directiva de AIDEP',
        },
        {
          type: 'paragraph',
          text: 'Las instituciones interesadas en cooperar pueden contactar a la asociación por el canal de contacto del sitio.',
        },
      ],
    },
    category: { pt: 'Institucional', en: 'Institutional', es: 'Institucional' },
    date: '2026-04-15',
    author: 'Comunicação AIDEP',
    coverKey: 'news.articulacao-internacional-2027',
    relatedProjectSlugs: ['futedu-summit'],
  },
]
