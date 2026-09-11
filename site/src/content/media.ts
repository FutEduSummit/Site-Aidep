import {
  type AberturaDoAcervo,
  type ImagemDoAcervo,
  aberturasDoAcervo,
  imagensDoAcervo,
} from './acervo'
import { getStockMedia } from './media-stock'
import type { Localized, MediaAsset } from './types'

/**
 * REGISTRO DE IMAGENS
 * ===================
 * Fonte da verdade das fotografias oficiais da AIDEP.
 *
 * As fotos abaixo são do acervo entregue pela associação — inaugurações dos
 * polos em Sergipe (Estância, Poço Verde, Bugio), a Copa Coração Valente,
 * as atividades com entrega de lanches e materiais, o FutEdu Summit em
 * Curitiba e a quadra do Futsal na Escola. Os arquivos são preparados por
 * `npm run acervo` (ver `scripts/preparar-acervo.mjs`), que escreve as
 * medidas reais em `content/acervo.ts`; aqui só entram a chave e o texto
 * alternativo nos três idiomas.
 *
 * Chave ainda sem fotografia real permanece `null` e `getMedia()` cai na
 * fotografia de banco equivalente em `media-stock.ts` (Pexels, creditada) —
 * nunca uma imagem inventada, nunca uma imagem gerada por IA.
 *
 * Para publicar mais uma fotografia:
 *   1. acrescente o arquivo à curadoria em `scripts/lib/acervo.mjs`;
 *   2. rode `npm run acervo`;
 *   3. aponte a chave para o nome novo, com `alt` nos três idiomas.
 */

/**
 * Monta a fotografia a partir do registro gerado: largura e altura vêm
 * medidas do arquivo publicado, então nenhuma moldura do site erra a
 * proporção nem desloca o layout enquanto a imagem carrega.
 */
function doAcervo(
  chave: ImagemDoAcervo,
  alt: Localized,
  position?: string,
): MediaAsset {
  return { ...imagensDoAcervo[chave], alt, ...(position ? { position } : {}) }
}

/**
 * Uma tomada de drone do FutEdu Summit, pronta para a abertura: a capa em
 * 2560 px como fotografia e o mp4 mudo pendurado nela.
 *
 * A fotografia é o dado principal, e é ela que a página mostra primeiro —
 * o vídeo entra por cima depois, se puder. Por isso o texto alternativo
 * descreve a cena, e não "um vídeo".
 */
function daAbertura(chave: AberturaDoAcervo, alt: Localized): MediaAsset {
  const arquivo = aberturasDoAcervo[chave]

  return {
    src: arquivo.poster,
    width: arquivo.capa.width,
    height: arquivo.capa.height,
    alt,
    video: { src: arquivo.src, duration: arquivo.duration },
  }
}

/**
 * As duas chaves de uma capa de notícia, escritas de uma vez.
 *
 * Toda notícia precisa das duas — `news.<slug>` e `noticia.<slug>` —,
 * porque a mesma notícia pode chegar à página vinda do código ou vinda do
 * painel, e cada caminho monta a chave do seu jeito. Escrever as duas à
 * mão é convite a esquecer uma: a notícia aparece com a fotografia certa
 * enquanto está no código e cai no painel institucional da marca no dia
 * em que passa pelo banco.
 */
function capaDeNoticia(
  slug: string,
  chave: ImagemDoAcervo,
  alt: Localized,
): Record<string, MediaAsset> {
  const foto = doAcervo(chave, alt)
  return { [`news.${slug}`]: foto, [`noticia.${slug}`]: foto }
}

/**
 * A fotografia de abertura da Página inicial. Tem nome próprio porque
 * aparece em dois lugares — a chave `home.hero` e o primeiro quadro de
 * `carrosselDaHome`, adiante — e o texto alternativo dela precisa ser o
 * mesmo nos dois.
 */
const aberturaDaHome = doAcervo('polo-estancia-comemoracao', {
  pt: 'Crianças de uniforme do projeto comemoram de braços erguidos na inauguração do polo de Estância, em Sergipe.',
  en: 'Children in project kit cheer with their arms raised at the opening of the Estância hub, in Sergipe, Brazil.',
  es: 'Niños con el uniforme del proyecto celebran con los brazos en alto en la inauguración del polo de Estância, en Sergipe, Brasil.',
})

/**
 * CAPAS DAS NOTÍCIAS
 * ==================
 * Cada capa tem nome próprio porque entra duas vezes no registro abaixo —
 * uma na chave do conteúdo de exemplo (`news.<slug>`) e outra na chave que
 * a notícia lida do banco carrega (`noticia.<slug>`). Com o nome, o texto
 * alternativo é escrito uma vez só e as duas chaves apontam para a mesma
 * fotografia.
 *
 * Todas são do acervo da associação: a notícia mostra gente do projeto, no
 * lugar onde o assunto dela aconteceu.
 */

/** Inscrições do Summit: o palco da edição anterior, em Curitiba. */
const capaDoSummit = doAcervo('futedu-summit-palco', {
  pt: 'Palco do FutEdu Summit durante a cerimônia, com o painel do evento ao fundo.',
  en: 'The FutEdu Summit stage during the ceremony, with the event banner behind.',
  es: 'Escenario del FutEdu Summit durante la ceremonia, con el panel del evento al fondo.',
})

/** Prestação de contas: o kit entregue — onde o recurso do período chega. */
const capaDaPrestacaoDeContas = doAcervo('polo-estancia-entrega-kit', {
  pt: 'Menino sorri ao abrir o kit entregue pelo projeto, com uniforme e chuteiras.',
  en: 'A boy smiles as he opens the kit handed out by the project, with uniform and boots.',
  es: 'Un niño sonríe al abrir el kit entregado por el proyecto, con uniforme y botines.',
})

/** Nova turma em Aracaju: a turma do polo do Bugio, bairro da capital. */
const capaDaTurmaDeAracaju = doAcervo('polo-bugio-turma', {
  pt: 'Turma do polo do Bugio, em Aracaju, reunida para a foto no dia da inauguração.',
  en: 'The Bugio hub group, in Aracaju, gathered for a photo on opening day.',
  es: 'El grupo del polo de Bugio, en Aracaju, reunido para la foto el día de la inauguración.',
})

/** Formação de professores: a equipe do Futsal na Escola na quadra. */
const capaDaFormacao = doAcervo('futsal-na-escola-equipe', {
  pt: 'Equipe de professoras do Futsal na Escola reunida na quadra, de uniforme do projeto.',
  en: 'The Futsal na Escola teaching team together on the court, in project kit.',
  es: 'Equipo de profesoras de Futsal na Escola reunido en la cancha, con el uniforme del proyecto.',
})

/** Oficinas nos polos: a roda no gramado, antes de a atividade começar. */
const capaDasOficinas = doAcervo('polo-estancia-roda-no-gramado', {
  pt: 'Crianças sentadas em roda no gramado, com as bolas ao lado, antes do início da atividade.',
  en: 'Children sitting in a circle on the grass, balls beside them, before the activity starts.',
  es: 'Niños sentados en círculo en el césped, con los balones al lado, antes de empezar la actividad.',
})

/** Articulação internacional: as delegações reunidas no Summit. */
const capaDaArticulacaoInternacional = doAcervo('futedu-summit-delegacoes', {
  pt: 'Atletas e educadores das delegações posam para a foto oficial diante do painel do Summit.',
  en: 'Athletes and educators from the delegations pose for the official photo in front of the Summit banner.',
  es: 'Atletas y educadores de las delegaciones posan para la foto oficial frente al panel del Summit.',
})

