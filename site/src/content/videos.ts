import { type VideoDoAcervo, videosDoAcervo } from './acervo'
import type { Localized, VideoAsset } from './types'

/**
 * VÍDEOS DO ACERVO
 * ================
 * Fonte da verdade dos vídeos oficiais da AIDEP — os que o site publica,
 * com legenda e lugar. Os arquivos vêm de `npm run acervo`
 * (ver `scripts/preparar-acervo.mjs`), que grava as medidas e a duração
 * reais em `content/acervo.ts`; aqui entram só a chave e o texto.
 *
 * Todo o acervo de vídeo é vertical, gravado em celular nos polos. É por
 * isso que a fileira da Home tem cartões 9/16: a moldura segue o material,
 * e não o contrário — nada é esticado nem recortado para fingir paisagem.
 *
 * Nenhum vídeo tem narração em três idiomas. O filme institucional está em
 * português, com legenda gravada na própria imagem — daí `spokenLocale`,
 * que faz a interface avisar o visitante que lê em inglês ou espanhol.
 */

type Entrada = {
  chave: VideoDoAcervo
  title: Localized
  description: Localized
  place: string
  projectSlug?: string
  featured?: boolean
  spokenLocale?: VideoAsset['spokenLocale']
}

const entradas: Entrada[] = [
  {
    chave: 'instituto-coracao-valente-16-polos',
    featured: true,
    spokenLocale: 'pt',
    place: 'Sergipe',
    projectSlug: 'coracao-valente',
    title: {
      pt: 'A abertura dos 16 polos',
      en: 'Opening the 16 hubs',
      es: 'La apertura de los 16 polos',
    },
    description: {
      pt: 'Filme do Instituto Coração Valente sobre a inauguração dos polos esportivos: a chegada às comunidades, a entrega dos materiais e as crianças que passaram a ter onde treinar.',
      en: 'A film by Instituto Coração Valente on the opening of the sports hubs: arriving in the communities, handing out the equipment, and the children who now have somewhere to train.',
      es: 'Película del Instituto Coração Valente sobre la inauguración de los polos deportivos: la llegada a las comunidades, la entrega de los materiales y los niños que pasaron a tener dónde entrenar.',
    },
  },
  {
    chave: 'polo-boquim-comemoracao',
    place: 'Boquim (SE)',
    projectSlug: 'coracao-valente',
    title: {
      pt: 'Comemoração em Boquim',
      en: 'Celebration in Boquim',
      es: 'Celebración en Boquim',
    },
    description: {
      pt: 'Crianças comemoram de braços erguidos diante do painel do projeto, na abertura do polo.',
      en: 'Children cheer with their arms raised in front of the project banner at the hub’s opening.',
      es: 'Los niños celebran con los brazos en alto frente al panel del proyecto, en la apertura del polo.',
    },
  },
  {
    chave: 'polo-porto-dantas-obrigado',
    place: 'Porto Dantas (SE)',
    projectSlug: 'coracao-valente',
    title: {
      pt: 'Obrigado, de Porto Dantas',
      en: 'Thank you, from Porto Dantas',
      es: 'Gracias, desde Porto Dantas',
    },
    description: {
      pt: 'A turma faz o gesto de coração com as mãos diante do painel de agradecimento do projeto.',
      en: 'The group makes a heart with their hands in front of the project’s thank-you banner.',
      es: 'El grupo hace el gesto del corazón con las manos frente al panel de agradecimiento del proyecto.',
    },
  },
  {
    chave: 'copa-coracao-valente-comemoracao',
    place: 'Copa Coração Valente',
    projectSlug: 'coracao-valente',
    title: {
      pt: 'O apito final da Copa',
      en: 'The final whistle at the Copa',
      es: 'El pitido final de la Copa',
    },
    description: {
      pt: 'Meninas e meninos comemoram juntos na quadra ao fim de uma partida da Copa Coração Valente.',
      en: 'Girls and boys celebrate together on the court at the end of a Copa Coração Valente match.',
      es: 'Niñas y niños celebran juntos en la cancha al final de un partido de la Copa Coração Valente.',
    },
  },
  {
    chave: 'copa-coracao-valente-partida',
    place: 'Copa Coração Valente',
    projectSlug: 'coracao-valente',
    title: {
      pt: 'Jogo na quadra coberta',
      en: 'A match in the sports hall',
      es: 'Partido en la cancha cubierta',
    },
    description: {
      pt: 'Lance de uma partida de futsal durante a Copa Coração Valente, com a arquibancada cheia.',
      en: 'A passage of play from a futsal match at the Copa Coração Valente, with a full stand.',
      es: 'Una jugada de un partido de futsal durante la Copa Coração Valente, con la grada llena.',
    },
  },
  {
    chave: 'polo-tobias-barreto-treino',
    place: 'Tobias Barreto (SE)',
    projectSlug: 'coracao-valente',
    title: {
      pt: 'Treino no campo sintético',
      en: 'Training on the synthetic pitch',
      es: 'Entrenamiento en el campo sintético',
    },
    description: {
      pt: 'Exercício de finalização com o professor, no campo sintético do polo de Tobias Barreto.',
      en: 'A finishing drill with the coach on the synthetic pitch at the Tobias Barreto hub.',
      es: 'Ejercicio de definición con el profesor, en el campo sintético del polo de Tobias Barreto.',
    },
  },
  {
    chave: 'polo-estancia-de-maos-dadas',
    place: 'Estância (SE)',
    projectSlug: 'coracao-valente',
    title: {
      pt: 'De mãos dadas até o campo',
      en: 'Hand in hand to the pitch',
      es: 'De la mano hasta el campo',
    },
    description: {
      pt: 'Crianças atravessam o gramado de mãos dadas, em dupla, antes de começar o treino.',
      en: 'Children cross the grass hand in hand, in pairs, before training starts.',
      es: 'Los niños cruzan el césped de la mano, en parejas, antes de empezar el entrenamiento.',
    },
  },
  {
    chave: 'polo-estancia-aquecimento',
    place: 'Estância (SE)',
    projectSlug: 'coracao-valente',
    title: {
      pt: 'Aquecimento sob sol forte',
      en: 'Warming up in the midday sun',
      es: 'Calentamiento bajo el sol fuerte',
    },
    description: {
      pt: 'Aquecimento em grupo no gramado do polo de Estância, em corrida leve.',
      en: 'A group warm-up jog on the grass at the Estância hub.',
      es: 'Calentamiento en grupo en el césped del polo de Estância, trotando.',
    },
  },
  {
    chave: 'polo-estancia-treino-com-cones',
    place: 'Estância (SE)',
    projectSlug: 'coracao-valente',
    title: {
      pt: 'Condução entre cones',
      en: 'Dribbling through the cones',
      es: 'Conducción entre conos',
    },
    description: {
      pt: 'Exercício de condução de bola entre cones, no gramado do polo de Estância.',
      en: 'A ball-control drill through cones on the grass at the Estância hub.',
      es: 'Ejercicio de conducción de balón entre conos, en el césped del polo de Estância.',
    },
  },
  {
    chave: 'polo-poco-verde-treino-na-quadra',
    place: 'Poço Verde (SE)',
    projectSlug: 'coracao-valente',
    title: {
      pt: 'Circuito no ginásio',
      en: 'Circuit training in the hall',
      es: 'Circuito en el gimnasio',
    },
    description: {
      pt: 'Fila de crianças no circuito de cones, dentro do ginásio do polo de Poço Verde.',
      en: 'Children queueing for the cone circuit inside the Poço Verde hub sports hall.',
      es: 'Fila de niños en el circuito de conos, dentro del gimnasio del polo de Poço Verde.',
    },
  },
]

/** Todos os vídeos publicados, com medidas e duração reais do arquivo. */
export const videos: VideoAsset[] = entradas.map(({ chave, ...resto }) => ({
  ...videosDoAcervo[chave],
  ...resto,
}))

/** O filme institucional, quando houver um marcado como destaque. */
export const featuredVideo = videos.find((video) => video.featured) ?? null

/** Vídeos de um projeto, na ordem em que foram cadastrados. */
export function videosOfProject(slug: string): VideoAsset[] {
  return videos.filter((video) => video.projectSlug === slug)
}
