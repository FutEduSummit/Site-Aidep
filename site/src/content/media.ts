import { type ImagemDoAcervo, imagensDoAcervo } from './acervo'
import { getStockMedia } from './media-stock'
import type { Localized, MediaAsset } from './types'

/**
 * REGISTRO DE IMAGENS
 * ===================
 * Fonte da verdade das fotografias oficiais da AIDEP.
 *
 * As fotos abaixo são do acervo entregue pela associação — inaugurações dos
 * polos em Sergipe (Estância, Poço Verde, Bugio), a Copa Coração Valente e
 * as atividades com entrega de lanches e materiais. Os arquivos são
 * preparados por `npm run acervo` (ver `scripts/preparar-acervo.mjs`), que
 * escreve as medidas reais em `content/acervo.ts`; aqui só entram a chave e
 * o texto alternativo nos três idiomas.
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

export const media: Record<string, MediaAsset | null> = {
  /* Página inicial */
  'home.hero': doAcervo('polo-estancia-comemoracao', {
    pt: 'Crianças de uniforme do projeto comemoram de braços erguidos na inauguração do polo de Estância, em Sergipe.',
    en: 'Children in project kit cheer with their arms raised at the opening of the Estância hub, in Sergipe, Brazil.',
    es: 'Niños con el uniforme del proyecto celebran con los brazos en alto en la inauguración del polo de Estância, en Sergipe, Brasil.',
  }),

  'home.about': doAcervo('polo-estancia-atencao', {
    pt: 'Dois meninos de uniforme azul acompanham a atividade com atenção, lado a lado.',
    en: 'Two boys in blue kit follow the activity attentively, side by side.',
    es: 'Dos niños con uniforme azul siguen la actividad con atención, uno al lado del otro.',
  }),

  'home.audience': doAcervo('polo-poco-verde-plateia-2', {
    pt: 'Meninas e meninos sentados na quadra do ginásio, atentos à abertura do polo de Poço Verde.',
    en: 'Girls and boys sitting on the sports hall floor, following the opening of the Poço Verde hub.',
    es: 'Niñas y niños sentados en la cancha del gimnasio, atentos a la apertura del polo de Poço Verde.',
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

  /* Sem fotografia própria destes dois no acervo entregue. */
  'project.futsal-na-escola.cover': null,
  'project.futedu-summit.cover': null,

  /* Notícias */
  'news.futedu-summit-2026-inscricoes': null,
  'news.prestacao-de-contas-primeiro-semestre-2026': null,
  'news.coracao-valente-nova-turma-aracaju': null,
  'news.futsal-na-escola-formacao-de-professores': null,
  'news.oficinas-de-paradesporto-nos-polos': null,
  'news.articulacao-internacional-2027': null,
}

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
 * Álbuns oficiais por projeto. É o que a página do projeto usa enquanto o
 * cliente não montar a galeria dele pelo painel.
 */
const galerias: Record<string, MediaAsset[]> = {
  'coracao-valente': galeriaCoracaoValente,
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