export const media: Record<string, MediaAsset | null> = {
  /* Página inicial */
  'home.hero': aberturaDaHome,

  'home.about': doAcervo('polo-estancia-atencao', {
    pt: 'Dois meninos de uniforme azul acompanham a atividade com atenção, lado a lado.',
    en: 'Two boys in blue kit follow the activity attentively, side by side.',
    es: 'Dos niños con uniforme azul siguen la actividad con atención, uno al lado del otro.',
  }),

  /* Público atendido — um cartão por faixa, cada um com a fotografia da
     etapa correspondente. `home.audience` é o cartão das crianças e abre a
     série; as quatro chaves seguintes completam a ordem em que os públicos
     aparecem em `messages/*.json` (ver `sections/audience-section.tsx`). */

  'home.audience': doAcervo('polo-poco-verde-plateia-2', {
    pt: 'Meninas e meninos sentados na quadra do ginásio, atentos à abertura do polo de Poço Verde.',
    en: 'Girls and boys sitting on the sports hall floor, following the opening of the Poço Verde hub.',
    es: 'Niñas y niños sentados en la cancha del gimnasio, atentos a la apertura del polo de Poço Verde.',
  }),

  'home.audience.teenagers': doAcervo('futedu-summit-time-feminino-na-quadra', {
    pt: 'Adolescentes do time feminino aquecem na quadra coberta antes da partida, com as bolas no chão.',
    en: 'Teenage players of a girls’ team warm up on the indoor court before the match, balls on the floor.',
    es: 'Adolescentes del equipo femenino calientan en la cancha cubierta antes del partido, con los balones en el suelo.',
  }),

  'home.audience.youth': doAcervo('futedu-summit-jovem-com-as-bolas', {
    pt: 'Jovem da organização sorri no gramado com as duas bolas do torneio nas mãos, os jogos ao fundo.',
    en: 'A young member of the organising team smiles on the pitch holding the two match balls, with games under way in the background.',
    es: 'Un joven de la organización sonríe en el césped con los dos balones del torneo en las manos, los partidos al fondo.',
  }),

  'home.audience.adults': doAcervo('futedu-summit-formacao', {
    pt: 'Formador fala ao microfone numa das sessões do Summit para professores e treinadores.',
    en: 'A trainer speaks into the microphone at one of the Summit sessions for teachers and coaches.',
    es: 'Un formador habla al micrófono en una de las sesiones del Summit para profesores y entrenadores.',
  }),

  'home.audience.communities': doAcervo('polo-bugio-comunidade', {
    pt: 'Crianças e adolescentes do Bugio reunidos diante do painel do projeto, no dia da inauguração do polo.',
    en: 'Children and teenagers from Bugio gathered in front of the project banner on the hub’s opening day.',
    es: 'Niños y adolescentes de Bugio reunidos frente al panel del proyecto, el día de la inauguración del polo.',
  }),

  'home.sport': doAcervo('polo-estancia-alegria', {
    pt: 'Professor carrega no colo um menino que ri, cercado pela turma, no dia do polo de Estância.',
    en: 'A coach carries a laughing boy in his arms, surrounded by the group, on hub day in Estância.',
    es: 'Un profesor lleva en brazos a un niño que ríe, rodeado por el grupo, en el día del polo de Estância.',
  }),

  /* Sem fotografia de paradesporto no acervo entregue — a chave segue
     reservada e a moldura usa a fotografia de banco creditada. */
  'home.parasport': null,

  'home.presence': doAcervo('polo-estancia-banco', {
    pt: 'Time de crianças uniformizadas sentado no banco de reservas do campo de Estância.',
    en: 'A team of children in kit sitting on the substitutes’ bench at the Estância pitch.',
    es: 'Un equipo de niños uniformados sentado en el banquillo del campo de Estância.',
  }),

  'home.contact': doAcervo('polo-bugio-na-rua', {
    pt: 'Crianças e adolescentes da comunidade reunidos na rua, no dia da inauguração do polo do Bugio, em Aracaju.',
    en: 'Children and teenagers from the community gathered in the street on the opening day of the Bugio hub, in Aracaju.',
    es: 'Niños y adolescentes de la comunidad reunidos en la calle el día de la inauguración del polo de Bugio, en Aracaju.',
  }),

  /* Faixas de fundo — fotografia sangrada atrás de uma seção inteira.
     Pedem imagem larga e com espaço livre à esquerda, onde entra o texto.
     Ver `components/ui/section-banner.tsx`. */

  'home.impact.banner': doAcervo('polo-estancia-time-no-campo', {
    pt: 'Turma inteira do polo de Estância perfilada no campo, diante do painel do projeto.',
    en: 'The whole Estância hub group lined up on the pitch in front of the project banner.',
    es: 'Todo el grupo del polo de Estância alineado en el campo, frente al panel del proyecto.',
  }),

  'home.partnership.banner': doAcervo('polo-bugio-abertura', {
    pt: 'Equipe do projeto e parceiros na abertura do polo do Bugio, diante do painel com as marcas envolvidas.',
    en: 'Project staff and partners at the opening of the Bugio hub, in front of the banner with the organisations involved.',
    es: 'Equipo del proyecto y socios en la apertura del polo de Bugio, frente al panel con las marcas involucradas.',
  }),

  'home.donate.banner': doAcervo('polo-poco-verde-plateia', {
    pt: 'Crianças sentadas lado a lado no ginásio de Poço Verde, acompanhando a abertura do polo.',
    en: 'Children sitting side by side in the Poço Verde sports hall, following the opening of the hub.',
    es: 'Niños sentados uno al lado del otro en el gimnasio de Poço Verde, siguiendo la apertura del polo.',
  }),

  'page.projects.banner': doAcervo('polo-estancia-roda-no-gramado', {
    pt: 'Crianças sentadas no gramado com bolas ao lado, reunidas antes do treino em Estância.',
    en: 'Children sitting on the grass with balls beside them, gathered before training in Estância.',
    es: 'Niños sentados en el césped con balones al lado, reunidos antes del entrenamiento en Estância.',
  }),

  'page.news.banner': doAcervo('polo-poco-verde-time', {
    pt: 'Time de crianças posa para foto diante do painel do projeto, no polo de Poço Verde.',
    en: 'A team of children poses for a photo in front of the project banner at the Poço Verde hub.',
    es: 'Un equipo de niños posa para la foto frente al panel del proyecto, en el polo de Poço Verde.',
  }),

  'page.transparency.banner': doAcervo('polo-poco-verde-cerimonia', {
    pt: 'Cerimônia de abertura do polo de Poço Verde, com a equipe e as autoridades no palco do ginásio.',
    en: 'Opening ceremony of the Poço Verde hub, with staff and officials on the sports hall stage.',
    es: 'Ceremonia de apertura del polo de Poço Verde, con el equipo y las autoridades en el escenario del gimnasio.',
  }),

  'page.partners.banner': doAcervo('polo-bugio-comunidade', {
    pt: 'Crianças da comunidade do Bugio reunidas diante do painel com as marcas parceiras do projeto.',
    en: 'Children from the Bugio community gathered in front of the banner with the project’s partner brands.',
    es: 'Niños de la comunidad de Bugio reunidos frente al panel con las marcas socias del proyecto.',
  }),

  'page.donate.banner': doAcervo('polo-estancia-comemoracao-2', {
    pt: 'Turma do polo de Estância comemora reunida, com o painel do projeto ao fundo.',
    en: 'The Estância hub group celebrating together, with the project banner behind them.',
    es: 'El grupo del polo de Estância celebra reunido, con el panel del proyecto al fondo.',
  }),

  /* Painel — a coluna de fotografia das telas de entrada, pedir nova senha
     e definir a nova senha (`admin/componentes/moldura-de-entrada.tsx`).
     Ali a fotografia aparece sozinha, sem texto por cima, e é publicada em
     2560 px porque ocupa a coluna inteira de altura de tela cheia (ver a
     nota da curadoria em `scripts/lib/acervo.mjs`). */
  'admin.entrada': doAcervo('futedu-summit-conversa-antes-do-jogo', {
    pt: 'Treinador conversa com o time reunido em roda antes da partida, no gramado.',
    en: 'A coach talks to his team huddled together before the match on the grass.',
    es: 'El entrenador conversa con el equipo reunido en círculo antes del partido, en el césped.',
  }),

  /* Projetos */
  'project.coracao-valente.cover': doAcervo('polo-estancia-turma-reunida', {
    pt: 'Turma do Coração Valente reunida no campo do polo de Estância, diante do painel do projeto.',
    en: 'The Coração Valente group gathered on the pitch at the Estância hub, in front of the project banner.',
    es: 'El grupo de Coração Valente reunido en el campo del polo de Estância, frente al panel del proyecto.',
  }),

  'project.futsal-na-escola.cover': doAcervo('futsal-na-escola-turma', {
    pt: 'Turma do Futsal na Escola reunida na quadra coberta, com os coletes e as bolas do projeto.',
    en: 'The Futsal na Escola group gathered on the indoor court, with the project’s bibs and balls.',
    es: 'El grupo de Futsal na Escola reunido en la cancha cubierta, con los petos y los balones del proyecto.',
  }),

  'project.futedu-summit.cover': doAcervo('futedu-summit-portico', {
    pt: 'Pórtico de boas-vindas do FutEdu Summit sobre a alameda de entrada, em Curitiba.',
    en: 'The FutEdu Summit welcome arch over the entrance walkway, in Curitiba, Brazil.',
    es: 'Pórtico de bienvenida del FutEdu Summit sobre la alameda de entrada, en Curitiba, Brasil.',
  }),

  /* Notícias
     ========
     Toda capa de notícia sai do acervo da associação — nenhuma cai mais na
     fotografia de banco. Cada notícia entra com duas chaves: `news.<slug>`,
     a do conteúdo de exemplo que `npm run conteudo:semear` leva para o
     painel, e `noticia.<slug>`, a que `lib/cms/mapear.ts` monta para a
     notícia lida do banco. Com as duas registradas, a notícia publicada
     pelo painel sem capa enviada mostra a fotografia oficial do assunto em
     vez do painel institucional da marca. */

  'news.futedu-summit-2026-inscricoes': capaDoSummit,
  'noticia.futedu-summit-2026-inscricoes': capaDoSummit,

  'news.prestacao-de-contas-primeiro-semestre-2026': capaDaPrestacaoDeContas,
  'noticia.prestacao-de-contas-primeiro-semestre-2026': capaDaPrestacaoDeContas,

  'news.coracao-valente-nova-turma-aracaju': capaDaTurmaDeAracaju,
  'noticia.coracao-valente-nova-turma-aracaju': capaDaTurmaDeAracaju,

  'news.futsal-na-escola-formacao-de-professores': capaDaFormacao,
  'noticia.futsal-na-escola-formacao-de-professores': capaDaFormacao,

  'news.oficinas-de-paradesporto-nos-polos': capaDasOficinas,
  'noticia.oficinas-de-paradesporto-nos-polos': capaDasOficinas,

  'news.articulacao-internacional-2027': capaDaArticulacaoInternacional,
  'noticia.articulacao-internacional-2027': capaDaArticulacaoInternacional,

  /* As nove notícias dos projetos (`content/news-real.ts`), três por
     projeto. Cada capa mostra o assunto no lugar onde ele aconteceu — a
     inauguração em Poço Verde, a Copa em Estância, o Summit em Curitiba. */

  ...capaDeNoticia('polos-do-coracao-valente-em-sergipe', 'polo-poco-verde-cerimonia', {
    pt: 'Cerimônia de abertura do polo de Poço Verde, com a turma e a comunidade no ginásio.',
    en: 'Opening ceremony of the Poço Verde hub, with the group and the community in the sports hall.',
    es: 'Ceremonia de apertura del polo de Poço Verde, con el grupo y la comunidad en el gimnasio.',
  }),

  ...capaDeNoticia('copa-coracao-valente-reune-os-polos', 'polo-estancia-comemoracao-2', {
    pt: 'Crianças comemoram juntas, de braços erguidos, ao fim de uma partida do projeto.',
    en: 'Children celebrate together, arms raised, at the end of a project match.',
    es: 'Niños celebran juntos, con los brazos en alto, al final de un partido del proyecto.',
  }),

  ...capaDeNoticia('coracao-valente-no-distrito-federal', 'coracao-valente-encontro', {
    pt: 'Turma reunida com os professores do projeto antes do início da atividade.',
    en: 'A group gathered with the project’s teachers before the activity starts.',
    es: 'Grupo reunido con los profesores del proyecto antes del inicio de la actividad.',
  }),

  ...capaDeNoticia('futsal-na-escola-em-cinco-cidades', 'futsal-na-escola-turma', {
    pt: 'Turma do Futsal na Escola reunida na quadra coberta, com os coletes e as bolas do projeto.',
    en: 'The Futsal na Escola group gathered on the indoor court, with the project’s bibs and balls.',
    es: 'El grupo de Futsal na Escola reunido en la cancha cubierta, con los petos y los balones del proyecto.',
  }),

  ...capaDeNoticia('futsal-na-escola-quem-esta-na-quadra', 'futsal-na-escola-equipe', {
    pt: 'Equipe de professoras do Futsal na Escola reunida na quadra, de uniforme do projeto.',
    en: 'The Futsal na Escola teaching team together on the court, in project kit.',
    es: 'Equipo de profesoras de Futsal na Escola reunido en la cancha, con el uniforme del proyecto.',
  }),

  ...capaDeNoticia('futsal-na-escola-a-quadra-como-sala-de-aula', 'futsal-na-escola-jogo', {
    pt: 'Partida em andamento na quadra coberta, durante a aula do projeto.',
    en: 'A match under way on the indoor court during the project’s lesson.',
    es: 'Partido en curso en la cancha cubierta, durante la clase del proyecto.',
  }),

  ...capaDeNoticia('futedu-summit-curitiba-sete-mil', 'futedu-summit-na-arena', {
    pt: 'Delegação perfilada no gramado da arena do FutEdu Summit, com as arquibancadas ao fundo.',
    en: 'A delegation lined up on the FutEdu Summit arena pitch, with the stands behind them.',
    es: 'Delegación alineada en el césped de la arena del FutEdu Summit, con las gradas al fondo.',
  }),

  ...capaDeNoticia('futedu-summit-torneio-e-delegacoes', 'futedu-summit-torneio', {
    pt: 'Partida do torneio do FutEdu Summit, com as equipes das delegações em campo.',
    en: 'A FutEdu Summit tournament match, with the delegation teams on the pitch.',
    es: 'Partido del torneo del FutEdu Summit, con los equipos de las delegaciones en campo.',
  }),

  ...capaDeNoticia('futedu-summit-formacao-e-certificados', 'futedu-summit-certificado', {
    pt: 'Entrega de certificado no palco do FutEdu Summit, ao fim do encontro.',
    en: 'A certificate handed over on the FutEdu Summit stage at the end of the gathering.',
    es: 'Entrega de certificado en el escenario del FutEdu Summit, al final del encuentro.',
  }),
}

