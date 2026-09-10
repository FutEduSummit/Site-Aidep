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

  'home.audience.teenagers': doAcervo('futsal-na-escola-treino', {
    pt: 'Adolescentes disputam a bola durante o treino do Futsal na Escola, com o mural da quadra ao fundo.',
    en: 'Teenagers going for the ball during a Futsal na Escola training session, with the court’s mural behind them.',
    es: 'Adolescentes disputan el balón durante el entrenamiento de Futsal na Escola, con el mural de la cancha al fondo.',
  }),

  'home.audience.youth': doAcervo('futsal-na-escola-fim-da-atividade', {
    pt: 'Jovens reunidos no meio da quadra ao fim da atividade do Futsal na Escola.',
    en: 'Young people gathered in the middle of the court at the end of the Futsal na Escola session.',
    es: 'Jóvenes reunidos en el centro de la cancha al final de la actividad de Futsal na Escola.',
  }),

  'home.audience.adults': doAcervo('futedu-summit-formacao', {
    pt: 'Formador aponta para a tela durante uma das sessões do Summit para professores e treinadores.',
    en: 'A trainer points at the screen during one of the Summit sessions for teachers and coaches.',
    es: 'Un formador señala la pantalla durante una de las sesiones del Summit para profesores y entrenadores.',
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

  ...capaDeNoticia('futsal-na-escola-em-doze-cidades', 'futsal-na-escola-turma', {
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
 * A primeira é a mesma foto de `home.hero`: a abertura pinta igual ao que
 * pintava antes de o carrossel existir, e é ela que carrega com prioridade.
 * Da segunda em diante o acervo mostra a extensão do trabalho — a rua da
 * comunidade, o campo, a quadra coberta e a arena do encontro em Curitiba.
 *
 * Valem as duas regras das faixas de fundo (ver `ui/banner-carousel.tsx`):
 * fotografia **larga** e com **espaço livre à esquerda**, onde entra o
 * título. Foto em pé não entra aqui — sangrada na largura toda, sobraria
 * dela só uma tira do meio.
 */
export const carrosselDaHome: MediaAsset[] = [
  aberturaDaHome,

  /* As três tomadas de drone do FutEdu Summit — o único material
     horizontal de todo o acervo, e por isso o único que serve numa faixa
     sangrada na largura da tela. Vão intercaladas com as fotografias, e
     não em bloco: o rodízio alterna movimento e imagem parada em vez de
     virar um comercial de dez segundos seguido de um álbum. */
  daAbertura('futedu-summit-vista-aerea', {
    pt: 'Vista aérea dos campos do FutEdu Summit em Curitiba, com as partidas acontecendo ao mesmo tempo e o público em volta.',
    en: 'Aerial view of the FutEdu Summit pitches in Curitiba, with matches under way side by side and the crowd around them.',
    es: 'Vista aérea de los campos del FutEdu Summit en Curitiba, con los partidos en marcha al mismo tiempo y el público alrededor.',
  }),

  doAcervo('polo-bugio-na-rua', {
    pt: 'Crianças e adolescentes da comunidade reunidos na rua, no dia da inauguração do polo do Bugio, em Aracaju.',
    en: 'Children and teenagers from the community gathered in the street on the opening day of the Bugio hub, in Aracaju.',
    es: 'Niños y adolescentes de la comunidad reunidos en la calle el día de la inauguración del polo de Bugio, en Aracaju.',
  }),

  daAbertura('futedu-summit-arena-do-alto', {
    pt: 'Partida de futsal vista do alto da quadra, no FutEdu Summit.',
    en: 'A futsal match seen from above the court at the FutEdu Summit.',
    es: 'Partido de futsal visto desde lo alto de la cancha, en el FutEdu Summit.',
  }),

  doAcervo('polo-estancia-time-no-campo', {
    pt: 'Turma inteira do polo de Estância perfilada no campo, diante do painel do projeto.',
    en: 'The whole Estância hub group lined up on the pitch in front of the project banner.',
    es: 'Todo el grupo del polo de Estância alineado en el campo, frente al panel del proyecto.',
  }),

  daAbertura('futedu-summit-feira-do-alto', {
    pt: 'Crianças jogando no gramado sintético montado dentro do pavilhão do FutEdu Summit, vistas do alto.',
    en: 'Children playing on the artificial pitch set up inside the FutEdu Summit hall, seen from above.',
    es: 'Niños jugando en el césped sintético montado dentro del pabellón del FutEdu Summit, vistos desde arriba.',
  }),

  doAcervo('futsal-na-escola-turma', {
    pt: 'Turma do Futsal na Escola reunida na quadra coberta, com os coletes e as bolas do projeto.',
    en: 'The Futsal na Escola group gathered on the indoor court, with the project’s bibs and balls.',
    es: 'El grupo de Futsal na Escola reunido en la cancha cubierta, con los petos y los balones del proyecto.',
  }),

  doAcervo('polo-poco-verde-plateia', {
    pt: 'Crianças sentadas lado a lado no ginásio de Poço Verde, acompanhando a abertura do polo.',
    en: 'Children sitting side by side in the Poço Verde sports hall, following the opening of the hub.',
    es: 'Niños sentados uno al lado del otro en el gimnasio de Poço Verde, siguiendo la apertura del polo.',
  }),
]

/**
 * GALERIA DO CORAÇÃO VALENTE
 * ==========================
 * O álbum do projeto, na ordem em que a história se conta: a chegada às
 * comunidades, a inauguração dos polos, a entrega dos materiais, o treino
 * e a competição. Entra em `content/projects.ts` como galeria do projeto.
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
  doAcervo('polo-poco-verde-plateia', {
    pt: 'Crianças sentadas lado a lado no ginásio de Poço Verde.',
    en: 'Children sitting side by side in the Poço Verde sports hall.',
    es: 'Niños sentados uno al lado del otro en el gimnasio de Poço Verde.',
  }),
  doAcervo('polo-estancia-entrega-kit', {
    pt: 'Menino sorri ao abrir o kit entregue pelo projeto, com uniforme e chuteiras.',
    en: 'A boy smiles as he opens the kit handed out by the project, with uniform and boots.',
    es: 'Un niño sonríe al abrir el kit entregado por el proyecto, con uniforme y botines.',
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
  doAcervo('coracao-valente-treino', {
    pt: 'Crianças em atividade no campo de terra, com o professor acompanhando.',
    en: 'Children playing on the dirt pitch with the coach watching over them.',
    es: 'Niños en actividad en el campo de tierra, con el profesor acompañando.',
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
  doAcervo('coracao-valente-encontro', {
    pt: 'Crianças reunidas sob a tenda do projeto, em dia de atividade.',
    en: 'Children gathered under the project marquee on an activity day.',
    es: 'Niños reunidos bajo la carpa del proyecto, en un día de actividad.',
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
  doAcervo('polo-estancia-abertura', {
    pt: 'Abertura do polo de Estância, com a equipe do projeto diante do painel institucional.',
    en: 'Opening of the Estância hub, with the project team in front of the institutional banner.',
    es: 'Apertura del polo de Estância, con el equipo del proyecto frente al panel institucional.',
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
  doAcervo('futsal-na-escola-uniforme', {
    pt: 'Menino de uniforme do projeto na quadra, antes do início da atividade.',
    en: 'A boy in the project’s kit on the court, before the activity starts.',
    es: 'Un niño con el uniforme del proyecto en la cancha, antes del inicio de la actividad.',
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
 * O álbum do encontro de Curitiba, na ordem em que o evento acontece: a
 * chegada, as delegações, a formação, a cerimônia com os certificados e o
 * torneio que fecha a programação.
 */
export const galeriaFuteduSummit: MediaAsset[] = [
  doAcervo('futedu-summit-portico', {
    pt: 'Pórtico de boas-vindas do FutEdu Summit sobre a alameda de entrada, em Curitiba.',
    en: 'The FutEdu Summit welcome arch over the entrance walkway, in Curitiba, Brazil.',
    es: 'Pórtico de bienvenida del FutEdu Summit sobre la alameda de entrada, en Curitiba, Brasil.',
  }),
  doAcervo('futedu-summit-delegacoes', {
    pt: 'Atletas e educadores das delegações posam para a foto oficial diante do painel do Summit.',
    en: 'Athletes and educators from the delegations pose for the official photo in front of the Summit banner.',
    es: 'Atletas y educadores de las delegaciones posan para la foto oficial frente al panel del Summit.',
  }),
  doAcervo('futedu-summit-formacao', {
    pt: 'Formador aponta para a tela durante uma das sessões de formação do Summit.',
    en: 'A trainer points at the screen during one of the Summit’s training sessions.',
    es: 'Un formador señala la pantalla durante una de las sesiones de formación del Summit.',
  }),
  doAcervo('futedu-summit-certificado', {
    pt: 'Entrega de certificado no palco do Summit, com o painel do evento ao fundo.',
    en: 'A certificate handed over on the Summit stage, with the event banner behind.',
    es: 'Entrega de certificado en el escenario del Summit, con el panel del evento al fondo.',
  }),
  doAcervo('futedu-summit-na-arena', {
    pt: 'Delegação perfilada no gramado da arena, com as arquibancadas vazias ao fundo.',
    en: 'A delegation lined up on the arena pitch, with the empty stands behind them.',
    es: 'Delegación alineada en el césped de la arena, con las gradas vacías al fondo.',
  }),
  doAcervo('futedu-summit-participantes', {
    pt: 'Participantes do Summit reunidos no palco, diante do painel com as marcas do evento.',
    en: 'Summit participants gathered on stage, in front of the banner with the event’s brands.',
    es: 'Participantes del Summit reunidos en el escenario, frente al panel con las marcas del evento.',
  }),
  doAcervo('futedu-summit-time-na-arena', {
    pt: 'Time de uniforme amarelo posa para a foto no gramado da arena, ao lado da comissão técnica.',
    en: 'A team in yellow kit poses for a photo on the arena pitch, beside the coaching staff.',
    es: 'Un equipo con uniforme amarillo posa para la foto en el césped de la arena, junto al cuerpo técnico.',
  }),
  doAcervo('futedu-summit-jogo-na-quadra', {
    pt: 'Partida de futsal na quadra coberta do Summit, com os dois times em campo.',
    en: 'A futsal match on the Summit’s indoor court, with both teams playing.',
    es: 'Partido de futsal en la cancha cubierta del Summit, con los dos equipos en juego.',
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
  doAcervo('futedu-summit-palco', {
    pt: 'Palco do FutEdu Summit durante a cerimônia, com o painel do evento ao fundo.',
    en: 'The FutEdu Summit stage during the ceremony, with the event banner behind.',
    es: 'Escenario del FutEdu Summit durante la ceremonia, con el panel del evento al fondo.',
  }),
  doAcervo('futedu-summit-roda-de-time', {
    pt: 'Time de crianças reunido em roda com os treinadores, dentro da arena do Summit.',
    en: 'A children’s team huddled with their coaches inside the Summit arena.',
    es: 'Equipo de niños reunido en círculo con los entrenadores, dentro de la arena del Summit.',
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