/**
 * CARROSSEL DA ABERTURA
 * =====================
 * O rodízio de fotografias que passa atrás do título da Página inicial.
 * Depois dos três primeiros quadros o acervo mostra a extensão do
 * trabalho — a rua da comunidade, o campo, a quadra coberta e a arena do
 * encontro em Curitiba.
 *
 * QUEM ABRE A PÁGINA
 * ------------------
 * Os três primeiros são escolha do cliente, feita vendo o rodízio rodar:
 * o chute a gol, a comemoração dentro do gol e a vista aérea dos campos.
 * Antes quem abria era `aberturaDaHome` — a mesma foto da chave
 * `home.hero` —, e ela agora entra em quarto.
 *
 * Duas consequências que valem saber, porque nenhuma das duas aparece no
 * arquivo em que se mexe:
 *
 * - **O `priority` está na posição 0 do array**, não no quadro que estiver
 *   no ar (`priority && posicao === 0` em `ui/banner-carousel.tsx`). Então
 *   é sempre o primeiro desta lista que carrega adiantado, e é ele o LCP
 *   da Página inicial. Trocar a ordem aqui troca a imagem que decide a
 *   nota de carregamento — o primeiro quadro precisa ser uma fotografia
 *   que valha o adiantamento.
 * - **A chave `home.hero` continua apontando para `aberturaDaHome`**, e
 *   não para o novo primeiro quadro. Hoje isso não desencontra nada:
 *   nenhum componente lê `media['home.hero']` — a abertura monta a partir
 *   deste array —, a chave está no registro para quando alguma moldura
 *   precisar dela. Se um dia alguém a usar como capa da Página inicial, é
 *   aqui que se lembra de alinhar as duas.
 *
 * Valem as duas regras das faixas de fundo (ver `ui/banner-carousel.tsx`):
 * fotografia **larga** e com **espaço livre à esquerda**, onde entra o
 * título. Foto em pé não entra aqui — sangrada na largura toda, sobraria
 * dela só uma tira do meio.
 *
 * ESTA LISTA ESTÁ GRANDE DE PROPÓSITO, E É PROVISÓRIA
 * ---------------------------------------------------
 * O cliente montou a pasta `Conteudo-HERO` para escolher a abertura e
 * pediu para ver tudo no site antes de fazer a seleção. Então todo o
 * material dela que serve numa faixa sangrada entra aqui — dezoito
 * quadros, contra os oito de antes. É muito para uma abertura: dezoito
 * quadros levam mais de três minutos para dar a volta, e quem chega vê
 * dois ou três. Serve para comparar (as setas passam à mão), não para
 * ficar.
 *
 * Feita a escolha, o rodízio volta para algo entre cinco e sete quadros.
 * Duas observações para essa hora, das que só aparecem com a foto no
 * lugar: `futedu-summit-participantes` e `futedu-summit-fila-da-hidratacao`
 * têm gente de ponta a ponta do quadro, sem o vão à esquerda que o título
 * pede — leem-se bem na galeria e disputam com o texto aqui.
 *
 * A ordem alterna movimento e imagem parada, e mantém Sergipe entre as
 * tomadas de Curitiba: sem isso a abertura viraria um comercial do
 * FutEdu Summit, que é um projeto entre os quatro.
 */
export const carrosselDaHome: MediaAsset[] = [
  /* OS TRÊS DA ESCOLHA DO CLIENTE
     -----------------------------
     Nesta ordem, e nesta posição, por pedido — eram o 3º, o 6º e o 7º
     quadros da lista de comparação. O chute a gol abre porque é o que
     melhor sustenta o título: o menino e o painel ficam à direita e a
     rede sobra escura à esquerda, onde o texto entra. É também, por ser o
     primeiro, a fotografia que carrega adiantada (ver o cabeçalho). */
  doAcervo('futedu-summit-chute-a-gol', {
    pt: 'Menino de uniforme azul e preto chuta a bola diante do painel da Federação do Desporto Escolar do Paraná, no torneio do FutEdu Summit.',
    en: 'A boy in blue and black kit strikes the ball in front of the Paraná school sport federation banner at the FutEdu Summit tournament.',
    es: 'Un niño con uniforme azul y negro golpea el balón frente al panel de la federación de deporte escolar de Paraná, en el torneo del FutEdu Summit.',
  }),

  doAcervo('futedu-summit-comemoracao-no-gol', {
    pt: 'Time de crianças comemora dentro do gol, com os braços erguidos e a treinadora no meio da roda.',
    en: 'A children’s team celebrates inside the goal, arms raised, with their coach in the middle of the group.',
    es: 'Un equipo de niños celebra dentro de la portería, con los brazos en alto y la entrenadora en medio del grupo.',
  }),

  daAbertura('futedu-summit-vista-aerea', {
    pt: 'Vista aérea dos campos do FutEdu Summit em Curitiba, com as partidas acontecendo ao mesmo tempo e o público em volta.',
    en: 'Aerial view of the FutEdu Summit pitches in Curitiba, with matches under way side by side and the crowd around them.',
    es: 'Vista aérea de los campos del FutEdu Summit en Curitiba, con los partidos en marcha al mismo tiempo y el público alrededor.',
  }),

  /* Daqui em diante, a lista de comparação na ordem anterior. */
  aberturaDaHome,

  /* A alameda de entrada vista de cima, com o drone descendo por ela: é a
     tomada mais forte da pasta de abertura — dá o lugar, a marca do
     encontro e movimento, nesta ordem. */
  daAbertura('futedu-summit-alameda-do-alto', {
    pt: 'Vista aérea da alameda de entrada do FutEdu Summit, com o pórtico do encontro sobre o caminho.',
    en: 'Aerial view of the FutEdu Summit entrance walkway, with the event arch over the path.',
    es: 'Vista aérea de la alameda de entrada del FutEdu Summit, con el pórtico del encuentro sobre el camino.',
  }),

  doAcervo('polo-bugio-na-rua', {
    pt: 'Crianças e adolescentes da comunidade reunidos na rua, no dia da inauguração do polo do Bugio, em Aracaju.',
    en: 'Children and teenagers from the community gathered in the street on the opening day of the Bugio hub, in Aracaju.',
    es: 'Niños y adolescentes de la comunidad reunidos en la calle el día de la inauguración del polo de Bugio, en Aracaju.',
  }),

  daAbertura('futedu-summit-arena-inflavel-do-alto', {
    pt: 'Vista aérea da arena inflável montada no gramado do FutEdu Summit, com as crianças jogando e as tendas do evento ao lado.',
    en: 'Aerial view of the inflatable pitch set up on the FutEdu Summit lawn, children playing and the event marquees beside it.',
    es: 'Vista aérea de la arena inflable montada en el césped del FutEdu Summit, con los niños jugando y las tiendas del evento al lado.',
  }),

  doAcervo('futedu-summit-campos-do-alto', {
    pt: 'Os campos do FutEdu Summit vistos de cima, demarcados lado a lado dentro da pista de atletismo.',
    en: 'The FutEdu Summit pitches seen from above, marked out side by side inside the running track.',
    es: 'Los campos del FutEdu Summit vistos desde arriba, demarcados uno al lado del otro dentro de la pista de atletismo.',
  }),

  doAcervo('polo-estancia-time-no-campo', {
    pt: 'Turma inteira do polo de Estância perfilada no campo, diante do painel do projeto.',
    en: 'The whole Estância hub group lined up on the pitch in front of the project banner.',
    es: 'Todo el grupo del polo de Estância alineado en el campo, frente al panel del proyecto.',
  }),

  daAbertura('futedu-summit-campus-do-alto', {
    pt: 'Vista aérea do campus que recebeu o FutEdu Summit, com os campos do torneio e a cidade em volta.',
    en: 'Aerial view of the campus that hosted the FutEdu Summit, with the tournament pitches and the city around them.',
    es: 'Vista aérea del campus que recibió el FutEdu Summit, con los campos del torneo y la ciudad alrededor.',
  }),

  doAcervo('futedu-summit-pavilhao-do-alto', {
    pt: 'Pavilhão do FutEdu Summit visto do alto da quadra, com um dos times reunido no círculo central.',
    en: 'The FutEdu Summit hall seen from above the court, one of the teams gathered in the centre circle.',
    es: 'Pabellón del FutEdu Summit visto desde lo alto de la cancha, con uno de los equipos reunido en el círculo central.',
  }),

  daAbertura('futedu-summit-arena-do-alto', {
    pt: 'Partida de futsal vista do alto da quadra, no FutEdu Summit.',
    en: 'A futsal match seen from above the court at the FutEdu Summit.',
    es: 'Partido de futsal visto desde lo alto de la cancha, en el FutEdu Summit.',
  }),

  doAcervo('futedu-summit-delegacao-inclusiva-na-arena', {
    pt: 'Delegação de futsal inclusivo perfilada no gramado da Arena da Baixada, em Curitiba, com as arquibancadas vazias ao fundo.',
    en: 'The inclusive futsal delegation lined up on the Arena da Baixada pitch, in Curitiba, with the empty stands behind them.',
    es: 'Delegación de futsal inclusivo alineada en el césped de la Arena da Baixada, en Curitiba, con las gradas vacías al fondo.',
  }),

  doAcervo('futsal-na-escola-turma', {
    pt: 'Turma do Futsal na Escola reunida na quadra coberta, com os coletes e as bolas do projeto.',
    en: 'The Futsal na Escola group gathered on the indoor court, with the project’s bibs and balls.',
    es: 'El grupo de Futsal na Escola reunido en la cancha cubierta, con los petos y los balones del proyecto.',
  }),

  daAbertura('futedu-summit-feira-do-alto', {
    pt: 'Crianças jogando no gramado sintético montado dentro do pavilhão do FutEdu Summit, vistas do alto.',
    en: 'Children playing on the artificial pitch set up inside the FutEdu Summit hall, seen from above.',
    es: 'Niños jugando en el césped sintético montado dentro del pabellón del FutEdu Summit, vistos desde arriba.',
  }),

  doAcervo('futedu-summit-fila-da-hidratacao', {
    pt: 'Meninos de uniforme perfilados na mesa da hidratação, no intervalo das partidas do FutEdu Summit.',
    en: 'Boys in kit lined up at the water table during the break between matches at the FutEdu Summit.',
    es: 'Niños de uniforme alineados en la mesa de hidratación, en el descanso entre partidos del FutEdu Summit.',
  }),

  doAcervo('polo-poco-verde-plateia', {
    pt: 'Crianças sentadas lado a lado no ginásio de Poço Verde, acompanhando a abertura do polo.',
    en: 'Children sitting side by side in the Poço Verde sports hall, following the opening of the hub.',
    es: 'Niños sentados uno al lado del otro en el gimnasio de Poço Verde, siguiendo la apertura del polo.',
  }),

  doAcervo('futedu-summit-delegacao-inclusiva-no-painel', {
    pt: 'Delegação de futsal inclusivo reunida com a organização do FutEdu Summit diante do painel do encontro.',
    en: 'The inclusive futsal delegation together with the FutEdu Summit organisers in front of the event banner.',
    es: 'Delegación de futsal inclusivo reunida con la organización del FutEdu Summit frente al panel del encuentro.',
  }),
]

/**
 * GALERIA DO CORAÇÃO VALENTE
 * ==========================
 * O álbum do projeto, na ordem em que a história se conta: a chegada às
 * comunidades, a inauguração dos polos, a entrega dos materiais, o treino
 * e a competição. Entra em `content/projects.ts` como galeria do projeto.
 *
 * O QUE A SEGUNDA VARREDURA DO ACERVO TROUXE
 * ------------------------------------------
 * São 41 fotografias, dezesseis a mais que na primeira curadoria. As novas
 * não são outro ângulo do que já estava aqui — são as cenas que faltavam,
 * e cada uma entra ao lado da irmã temática, não no fim da lista:
 *
 * - **O dia de atividade no Distrito Federal.** O campo de terra da
 *   comunidade, o professor junto à trave, quem espera a vez sentado no
 *   muro, a entrega do lanche em três tempos, a foto da turma sob a tenda
 *   e o aquecimento no gramado sintético. A pasta "Fotos Recebidas" tinha
 *   73 arquivos e só cinco estavam publicados.
 * - **Os materiais antes de chegarem à criança.** Mochila, camisa, cone,
 *   bola, caixa de chuteira e as medalhas da Copinha — a subpasta
 *   "Materiais" estava inteira de fora. É o que dá lastro visual à
 *   prestação de contas: mostra onde o recurso do período foi parar.
 * - **Duas cenas dos polos de Sergipe.** A fala de abertura em Estância e
 *   a plateia de Poço Verde vista de perto.
 *
 * Não entrou muito mais do que isso, e o motivo está em
 * `scripts/lib/acervo.mjs`: metade do acervo bruto é a mesma pose
 * fotografada três, quatro, cinco vezes. Publicar o quadro seguinte de uma
 * fotografia que já está na galeria faz a página parecer defeito.
 */
export const galeriaCoracaoValente: MediaAsset[] = [
  doAcervo('polo-estancia-comemoracao', {
    pt: 'Crianças comemoram de braços erguidos na inauguração do polo de Estância.',
    en: 'Children cheer with their arms raised at the opening of the Estância hub.',
    es: 'Niños celebran con los brazos en alto en la inauguración del polo de Estância.',
  }),
  doAcervo('polo-bugio-comunidade', {
    pt: 'Crianças e adolescentes do Bugio reunidos diante do painel do projeto, no dia da inauguração do polo.',
    en: 'Children and teenagers from Bugio gathered in front of the project banner on the hub’s opening day.',
    es: 'Niños y adolescentes de Bugio reunidos frente al panel del proyecto, el día de la inauguración del polo.',
  }),
  doAcervo('coracao-valente-trofeu', {
    pt: 'Menino beija o troféu conquistado em uma competição do projeto.',
    en: 'A boy kisses the trophy won at one of the project’s competitions.',
    es: 'Un niño besa el trofeo conquistado en una competición del proyecto.',
  }),
  doAcervo('coracao-valente-medalhas-da-copinha', {
    pt: 'Medalhas de fita azul sobre a mesa, ao lado das mochilas e da caixa de leite em pó, antes da entrega na Copinha.',
    en: 'Medals on blue ribbons laid out on the table, beside the bags and the box of powdered milk, before the Copinha handover.',
    es: 'Medallas con cinta azul sobre la mesa, junto a las mochilas y la caja de leche en polvo, antes de la entrega en la Copinha.',
  }),
  doAcervo('polo-poco-verde-plateia', {
    pt: 'Crianças sentadas lado a lado no ginásio de Poço Verde.',
    en: 'Children sitting side by side in the Poço Verde sports hall.',
    es: 'Niños sentados uno al lado del otro en el gimnasio de Poço Verde.',
  }),
  doAcervo('polo-poco-verde-plateia-de-perto', {
    pt: 'Crianças de uniforme sentadas no chão do ginásio de Poço Verde, acompanhando a abertura de perto.',
    en: 'Children in kit sitting on the floor of the Poço Verde sports hall, following the opening from up close.',
    es: 'Niñas y niños con uniforme sentados en el suelo del gimnasio de Poço Verde, siguiendo la apertura de cerca.',
  }),
  doAcervo('polo-estancia-entrega-kit', {
    pt: 'Menino sorri ao abrir o kit entregue pelo projeto, com uniforme e chuteiras.',
    en: 'A boy smiles as he opens the kit handed out by the project, with uniform and boots.',
    es: 'Un niño sonríe al abrir el kit entregado por el proyecto, con uniforme y botines.',
  }),
  doAcervo('polo-estancia-caixas-de-chuteiras', {
    pt: 'Caixas de chuteira empilhadas antes da entrega dos materiais no polo de Estância.',
    en: 'Boot boxes stacked up before the equipment handout at the Estância hub.',
    es: 'Cajas de botines apiladas antes de la entrega de materiales en el polo de Estância.',
  }),
  doAcervo('coracao-valente-camisas-do-projeto', {
    pt: 'Camisas do projeto separadas uma a uma sobre a mesa, antes da entrega às crianças.',
    en: 'Project shirts laid out one by one on the table before being handed to the children.',
    es: 'Camisetas del proyecto separadas una a una sobre la mesa, antes de la entrega a los niños.',
  }),
  doAcervo('polo-bugio-na-rua', {
    pt: 'Crianças da comunidade do Bugio, em Aracaju, na rua onde o polo foi aberto.',
    en: 'Children from the Bugio community, in Aracaju, on the street where the hub opened.',
    es: 'Niños de la comunidad de Bugio, en Aracaju, en la calle donde se abrió el polo.',
  }),
  doAcervo('polo-poco-verde-time', {
    pt: 'Time de crianças posa para foto no polo de Poço Verde.',
    en: 'A team of children poses for a photo at the Poço Verde hub.',
    es: 'Un equipo de niños posa para la foto en el polo de Poço Verde.',
  }),
  doAcervo('polo-estancia-roda-no-gramado', {
    pt: 'Crianças sentadas no gramado com as bolas ao lado, antes do treino.',
    en: 'Children sitting on the grass with the balls beside them, before training.',
    es: 'Niños sentados en el césped con los balones al lado, antes del entrenamiento.',
  }),
  doAcervo('coracao-valente-campo-da-comunidade', {
    pt: 'Campo de terra da comunidade no dia de atividade, com a turma sentada na lateral esperando a vez.',
    en: 'The community’s dirt pitch on activity day, with the group sitting on the touchline waiting their turn.',
    es: 'Campo de tierra de la comunidad en el día de actividad, con el grupo sentado en la banda esperando su turno.',
  }),
  doAcervo('coracao-valente-treino', {
    pt: 'Crianças em atividade no campo de terra, com o professor acompanhando.',
    en: 'Children playing on the dirt pitch with the coach watching over them.',
    es: 'Niños en actividad en el campo de tierra, con el profesor acompañando.',
  }),
  doAcervo('coracao-valente-professor-no-campo', {
    pt: 'Professor acompanha a partida das crianças no campo de terra, junto à trave.',
    en: 'A coach watches the children’s match on the dirt pitch, next to the goal.',
    es: 'Un profesor acompaña el partido de los niños en el campo de tierra, junto a la portería.',
  }),
  doAcervo('polo-estancia-alegria', {
    pt: 'Professor carrega no colo um menino que ri, cercado pela turma.',
    en: 'A coach carries a laughing boy in his arms, surrounded by the group.',
    es: 'Un profesor lleva en brazos a un niño que ríe, rodeado por el grupo.',
  }),
  doAcervo('polo-poco-verde-cerimonia', {
    pt: 'Cerimônia de abertura do polo de Poço Verde, no palco do ginásio.',
    en: 'Opening ceremony of the Poço Verde hub, on the sports hall stage.',
    es: 'Ceremonia de apertura del polo de Poço Verde, en el escenario del gimnasio.',
  }),
  doAcervo('polo-estancia-fala-na-abertura', {
    pt: 'Fala de abertura ao microfone diante do painel do projeto, com a equipe e os parceiros ao lado, em Estância.',
    en: 'The opening address at the microphone in front of the project banner, with the team and partners alongside, in Estância.',
    es: 'Palabras de apertura ante el panel del proyecto, con el equipo y los socios al lado, en Estância.',
  }),
  doAcervo('polo-estancia-atencao', {
    pt: 'Dois meninos acompanham a atividade lado a lado, de uniforme.',
    en: 'Two boys in kit follow the activity side by side.',
    es: 'Dos niños con uniforme siguen la actividad uno al lado del otro.',
  }),
  doAcervo('polo-bugio-abertura', {
    pt: 'Equipe do projeto e parceiros na abertura do polo do Bugio.',
    en: 'Project staff and partners at the opening of the Bugio hub.',
    es: 'Equipo del proyecto y socios en la apertura del polo de Bugio.',
  }),
  doAcervo('polo-estancia-time-no-campo', {
    pt: 'Turma inteira do polo de Estância perfilada no campo.',
    en: 'The whole Estância hub group lined up on the pitch.',
    es: 'Todo el grupo del polo de Estância alineado en el campo.',
  }),
  doAcervo('coracao-valente-corrida', {
    pt: 'Crianças correm juntas na quadra, em atividade do projeto.',
    en: 'Children run together on the court during a project activity.',
    es: 'Niños corren juntos en la cancha, en una actividad del proyecto.',
  }),
  doAcervo('coracao-valente-aquecimento-no-gramado', {
    pt: 'Crianças em aquecimento no gramado sintético, de uniforme do projeto.',
    en: 'Children warming up on the artificial pitch in the project’s kit.',
    es: 'Niños en calentamiento en el césped sintético, con el uniforme del proyecto.',
  }),
  doAcervo('polo-poco-verde-plateia-2', {
    pt: 'Meninas e meninos atentos à abertura do polo de Poço Verde.',
    en: 'Girls and boys following the opening of the Poço Verde hub.',
    es: 'Niñas y niños atentos a la apertura del polo de Poço Verde.',
  }),
  doAcervo('polo-estancia-entrega-chuteiras', {
    pt: 'Menino recebe a caixa de chuteiras e a mochila do projeto na entrega de materiais.',
    en: 'A boy receives his boots box and the project bag during the equipment handout.',
    es: 'Un niño recibe la caja de botines y la mochila del proyecto en la entrega de materiales.',
  }),
  doAcervo('coracao-valente-kits-na-mesa', {
    pt: 'Mochilas, cones e bolas sobre a mesa, prontos para a entrega no dia da atividade.',
    en: 'Bags, cones and balls on the table, ready to be handed out on activity day.',
    es: 'Mochilas, conos y balones sobre la mesa, listos para la entrega en el día de actividad.',
  }),
  doAcervo('polo-bugio-turma', {
    pt: 'Turma do polo do Bugio reunida para a foto no dia da inauguração.',
    en: 'The Bugio hub group gathered for a photo on opening day.',
    es: 'El grupo del polo de Bugio reunido para la foto el día de la inauguración.',
  }),
  doAcervo('polo-estancia-banco', {
    pt: 'Time sentado no banco de reservas do campo de Estância.',
    en: 'The team sitting on the substitutes’ bench at the Estância pitch.',
    es: 'El equipo sentado en el banquillo del campo de Estância.',
  }),
  doAcervo('coracao-valente-esperando-a-vez', {
    pt: 'Meninos sentados no muro acompanham o jogo enquanto esperam a vez de entrar.',
    en: 'Boys sitting on the low wall watch the game while they wait their turn to play.',
    es: 'Niños sentados en el muro siguen el partido mientras esperan su turno para entrar.',
  }),
  doAcervo('coracao-valente-encontro', {
    pt: 'Crianças reunidas sob a tenda do projeto, em dia de atividade.',
    en: 'Children gathered under the project marquee on an activity day.',
    es: 'Niños reunidos bajo la carpa del proyecto, en un día de actividad.',
  }),
  doAcervo('coracao-valente-turma-sob-a-tenda', {
    pt: 'Turma reunida sob a tenda do projeto para a foto do dia de atividade, com a equipe em volta.',
    en: 'The group gathered under the project marquee for the activity-day photo, with the team around them.',
    es: 'El grupo reunido bajo la carpa del proyecto para la foto del día de actividad, con el equipo alrededor.',
  }),
  doAcervo('polo-poco-verde-abertura', {
    pt: 'Equipe do projeto na abertura do polo de Poço Verde.',
    en: 'The project team at the opening of the Poço Verde hub.',
    es: 'El equipo del proyecto en la apertura del polo de Poço Verde.',
  }),
  doAcervo('polo-estancia-comemoracao-2', {
    pt: 'Turma reunida comemora no dia da inauguração do polo de Estância.',
    en: 'The group celebrates together on the Estância hub’s opening day.',
    es: 'El grupo reunido celebra el día de la inauguración del polo de Estância.',
  }),
  doAcervo('coracao-valente-lanche', {
    pt: 'Entrega de lanche às crianças durante a atividade do projeto.',
    en: 'Snacks handed out to the children during the project activity.',
    es: 'Entrega de merienda a los niños durante la actividad del proyecto.',
  }),
  doAcervo('coracao-valente-entrega-do-lanche', {
    pt: 'Integrante da comissão técnica entrega o lanche a um adolescente de colete, no fim da atividade.',
    en: 'A member of the coaching staff hands a snack to a teenager in a bib at the end of the activity.',
    es: 'Integrante de la comisión técnica entrega la merienda a un adolescente con peto, al final de la actividad.',
  }),
  doAcervo('coracao-valente-lanche-e-mochila', {
    pt: 'Criança recebe o lanche com a mochila do projeto na mão, no fim da atividade.',
    en: 'A child receives a snack while holding the project bag at the end of the activity.',
    es: 'Participante recibe la merienda con la mochila del proyecto en la mano, al final de la actividad.',
  }),
  doAcervo('coracao-valente-mesa-dos-lanches', {
    pt: 'Mesa dos lanches montada no campo, com o painel dos patrocinadores à frente.',
    en: 'The snack table set up at the pitch, with the sponsors’ banner in front of it.',
    es: 'Mesa de las meriendas montada en el campo, con el panel de los patrocinadores al frente.',
  }),
  doAcervo('polo-estancia-abertura', {
    pt: 'Abertura do polo de Estância, com a equipe do projeto diante do painel institucional.',
    en: 'Opening of the Estância hub, with the project team in front of the institutional banner.',
    es: 'Apertura del polo de Estância, con el equipo del proyecto frente al panel institucional.',
  }),
  doAcervo('polo-estancia-foto-no-painel', {
    pt: 'Criança posa com a equipe do projeto diante do painel dos patrocinadores, no polo de Estância.',
    en: 'A child poses with the project team in front of the sponsors’ banner at the Estância hub.',
    es: 'Participante posa con el equipo del proyecto ante el panel de los patrocinadores, en el polo de Estância.',
  }),
  doAcervo('polo-estancia-materiais-na-mesa', {
    pt: 'Cones, coletes e chuteiras sobre a mesa, no dia da entrega dos materiais em Estância.',
    en: 'Cones, bibs and boots on the table on equipment handout day in Estância.',
    es: 'Conos, petos y botines sobre la mesa, el día de la entrega de materiales en Estância.',
  }),
  doAcervo('polo-estancia-turma-reunida', {
    pt: 'Crianças uniformizadas reunidas no campo do polo de Estância.',
    en: 'Children in kit gathered on the pitch at the Estância hub.',
    es: 'Niños uniformados reunidos en el campo del polo de Estância.',
  }),
]

/**
 * GALERIA DO FUTSAL NA ESCOLA
 * ===========================
 * O álbum do projeto na quadra coberta, na ordem da atividade: a turma
 * reunida, a equipe que conduz, o treino, a partida e a despedida.
 *
 * TODO O ACERVO DESTE PROJETO É UMA TARDE
 * ---------------------------------------
 * As onze fotografias saem dos catorze arquivos da pasta "AIDEP - Futsal",
 * feitos na mesma quadra no mesmo dia. Os três outros não entram porque
 * repetem quadro já publicado ou saíram borrados — a curadoria explica
 * cada um em `scripts/lib/acervo.mjs`.
 *
 * É a razão de esta galeria ser a menor das três: não sobrou material bom
 * de fora. Enriquecer daqui em diante depende de nova entrega da
 * associação — no acervo bruto não há vídeo desta quadra, e o que existe
 * de outra data é do Coração Valente.
 */
export const galeriaFutsalNaEscola: MediaAsset[] = [
  doAcervo('futsal-na-escola-turma', {
    pt: 'Turma do Futsal na Escola reunida na quadra coberta, com os coletes e as bolas do projeto.',
    en: 'The Futsal na Escola group gathered on the indoor court, with the project’s bibs and balls.',
    es: 'El grupo de Futsal na Escola reunido en la cancha cubierta, con los petos y los balones del proyecto.',
  }),
  doAcervo('futsal-na-escola-equipe', {
    pt: 'Equipe de professoras do Futsal na Escola reunida na quadra, de uniforme do projeto.',
    en: 'The Futsal na Escola teaching team together on the court, in project kit.',
    es: 'Equipo de profesoras de Futsal na Escola reunido en la cancha, con el uniforme del proyecto.',
  }),
  doAcervo('futsal-na-escola-treino', {
    pt: 'Jovens disputam a bola durante o treino, com o mural da quadra ao fundo.',
    en: 'Teenagers going for the ball during training, with the court’s mural behind them.',
    es: 'Jóvenes disputan el balón durante el entrenamiento, con el mural de la cancha al fondo.',
  }),
  doAcervo('futsal-na-escola-atividade-na-quadra', {
    pt: 'Atividade em andamento na quadra coberta, vista da lateral, com o mural pintado ao longo da parede.',
    en: 'The activity under way on the indoor court, seen from the sideline, with the painted mural along the wall.',
    es: 'Actividad en curso en la cancha cubierta, vista desde la banda, con el mural pintado a lo largo de la pared.',
  }),
  doAcervo('futsal-na-escola-uniforme', {
    pt: 'Menino de uniforme do projeto na quadra, antes do início da atividade.',
    en: 'A boy in the project’s kit on the court, before the activity starts.',
    es: 'Un niño con el uniforme del proyecto en la cancha, antes del inicio de la actividad.',
  }),
  doAcervo('futsal-na-escola-de-uniforme-na-quadra', {
    pt: 'Criança de uniforme completo do projeto na quadra coberta, com a turma jogando ao fundo.',
    en: 'A child in the project’s full kit on the indoor court, with the group playing behind.',
    es: 'Participante con el uniforme completo del proyecto en la cancha cubierta, con el grupo jugando al fondo.',
  }),
  doAcervo('futsal-na-escola-professor', {
    pt: 'Atividade em andamento na quadra coberta, com os adolescentes espalhados pelo espaço.',
    en: 'Activity under way on the indoor court, with the teenagers spread across the space.',
    es: 'Actividad en curso en la cancha cubierta, con los adolescentes repartidos por el espacio.',
  }),
  doAcervo('futsal-na-escola-jogo', {
    pt: 'Partida em andamento na quadra coberta, durante a atividade do projeto.',
    en: 'A match under way on the indoor court during the project activity.',
    es: 'Partido en marcha en la cancha cubierta, durante la actividad del proyecto.',
  }),
  doAcervo('futsal-na-escola-jogo-junto-ao-mural', {
    pt: 'Adolescentes disputam a bola junto ao mural da quadra, durante a atividade.',
    en: 'Teenagers going for the ball beside the court’s mural during the activity.',
    es: 'Adolescentes disputan el balón junto al mural de la cancha, durante la actividad.',
  }),
  doAcervo('futsal-na-escola-lateral', {
    pt: 'Grupo sentado na lateral acompanha a partida enquanto os outros jogam.',
    en: 'A group sitting on the sideline follows the match while the others play.',
    es: 'Un grupo sentado en la banda sigue el partido mientras los demás juegan.',
  }),
  doAcervo('futsal-na-escola-fim-da-atividade', {
    pt: 'Turma reunida na quadra ao fim da atividade, entre risadas.',
    en: 'The group gathered on the court at the end of the activity, laughing together.',
    es: 'El grupo reunido en la cancha al final de la actividad, entre risas.',
  }),
]

/**
 * GALERIA DO FUTEDU SUMMIT
 * ========================
 * O álbum do encontro de Curitiba, agora com a segunda entrega do acervo —
 * a do fotógrafo do evento, em 4928×3264, que trouxe o que faltava: o
 * torneio no gramado, a quadra coberta, a Arena da Baixada, a delegação do
 * futsal inclusivo e a feira. Ver `scripts/lib/acervo.mjs`.
 *
 * A ORDEM NÃO É A DO RELÓGIO, E É DE PROPÓSITO
 * --------------------------------------------
 * A galeria carrega em lotes de doze (ver `LOTE` em
 * `sections/project-gallery.tsx`) — quem chega vê os doze primeiros e só
 * pede mais se quiser. Em ordem cronológica esses doze seriam o pórtico, o
 * credenciamento e a feira: nove fotografias de logística antes da
 * primeira bola. Por isso os doze primeiros são uma abertura montada — o
 * lugar, o jogo, a alegria, os times, a delegação internacional, o futsal
 * inclusivo, a formação e a cerimônia —, e o Summit inteiro se lê numa
 * tela. Depois dela o álbum segue por blocos, na ordem do evento:
 * chegada e feira, formação, torneio, quadra coberta, arena, futsal
 * inclusivo e certificados.
 */
export const galeriaFuteduSummit: MediaAsset[] = [
  /* A abertura do álbum — o Summit resumido em doze quadros. */
  doAcervo('futedu-summit-portico', {
    pt: 'Pórtico de boas-vindas do FutEdu Summit sobre a alameda de entrada, em Curitiba.',
    en: 'The FutEdu Summit welcome arch over the entrance walkway, in Curitiba, Brazil.',
    es: 'Pórtico de bienvenida del FutEdu Summit sobre la alameda de entrada, en Curitiba, Brasil.',
  }),
  doAcervo('futedu-summit-chute-a-gol', {
    pt: 'Menino de uniforme azul e preto chuta a bola diante do painel da Federação do Desporto Escolar do Paraná, no torneio do Summit.',
    en: 'A boy in blue and black kit strikes the ball in front of the Paraná school sport federation banner at the Summit tournament.',
    es: 'Un niño con uniforme azul y negro golpea el balón frente al panel de la federación de deporte escolar de Paraná, en el torneo del Summit.',
  }),
  doAcervo('futedu-summit-comemoracao-no-gol', {
    pt: 'Time de crianças comemora dentro do gol, com os braços erguidos e a treinadora no meio da roda.',
    en: 'A children’s team celebrates inside the goal, arms raised, with their coach in the middle of the group.',
    es: 'Un equipo de niños celebra dentro de la portería, con los brazos en alto y la entrenadora en medio del grupo.',
  }),
  doAcervo('futedu-summit-coracao-para-a-torcida', {
    pt: 'Menina de uniforme preto comemora fazendo um coração com as mãos, ainda em campo.',
    en: 'A girl in black kit celebrates making a heart with her hands, still on the pitch.',
    es: 'Una niña con uniforme negro celebra formando un corazón con las manos, aún en el campo.',
  }),
  doAcervo('futedu-summit-time-no-gramado', {
    pt: 'Time perfilado no gramado sob o céu azul, com um dos meninos erguido pelos colegas.',
    en: 'A team lined up on the grass under a blue sky, one of the boys lifted by his teammates.',
    es: 'Un equipo alineado en el césped bajo el cielo azul, con uno de los niños alzado por sus compañeros.',
  }),
  doAcervo('futedu-summit-delegacao-internacional', {
    pt: 'Delegação internacional de crianças reunida com a organização no gramado da arena, em Curitiba.',
    en: 'An international delegation of children gathered with the organisers on the arena pitch, in Curitiba.',
    es: 'Delegación internacional de niños reunida con la organización en el césped de la arena, en Curitiba.',
  }),
  doAcervo('futedu-summit-atletas-comemoram', {
    pt: 'Atletas da delegação de futsal inclusivo comemoram abraçados, no meio da plateia do Summit.',
    en: 'Athletes from the inclusive futsal delegation celebrate in a hug, among the Summit audience.',
    es: 'Atletas de la delegación de futsal inclusivo celebran abrazados, entre el público del Summit.',
  }),
  doAcervo('futedu-summit-formacao', {
    pt: 'Formador fala ao microfone durante uma das sessões do Summit para professores e treinadores, com a apresentação projetada ao lado.',
    en: 'A trainer speaks into the microphone during one of the Summit sessions for teachers and coaches, the slides projected beside him.',
    es: 'Un formador habla al micrófono durante una de las sesiones del Summit para profesores y entrenadores, con la presentación proyectada al lado.',
  }),
  doAcervo('futedu-summit-abraco-do-treinador', {
    pt: 'Treinador abraça um dos meninos do time junto à trave, no fim da partida.',
    en: 'A coach hugs one of the boys from his team by the goalpost at the end of the match.',
    es: 'Un entrenador abraza a uno de los niños del equipo junto al poste, al final del partido.',
  }),
  doAcervo('futedu-summit-goleiro-comemora', {
    pt: 'Goleiro de uniforme preto comemora com a camisa na mão erguida, depois da defesa.',
    en: 'A goalkeeper in black kit celebrates with his shirt raised in his hand after the save.',
    es: 'Un portero con uniforme negro celebra con la camiseta en la mano en alto, después de la parada.',
  }),
  doAcervo('futedu-summit-entrega-de-certificado', {
    pt: 'Duas educadoras seguram juntas o certificado recebido no Summit, de uniforme dos seus clubes.',
    en: 'Two educators hold the certificate they received at the Summit, wearing their clubs’ kit.',
    es: 'Dos educadoras sostienen juntas el certificado recibido en el Summit, con el uniforme de sus clubes.',
  }),
  doAcervo('futedu-summit-plateia-no-auditorio', {
    pt: 'Plateia do Summit lotada durante uma das sessões, com as mesas ocupadas de ponta a ponta.',
    en: 'A packed Summit audience during one of the sessions, every table occupied end to end.',
    es: 'Público del Summit lleno durante una de las sesiones, con las mesas ocupadas de punta a punta.',
  }),

  /* Chegada e feira */
  doAcervo('futedu-summit-portico-time-feminino', {
    pt: 'Time feminino de base posa para a foto sob o pórtico de boas-vindas do Summit.',
    en: 'A girls’ youth team poses for a photo under the Summit welcome arch.',
    es: 'Un equipo femenino de base posa para la foto bajo el pórtico de bienvenida del Summit.',
  }),
  doAcervo('futedu-summit-portico-com-a-equipe', {
    pt: 'Equipe da organização reunida sob o pórtico de entrada, no começo do dia.',
    en: 'The organising team gathered under the entrance arch at the start of the day.',
    es: 'El equipo de la organización reunido bajo el pórtico de entrada, al comienzo del día.',
  }),
  doAcervo('futedu-summit-credenciamento', {
    pt: 'Fila no balcão de credenciamento do Summit, com os participantes retirando as credenciais.',
    en: 'The queue at the Summit accreditation desk, participants collecting their badges.',
    es: 'Fila en el mostrador de acreditación del Summit, con los participantes retirando sus credenciales.',
  }),
  doAcervo('futedu-summit-feira-com-as-criancas', {
    pt: 'Homem atravessa a feira do evento com um grupo de meninos, carregando a bolsa do time.',
    en: 'A man walks through the event fair with a group of boys, carrying the team bag.',
    es: 'Un hombre atraviesa la feria del evento con un grupo de niños, cargando la bolsa del equipo.',
  }),
  doAcervo('futedu-summit-a-caminho-da-quadra', {
    pt: 'Senhor caminha com três meninos de uniforme pela feira do Summit, um deles com as chuteiras na mão.',
    en: 'An older man walks with three boys in kit through the Summit fair, one of them carrying his boots.',
    es: 'Un señor camina con tres niños de uniforme por la feria del Summit, uno de ellos con los botines en la mano.',
  }),
  doAcervo('futedu-summit-chuteiras-na-feira', {
    pt: 'Chuteiras expostas sobre a mesa de um estande montado atrás da rede do gol.',
    en: 'Football boots displayed on the table of a stand set up behind the goal net.',
    es: 'Botines expuestos sobre la mesa de un estand montado detrás de la red de la portería.',
  }),
  doAcervo('futedu-summit-feira-atendimento', {
    pt: 'Expositor atende uma visitante no estande de material esportivo da feira do Summit.',
    en: 'An exhibitor serves a visitor at the sports equipment stand in the Summit fair.',
    es: 'Un expositor atiende a una visitante en el estand de material deportivo de la feria del Summit.',
  }),
  doAcervo('futedu-summit-comissoes-no-palco', {
    pt: 'Representantes de clubes e federações perfilados diante do painel do Summit, cada um com o uniforme da sua instituição.',
    en: 'Representatives of clubs and federations lined up in front of the Summit banner, each in their institution’s kit.',
    es: 'Representantes de clubes y federaciones alineados frente al panel del Summit, cada uno con el uniforme de su institución.',
  }),

  /* Formação, palestras e plateia */
  doAcervo('futedu-summit-mediacao-no-palco', {
    pt: 'Mediador conduz uma das mesas do Summit ao microfone, com o painel do evento projetado atrás.',
    en: 'A host runs one of the Summit panels with a microphone, the event artwork projected behind him.',
    es: 'Un moderador conduce una de las mesas del Summit al micrófono, con el panel del evento proyectado detrás.',
  }),
  doAcervo('futedu-summit-plateia-atenta', {
    pt: 'Três educadoras acompanham a palestra da primeira fila, de credencial no peito.',
    en: 'Three educators follow the talk from the front row, badges on their chests.',
    es: 'Tres educadoras siguen la charla desde la primera fila, con la credencial en el pecho.',
  }),
  doAcervo('futedu-summit-apresentacao-de-pesquisa', {
    pt: 'Estudante apresenta a análise estatística do seu trabalho na tela da sala de aula.',
    en: 'A student presents the statistical analysis from her research on the classroom screen.',
    es: 'Una estudiante presenta el análisis estadístico de su trabajo en la pantalla del aula.',
  }),
  doAcervo('futedu-summit-oficina-de-saude', {
    pt: 'Turma de crianças de uniforme reunida na sala depois da oficina de saúde bucal, com o material da atividade nas mãos.',
    en: 'A class of children in kit gathered in the room after the oral health workshop, holding the activity’s materials.',
    es: 'Un grupo de niños de uniforme reunido en el aula después del taller de salud bucal, con el material de la actividad en las manos.',
  }),
  doAcervo('futedu-summit-sala-de-aula', {
    pt: 'Sala de aula da universidade ocupada durante uma das formações do Summit.',
    en: 'A university classroom in use during one of the Summit’s training sessions.',
    es: 'Aula de la universidad ocupada durante una de las formaciones del Summit.',
  }),
  doAcervo('futedu-summit-participantes', {
    pt: 'Participantes do Summit reunidos no palco, diante do painel com as marcas do evento.',
    en: 'Summit participants gathered on stage, in front of the banner with the event’s brands.',
    es: 'Participantes del Summit reunidos en el escenario, frente al panel con las marcas del evento.',
  }),
  doAcervo('futedu-summit-cerimonia-de-abertura', {
    pt: 'Apresentadora abre a cerimônia do Summit no púlpito, com o roteiro nas mãos.',
    en: 'The host opens the Summit ceremony at the lectern, script in hand.',
    es: 'La presentadora abre la ceremonia del Summit en el atril, con el guion en las manos.',
  }),

  /* Torneio no gramado */
  doAcervo('futedu-summit-bola-na-linha', {
    pt: 'Goleiro segura a bola junto à linha lateral, diante do painel da Federação do Desporto Escolar do Paraná.',
    en: 'A goalkeeper holds the ball by the touchline, in front of the Paraná school sport federation banner.',
    es: 'Un portero sostiene el balón junto a la línea lateral, frente al panel de la federación de deporte escolar de Paraná.',
  }),
  doAcervo('futedu-summit-jogada-na-partida', {
    pt: 'Jogada em andamento no gramado, com meninos dos dois times disputando a bola.',
    en: 'A move under way on the grass, boys from both teams chasing the ball.',
    es: 'Una jugada en marcha en el césped, con niños de los dos equipos disputando el balón.',
  }),
  doAcervo('futedu-summit-gol-comemorado', {
    pt: 'Menino comemora o gol correndo de joelhos, com os colegas atrás do gol de pé, festejando.',
    en: 'A boy celebrates his goal sliding on his knees, teammates cheering behind the goal.',
    es: 'Un niño celebra el gol deslizándose de rodillas, con los compañeros festejando detrás de la portería.',
  }),
  doAcervo('futedu-summit-corrida-de-comemoracao', {
    pt: 'Menino de uniforme preto corre com os braços abertos para comemorar, no gramado do torneio.',
    en: 'A boy in black kit runs with his arms wide to celebrate on the tournament pitch.',
    es: 'Un niño con uniforme negro corre con los brazos abiertos para celebrar, en el césped del torneo.',
  }),
  doAcervo('futedu-summit-chute-da-atleta', {
    pt: 'Atleta de uniforme branco chuta a bola em movimento, durante a partida no gramado.',
    en: 'A player in white kit strikes the ball on the run during the match on the grass.',
    es: 'Una atleta con uniforme blanco golpea el balón en movimiento, durante el partido en el césped.',
  }),
  doAcervo('futedu-summit-abraco-no-fim-do-jogo', {
    pt: 'Dois meninos, o uniforme tomado de barro, se abraçam ao fim da partida.',
    en: 'Two boys, their kit covered in mud, hug each other at the end of the match.',
    es: 'Dos niños, con el uniforme cubierto de barro, se abrazan al final del partido.',
  }),
  doAcervo('futedu-summit-dupla-comemora', {
    pt: 'Dois meninos de uniforme verde comemoram juntos, correndo pelo gramado.',
    en: 'Two boys in green kit celebrate together, running across the grass.',
    es: 'Dos niños con uniforme verde celebran juntos, corriendo por el césped.',
  }),
  doAcervo('futedu-summit-comemoracao-em-campo', {
    pt: 'Meninos do time comemoram abraçados em campo, ainda no calor do jogo.',
    en: 'Boys from the team celebrate in a hug on the pitch, still caught up in the game.',
    es: 'Niños del equipo celebran abrazados en el campo, aún en el calor del partido.',
  }),
  doAcervo('futedu-summit-comemoracao-com-o-tecnico', {
    pt: 'Time comemora junto com o técnico à beira do campo, no fim da partida.',
    en: 'The team celebrates with their coach at the edge of the pitch at the end of the match.',
    es: 'El equipo celebra junto al técnico al borde del campo, al final del partido.',
  }),
  doAcervo('futedu-summit-comemoracao-com-a-comissao', {
    pt: 'Crianças e comissão técnica comemoram de braços erguidos, todos juntos no gramado.',
    en: 'Children and coaching staff celebrate with their arms raised, all together on the grass.',
    es: 'Niños y cuerpo técnico celebran con los brazos en alto, todos juntos en el césped.',
  }),
  doAcervo('futedu-summit-cumprimento-no-fim', {
    pt: 'Os dois times se cumprimentam em fila diante do gol, no apito final.',
    en: 'The two teams shake hands in line in front of the goal at the final whistle.',
    es: 'Los dos equipos se saludan en fila frente a la portería, en el pitido final.',
  }),
  doAcervo('futedu-summit-professor-na-trave', {
    pt: 'Professor de uniforme verde orienta os meninos junto à trave, com as mãos erguidas.',
    en: 'A teacher in green kit directs the boys by the goalpost, hands raised.',
    es: 'Un profesor con uniforme verde orienta a los niños junto al poste, con las manos en alto.',
  }),
  doAcervo('futedu-summit-medalhas-no-podio', {
    pt: 'Time de crianças com as medalhas no peito posa com a comissão técnica, no fim do torneio.',
    en: 'A children’s team with medals around their necks poses with the coaching staff at the end of the tournament.',
    es: 'Equipo de niños con las medallas en el pecho posa con el cuerpo técnico, al final del torneo.',
  }),
  doAcervo('futedu-summit-conversa-antes-do-jogo', {
    pt: 'Treinador conversa com o time reunido em roda antes da partida, no gramado.',
    en: 'A coach talks to his team huddled together before the match on the grass.',
    es: 'El entrenador conversa con el equipo reunido en círculo antes del partido, en el césped.',
  }),
  doAcervo('futedu-summit-time-feminino-em-roda', {
    pt: 'Time feminino reunido em roda com o treinador antes de entrar em campo.',
    en: 'A girls’ team huddled with their coach before taking the field.',
    es: 'Equipo femenino reunido en círculo con el entrenador antes de entrar al campo.',
  }),
  doAcervo('futedu-summit-roda-no-gramado', {
    pt: 'Time reunido em roda no gramado, diante do prédio da universidade.',
    en: 'A team huddled on the grass in front of the university building.',
    es: 'Equipo reunido en círculo en el césped, frente al edificio de la universidad.',
  }),
  doAcervo('futedu-summit-roda-antes-da-partida', {
    pt: 'Roda do time antes da partida, com as tendas do evento montadas ao fundo.',
    en: 'The team huddle before the match, the event marquees set up behind them.',
    es: 'Círculo del equipo antes del partido, con las tiendas del evento montadas al fondo.',
  }),
  doAcervo('futedu-summit-delegacao-no-campo', {
    pt: 'Delegação inteira reunida no gramado para a foto oficial, com a bola no chão à frente.',
    en: 'The whole delegation gathered on the grass for the official photo, the ball on the ground in front.',
    es: 'La delegación entera reunida en el césped para la foto oficial, con el balón en el suelo delante.',
  }),
  doAcervo('futedu-summit-torneio', {
    pt: 'Times e comissões reunidos no campo ao fim da tarde, no torneio do Summit.',
    en: 'Teams and staff gathered on the pitch at dusk during the Summit tournament.',
    es: 'Equipos y cuerpos técnicos reunidos en el campo al final de la tarde, en el torneo del Summit.',
  }),
  doAcervo('futedu-summit-hidratacao', {
    pt: 'Meninos de uniforme pegam garrafas de água na mesa, no intervalo das partidas.',
    en: 'Boys in kit pick up water bottles from the table during the break between matches.',
    es: 'Niños con uniforme cogen botellas de agua de la mesa, en el descanso entre partidos.',
  }),

  /* Quadra coberta */
  doAcervo('futedu-summit-drible-na-quadra', {
    pt: 'Menino conduz a bola na quadra coberta, durante a partida de futsal.',
    en: 'A boy takes the ball forward on the indoor court during the futsal match.',
    es: 'Un niño conduce el balón en la cancha cubierta, durante el partido de futsal.',
  }),
  doAcervo('futedu-summit-atleta-na-quadra', {
    pt: 'Atleta de uniforme listrado aguarda a jogada no meio da quadra coberta.',
    en: 'A player in striped kit waits for the play in the middle of the indoor court.',
    es: 'Un atleta con uniforme a rayas espera la jugada en el centro de la cancha cubierta.',
  }),
  doAcervo('futedu-summit-time-feminino-na-quadra', {
    pt: 'Time feminino aquece na quadra coberta antes da partida, com as bolas no chão.',
    en: 'A girls’ team warms up on the indoor court before the match, balls on the floor.',
    es: 'Equipo femenino calienta en la cancha cubierta antes del partido, con los balones en el suelo.',
  }),
  doAcervo('futedu-summit-jogo-na-quadra', {
    pt: 'Partida de futsal na quadra coberta do Summit, com os dois times em campo.',
    en: 'A futsal match on the Summit’s indoor court, with both teams playing.',
    es: 'Partido de futsal en la cancha cubierta del Summit, con los dos equipos en juego.',
  }),
  doAcervo('futedu-summit-times-na-quadra', {
    pt: 'Times sentados na quadra coberta com as comissões, à espera do início da rodada.',
    en: 'Teams seated on the indoor court with their staff, waiting for the round to start.',
    es: 'Equipos sentados en la cancha cubierta con los cuerpos técnicos, esperando el inicio de la ronda.',
  }),
  doAcervo('futedu-summit-grupo-na-quadra', {
    pt: 'Grupo do dia reunido no centro da quadra coberta para a foto, com a bola na linha.',
    en: 'The day’s group gathered at the centre of the indoor court for a photo, ball on the line.',
    es: 'El grupo del día reunido en el centro de la cancha cubierta para la foto, con el balón en la línea.',
  }),
  doAcervo('futedu-summit-times-reunidos-na-quadra', {
    pt: 'Times masculino e feminino reunidos na quadra coberta ao fim da atividade.',
    en: 'The men’s and women’s teams gathered on the indoor court at the end of the session.',
    es: 'Equipos masculino y femenino reunidos en la cancha cubierta al final de la actividad.',
  }),

  /* Arena da Baixada */
  doAcervo('futedu-summit-conversa-na-arena', {
    pt: 'Conversa com o time no gramado da arena, antes da atividade começar.',
    en: 'A talk with the team on the arena pitch before the activity starts.',
    es: 'Charla con el equipo en el césped de la arena, antes de que empiece la actividad.',
  }),
  doAcervo('futedu-summit-delegacao-na-arena', {
    pt: 'Delegação perfilada no gramado da arena com a comissão técnica, para a foto oficial.',
    en: 'The delegation lined up on the arena pitch with the coaching staff for the official photo.',
    es: 'Delegación alineada en el césped de la arena con el cuerpo técnico, para la foto oficial.',
  }),
  doAcervo('futedu-summit-time-inclusivo-na-arena', {
    pt: 'Time de futsal inclusivo posa no gramado da arena, de uniforme amarelo e azul.',
    en: 'The inclusive futsal team poses on the arena pitch in yellow and blue kit.',
    es: 'El equipo de futsal inclusivo posa en el césped de la arena, con uniforme amarillo y azul.',
  }),
  doAcervo('futedu-summit-time-inclusivo-perfilado', {
    pt: 'Time de futsal inclusivo perfilado no gramado da arena, com as arquibancadas vazias ao fundo.',
    en: 'The inclusive futsal team lined up on the arena pitch, the empty stands behind them.',
    es: 'Equipo de futsal inclusivo alineado en el césped de la arena, con las gradas vacías al fondo.',
  }),
  doAcervo('futedu-summit-sala-de-trofeus', {
    pt: 'Delegação visita a sala de troféus do estádio, com as taças iluminadas nas vitrines.',
    en: 'The delegation visits the stadium trophy room, the cups lit up in their cases.',
    es: 'La delegación visita la sala de trofeos del estadio, con las copas iluminadas en las vitrinas.',
  }),
  doAcervo('futedu-summit-na-arena', {
    pt: 'Delegação perfilada no gramado da arena, com as arquibancadas vazias ao fundo.',
    en: 'A delegation lined up on the arena pitch, with the empty stands behind them.',
    es: 'Delegación alineada en el césped de la arena, con las gradas vacías al fondo.',
  }),
  doAcervo('futedu-summit-time-na-arena', {
    pt: 'Time de uniforme amarelo posa para a foto no gramado da arena, ao lado da comissão técnica.',
    en: 'A team in yellow kit poses for a photo on the arena pitch, beside the coaching staff.',
    es: 'Un equipo con uniforme amarillo posa para la foto en el césped de la arena, junto al cuerpo técnico.',
  }),
  doAcervo('futedu-summit-roda-de-time', {
    pt: 'Time de crianças reunido em roda com os treinadores, dentro da arena do Summit.',
    en: 'A children’s team huddled with their coaches inside the Summit arena.',
    es: 'Equipo de niños reunido en círculo con los entrenadores, dentro de la arena del Summit.',
  }),
  doAcervo('futedu-summit-encontro-com-o-atleta', {
    pt: 'Menino de uniforme azul posa ao lado de um atleta, no estande do evento.',
    en: 'A boy in blue kit poses beside an athlete at the event stand.',
    es: 'Un niño con uniforme azul posa al lado de un atleta, en el estand del evento.',
  }),

  /* Futsal inclusivo */
  doAcervo('futedu-summit-time-inclusivo-saudacao', {
    pt: 'Atletas do futsal inclusivo e convidados saúdam a plateia do palco, de mãos erguidas.',
    en: 'Inclusive futsal athletes and guests wave to the audience from the stage, hands raised.',
    es: 'Atletas del futsal inclusivo e invitados saludan al público desde el escenario, con las manos en alto.',
  }),
  doAcervo('futedu-summit-time-inclusivo-no-palco', {
    pt: 'Delegação do futsal inclusivo reunida no palco com a organização do Summit.',
    en: 'The inclusive futsal delegation gathered on stage with the Summit organisers.',
    es: 'Delegación del futsal inclusivo reunida en el escenario con la organización del Summit.',
  }),
  doAcervo('futedu-summit-camisa-do-futsal-inclusivo', {
    pt: 'Apresentação da camisa e da bandeira do projeto de futsal inclusivo no palco do Summit.',
    en: 'The inclusive futsal project’s shirt and banner presented on the Summit stage.',
    es: 'Presentación de la camiseta y la bandera del proyecto de futsal inclusivo en el escenario del Summit.',
  }),
  doAcervo('futedu-summit-atleta-na-plateia', {
    pt: 'Atleta da delegação de futsal inclusivo acompanha a programação do Summit na plateia.',
    en: 'An athlete from the inclusive futsal delegation follows the Summit programme from the audience.',
    es: 'Un atleta de la delegación de futsal inclusivo sigue la programación del Summit desde el público.',
  }),
  doAcervo('futedu-summit-delegacoes', {
    pt: 'Atletas e educadores das delegações posam para a foto oficial diante do painel do Summit.',
    en: 'Athletes and educators from the delegations pose for the official photo in front of the Summit banner.',
    es: 'Atletas y educadores de las delegaciones posan para la foto oficial frente al panel del Summit.',
  }),

  /* Certificados e troféus */
  doAcervo('futedu-summit-professoras-com-certificado', {
    pt: 'Professoras de uniforme dos seus clubes mostram os certificados recebidos no palco.',
    en: 'Teachers in their clubs’ kit show the certificates they received on stage.',
    es: 'Profesoras con el uniforme de sus clubes muestran los certificados recibidos en el escenario.',
  }),
  doAcervo('futedu-summit-educadoras-no-palco', {
    pt: 'Grupo de educadoras reunido no palco do Summit na entrega dos certificados.',
    en: 'A group of educators gathered on the Summit stage for the certificate handover.',
    es: 'Grupo de educadoras reunido en el escenario del Summit en la entrega de los certificados.',
  }),
  doAcervo('futedu-summit-trofeu-no-palco', {
    pt: 'Entrega do troféu do FutEdu Summit no palco, entre dois dos homenageados.',
    en: 'The FutEdu Summit trophy handed over on stage between two of those honoured.',
    es: 'Entrega del trofeo del FutEdu Summit en el escenario, entre dos de los homenajeados.',
  }),
  doAcervo('futedu-summit-certificado', {
    pt: 'Entrega de certificado no palco do Summit, com o painel do evento ao fundo.',
    en: 'A certificate handed over on the Summit stage, with the event banner behind.',
    es: 'Entrega de certificado en el escenario del Summit, con el panel del evento al fondo.',
  }),
  doAcervo('futedu-summit-palco', {
    pt: 'Palco do FutEdu Summit durante a cerimônia, com o painel do evento ao fundo.',
    en: 'The FutEdu Summit stage during the ceremony, with the event banner behind.',
    es: 'Escenario del FutEdu Summit durante la ceremonia, con el panel del evento al fondo.',
  }),
]

/**
 * Álbuns por projeto. É o que a página do projeto usa enquanto o cliente
 * não montar a galeria dele pelo painel. Os três têm hoje o álbum do
 * próprio projeto, fotografado no lugar onde ele acontece.
 */
const galerias: Record<string, MediaAsset[]> = {
  'coracao-valente': galeriaCoracaoValente,
  'futsal-na-escola': galeriaFutsalNaEscola,
  'futedu-summit': galeriaFuteduSummit,
}

/**
 * Galeria de um projeto, na mesma ordem de prioridade das capas:
 *
 *   1. as fotos que o cliente subiu pelo painel;
 *   2. o álbum oficial do acervo, registrado acima pelo slug;
 *   3. lista vazia — e a seção de galeria simplesmente não aparece.
 *
 * Existe porque o projeto que vem do painel chega com a galeria vazia
 * enquanto ninguém subiu foto nenhuma por lá. Sem este passo, importar os
 * projetos para o painel apagaria da página o acervo que já está publicado.
 */
export function galleryOf(project: {
  slug: string
  gallery: MediaAsset[]
}): MediaAsset[] {
  if (project.gallery.length > 0) return project.gallery
  return galerias[project.slug] ?? []
}

/**
 * Imagem de uma chave: a fotografia oficial se já houver, senão a de banco.
 * `null` só quando a chave não existe em nenhum dos dois registros — aí a
 * moldura exibe o painel institucional da marca.
 */
export function getMedia(key: string): MediaAsset | null {
  return media[key] ?? getStockMedia(key)
}

/**
 * Capa de uma notícia ou de um projeto, na ordem de prioridade certa:
 *
 *   1. a imagem que o cliente enviou pelo painel (`cover`);
 *   2. a fotografia oficial registrada em `media` para a chave;
 *   3. a fotografia de banco equivalente, creditada;
 *   4. `null` — e a moldura exibe o painel institucional da marca.
 *
 * Conteúdo criado no painel sempre tem `coverKey` sem correspondente nos
 * registros acima, então cai direto no que foi enviado ou no painel da
 * marca. Nenhuma imagem é inventada em nenhum dos casos.
 */
export function coverOf(item: {
  cover?: MediaAsset | null
  coverKey: string
}): MediaAsset | null {
  return item.cover ?? getMedia(item.coverKey)
}

/**
 * Posts do Instagram publicados no site.
 * Não existe integração com a API do Instagram: os posts abaixo são
 * cadastrados manualmente. Enquanto a lista estiver vazia, a seção exibe
 * apenas a chamada para o perfil oficial.
 */
export type InstagramPost = {
  id: string
  url: string
  image: MediaAsset
  caption: string
}

export const instagramPosts: InstagramPost[] = []
