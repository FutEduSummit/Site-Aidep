import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { mapaBrasil } from '@/content/mapa-brasil'
import { ehTerra } from '@/content/mundo'
import { contornoEmCoordenadas } from './projecao'

/**
 * O GLOBO DA PÁGINA INICIAL
 * =========================
 * A cena WebGL, sem uma linha de React: quem monta o `<canvas>` e desenha
 * a interface por cima é `components/ui/globe.tsx`. Separar os dois é o
 * que permite ler cada um — a cena é geometria e laço de animação; o
 * componente é estado, teclado e acessibilidade.
 *
 * O QUE A CENA TEM
 * ----------------
 * 1. **O oceano** — uma esfera opaca de raio 0,998. Ela não é decoração:
 *    é ela que esconde, pelo teste de profundidade, tudo o que está do
 *    outro lado do planeta. Sem ela, os pontos das costas do Pacífico
 *    apareceriam atravessando o Brasil.
 * 2. **A terra firme** — 42 mil pontos espalhados pela esfera na malha de
 *    Fibonacci (a espiral do ângulo áureo, que distribui pontos por área
 *    igual e não os empilha nos polos, como uma grade de latitude e
 *    longitude empilharia). Cada ponto pergunta à máscara de
 *    `content/mundo.ts` se ali é terra; só os que são ficam. Os
 *    continentes aparecem por consequência — nenhuma fronteira é
 *    desenhada.
 * 3. **O Brasil** — os pontos que caem dentro do país saem no verde da
 *    marca, e o contorno dos 27 estados é traçado por cima. O desenho é o
 *    mesmo do mapa plano (`content/mapa-brasil.ts`), desprojetado de volta
 *    para latitude e longitude: um dado só, duas telas.
 * 4. **A rota** — os arcos que ligam as cidades de norte a sul, com uma
 *    luz correndo por dentro. As cidades vizinhas contam como um nó só,
 *    senão as doze de Sergipe virariam um novelo. Ver `arcosEntre()`.
 * 5. **Os pinos** — um por cidade atendida, com a silhueta do pino de
 *    mapa, sempre em pé e sempre do mesmo tamanho na tela (são
 *    `Sprite`s redimensionados por quadro). Um corpo invisível em volta
 *    da cabeça é o alvo do clique: acertar 30 px na tela não pode
 *    depender de pontaria. Sob a cidade escolhida, um anel pulsa.
 * 6. **A atmosfera** — uma casca maior, pintada por dentro com um degradê
 *    de Fresnel. Custa dois triângulos por pixel de borda e é o que dá ao
 *    globo o volume que a silhueta chapada não tem.
 *
 * COMO O GLOBO GIRA
 * -----------------
 * A câmera não se move em volta do planeta: o planeta é que gira sob uma
 * câmera parada no eixo Z. É a inversão que torna o "ir para Aracaju" uma
 * interpolação de dois ângulos — latitude e longitude do alvo — em vez de
 * um problema de trajetória de câmera.
 *
 * `grupo.rotation = (lat, −lng, 0)` põe exatamente a coordenada
 * (lat, lng) de frente para quem olha. A ordem XYZ do Euler do Three
 * aplica primeiro o giro de longitude e depois o de latitude, que é a
 * ordem certa: girar a latitude antes inclinaria o eixo do mundo.
 *
 * O ALVO E O PASSEIO
 * ------------------
 * Há sempre um alvo (`alvo`) e uma posição corrente (`atual`). O laço
 * aproxima uma da outra a cada quadro. Arrastar move o alvo junto com o
 * dedo; clicar numa cidade põe o alvo nela e o globo vai sozinho; ninguém
 * mexendo, o alvo escorrega devagar para o oeste. Uma variável só governa
 * as três coisas, e por isso elas nunca brigam entre si.
 */

/** Raio do planeta. Tudo na cena é medido a partir daqui. */
const RAIO = 1

/** A esfera opaca fica um fio abaixo da superfície, sob os pontos. */
const RAIO_OCEANO = RAIO * 0.998

/**
 * ALTURA DO PINO NA TELA, EM PIXELS
 * =================================
 * O pino é um `Sprite`, e a cada quadro ele é redimensionado para medir
 * isto na tela — não em unidades do mundo. É o que faz aproximar o globo
 * aproximar o *mapa*, e não inflar os pinos junto.
 *
 * Mas não é uma medida só: ela cresce conforme a câmera se aproxima.
 *
 * Doze das vinte e nove cidades estão em Sergipe, dentro de um grau e
 * meio umas das outras. Com o planeta inteiro na tela, esse punhado
 * inteiro ocupa uns quinze pixels — e doze pinos de 34 px ali viravam uma
 * mancha branca do tamanho do Nordeste. Recuados para 18 px, os mesmos
 * doze leem como o que são: um grupo de alfinetes muito próximos, com o
 * país ainda visível em volta.
 *
 * Aproximando, o espaço entre eles cresce e a medida acompanha, até os
 * 34 px em que cada pino se lê sozinho.
 */
const ALTURA_DO_PINO = { longe: 18, perto: 34 }

/** O alvo do clique, em pixels de raio na tela. Segue a mesma escala. */
const ALVO_EM_PIXELS = { longe: 12, perto: 22 }

/** Quantos pontos são sorteados na esfera antes do filtro de terra firme. */
const AMOSTRAS = 42_000

/** Ângulo áureo — o passo da espiral de Fibonacci. */
const ANGULO_AUREO = Math.PI * (3 - Math.sqrt(5))

/**
 * Abertura vertical da câmera. Fixa: as distâncias de zoom abaixo foram
 * escolhidas para este ângulo, e o enquadramento em tela estreita se
 * resolve afastando a câmera, não abrindo a lente — abrir distorceria a
 * esfera nas bordas justamente onde ela é mais visível.
 */
const CAMPO_DE_VISAO = 40

/**
 * Distância da câmera ao centro, para uma moldura mais larga que alta. Em
 * moldura estreita a distância é multiplicada pelo ajuste de proporção
 * calculado em `medir()`.
 */
const ZOOM = { min: 1.35, max: 4.4, inicial: 3.3 }

/** Latitude além da qual o giro vertical trava, para não virar o planeta. */
const LATITUDE_MAXIMA = 72

/** Graus por segundo do giro ocioso. Devagar: o globo não é um carrossel. */
const GIRO_OCIOSO = 3.2

/** Quanto da diferença entre alvo e posição se fecha por quadro, a 60 fps. */
const SUAVIDADE = 0.09

/** Onde o globo abre: o centro do Brasil. */
export const VISTA_INICIAL = { lat: -14, lng: -52 }

export type MarcadorDoGlobo = {
  id: string
  lat: number
  lng: number
}

export type OpcoesDoGlobo = {
  canvas: HTMLCanvasElement
  marcadores: MarcadorDoGlobo[]
  /** Cores lidas do tema, em hexadecimal. */
  cores: {
    oceano: string
    terra: string
    brasil: string
    /** Corpo do pino. */
    pino: string
    /** O miolo redondo dentro da cabeça do pino. */
    pinoNucleo: string
    /** Corpo do pino da cidade escolhida — o miolo dele vira `pino`. */
    pinoEscolhido: string
    /** A linha que liga as cidades e a luz que corre nela. */
    rota: string
    atmosfera: string
  }
  /** O sistema pede menos movimento: sem giro ocioso, sem passeio. */
  semMovimento?: boolean
  /** Chamado quando o ponteiro entra ou sai de um marcador. */
  aoPassar?: (id: string | null) => void
  /** Chamado quando um marcador é escolhido com o clique. */
  aoEscolher?: (id: string) => void
  /**
   * Chamado a cada quadro com a posição de cada marcador na tela, em
   * pixels, e se ele está do lado de cá do planeta. É o que permite ao
   * componente pôr um rótulo em HTML exatamente sobre a cidade.
   */
  aoProjetar?: (posicoes: Map<string, { x: number; y: number; visivel: boolean }>) => void
}

export type Globo = {
  /** Leva o globo até a coordenada, com o passeio suave do laço. */
  irPara: (lat: number, lng: number) => void
  /** Marca um marcador como escolhido — ele cresce e muda de cor. */
  destacar: (id: string | null) => void
  /** Apaga os marcadores que não estão na lista. `null` acende todos. */
  filtrar: (ids: Set<string> | null) => void
  /** Liga e desliga o laço de desenho — usado quando a seção sai da tela. */
  ativo: (ligado: boolean) => void
  destruir: () => void
}

/* ------------------------------------------------------------------ */
/* Geometria                                                          */
/* ------------------------------------------------------------------ */

/**
 * Coordenada geográfica → ponto no espaço.
 *
 * A convenção é a que faz (0°, 0°) cair de frente para a câmera: X para
 * leste, Y para o norte, Z para quem olha.
 */
function naEsfera(lat: number, lng: number, raio = RAIO): Vector3 {
  const phi = (lat * Math.PI) / 180
  const theta = (lng * Math.PI) / 180

  return new Vector3(
    raio * Math.cos(phi) * Math.sin(theta),
    raio * Math.sin(phi),
    raio * Math.cos(phi) * Math.cos(theta),
  )
}

/**
 * O contorno do Brasil, estado por estado, em coordenadas geográficas —
 * e a caixa que envolve o país inteiro.
 *
 * Sai do mesmo `content/mapa-brasil.ts` que desenha o mapa plano das
 * páginas de projeto, desprojetado de volta. Custa alguns milissegundos
 * uma vez por carregamento e economiza um segundo arquivo de contorno.
 */
function contornoDoBrasil() {
  const estados = mapaBrasil.estados.map((estado) =>
    contornoEmCoordenadas(estado.d),
  )

  let latMin = Infinity
  let latMax = -Infinity
  let lngMin = Infinity
  let lngMax = -Infinity

  for (const anel of estados) {
    for (const { lat, lng } of anel) {
      if (lat < latMin) latMin = lat
      if (lat > latMax) latMax = lat
      if (lng < lngMin) lngMin = lng
      if (lng > lngMax) lngMax = lng
    }
  }

  return { estados, caixa: { latMin, latMax, lngMin, lngMax } }
}

/** Lançamento de raio para o leste — par e ímpar, como em `gerar-mundo.mjs`. */
function dentroDoAnel(
  anel: { lat: number; lng: number }[],
  lat: number,
  lng: number,
): boolean {
  let dentro = false

  for (let i = 0, j = anel.length - 1; i < anel.length; j = i, i += 1) {
    const a = anel[i]
    const b = anel[j]

    if (a.lat > lat !== b.lat > lat) {
      const corte = ((b.lng - a.lng) * (lat - a.lat)) / (b.lat - a.lat) + a.lng
      if (lng < corte) dentro = !dentro
    }
  }

  return dentro
}

/**
 * A malha de pontos de terra firme, já colorida: cinza para o mundo,
 * verde para o Brasil.
 *
 * A caixa envolvente do país é o que torna o teste barato — das 42 mil
 * amostras, menos de mil caem no retângulo do Brasil, e só essas são
 * testadas contra os 27 polígonos.
 */
function malhaDeTerra(corTerra: Color, corBrasil: Color) {
  const { estados, caixa } = contornoDoBrasil()

  const posicoes: number[] = []
  const cores: number[] = []

  for (let i = 0; i < AMOSTRAS; i += 1) {
    /* Espiral de Fibonacci: y desce linearmente de +1 a −1 e o ângulo
       avança sempre o mesmo tanto. É o que dá área igual por ponto. */
    const y = 1 - (i / (AMOSTRAS - 1)) * 2
    const raioNoPlano = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = i * ANGULO_AUREO

    const x = Math.cos(theta) * raioNoPlano
    const z = Math.sin(theta) * raioNoPlano

    const lat = (Math.asin(y) * 180) / Math.PI
    const lng = (Math.atan2(x, z) * 180) / Math.PI

    if (!ehTerra(lat, lng)) continue

    const noBrasil =
      lat >= caixa.latMin &&
      lat <= caixa.latMax &&
      lng >= caixa.lngMin &&
      lng <= caixa.lngMax &&
      estados.some((anel) => dentroDoAnel(anel, lat, lng))

    posicoes.push(x * RAIO, y * RAIO, z * RAIO)
    const cor = noBrasil ? corBrasil : corTerra
    cores.push(cor.r, cor.g, cor.b)
  }

  const geometria = new BufferGeometry()
  geometria.setAttribute('position', new Float32BufferAttribute(posicoes, 3))
  geometria.setAttribute('color', new Float32BufferAttribute(cores, 3))
  return geometria
}

/** As linhas do contorno dos estados, prontas para desenhar sobre a esfera. */
function linhasDosEstados() {
  const vertices: number[] = []

  for (const anel of contornoDoBrasil().estados) {
    for (let i = 0; i < anel.length; i += 1) {
      const a = naEsfera(anel[i].lat, anel[i].lng, RAIO * 1.002)
      const b = naEsfera(
        anel[(i + 1) % anel.length].lat,
        anel[(i + 1) % anel.length].lng,
        RAIO * 1.002,
      )
      vertices.push(a.x, a.y, a.z, b.x, b.y, b.z)
    }
  }

  const geometria = new BufferGeometry()
  geometria.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  return geometria
}

/**
 * O DESENHO DO PINO
 * =================
 * O marcador não é mais uma bolinha na superfície: é um pino de mapa, com
 * a silhueta que todo mundo já sabe ler.
 *
 * O contorno vem de um `Path2D` construído a partir do caminho SVG do
 * pino do Material Design, em caixa de 24×24. Usar o caminho pronto em
 * vez de desenhar a gota à mão com curvas de Bézier é o que garante a
 * proporção certa entre a cabeça e a ponta — é ela que faz a forma ser
 * reconhecida de relance, e acertá-la no olho leva vinte tentativas.
 *
 * O que faz este pino ser melhor que o do mapa comum:
 *
 * - **Sombra por baixo.** Ele fica sobre um planeta escuro cheio de
 *   pontos; sem a sombra, a silhueta se confunde com a malha de terra.
 * - **Corpo em degradê.** Um branco que escurece de leve para baixo, o
 *   que dá volume à cabeça sem precisar de brilho especular.
 * - **Miolo na cor da marca.** É o verde AIDEP, e é ele que diz de quem é
 *   o pino sem escrever nada.
 * - **Contorno fino.** Meio pixel de linha escura fecha a forma contra
 *   qualquer fundo, inclusive sobre o verde do Brasil.
 *
 * A textura vai para um `Sprite`, que sempre encara a câmera. É isto que
 * resolve a queixa de origem — a bolinha antiga encolhia e sumia junto
 * com a curvatura do globo; o pino fica do mesmo tamanho e em pé, gire o
 * planeta para onde girar.
 */

/** Caixa do caminho SVG do pino, e onde dentro dela fica a ponta. */
const PINO = { caixa: 24, pontaY: 22.6, cabecaY: 9, cabecaR: 2.9 }

/** Lado do canvas da textura, e a folga que a sombra precisa. */
const PINO_LADO = 256
const PINO_FOLGA = 18

const CAMINHO_DO_PINO =
  'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13.6 7 13.6S19 14.25 19 9c0-3.87-3.13-7-7-7z'

/**
 * Onde, dentro da textura, está a ponta do pino — em coordenadas de
 * `Sprite.center` (0 embaixo, 1 em cima). É o que faz a ponta pousar
 * exatamente sobre a cidade, e não o meio do desenho.
 */
export const ANCORA_DO_PINO = (() => {
  const escala = (PINO_LADO - PINO_FOLGA * 2) / PINO.caixa
  const y = PINO_FOLGA + PINO.pontaY * escala
  return { x: 0.5, y: 1 - y / PINO_LADO }
})()

function texturaDePino(corpo: string, nucleo: string): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = PINO_LADO
  canvas.height = PINO_LADO

  const pincel = canvas.getContext('2d')
  if (!pincel) return new CanvasTexture(canvas)

  const escala = (PINO_LADO - PINO_FOLGA * 2) / PINO.caixa
  pincel.translate(PINO_FOLGA, PINO_FOLGA)
  pincel.scale(escala, escala)

  const gota = new Path2D(CAMINHO_DO_PINO)

  /* A sombra é desenhada com o próprio corpo, e por isso sai colada na
     silhueta em vez de virar um borrão retangular atrás dela. */
  pincel.save()
  pincel.shadowColor = 'rgba(0, 0, 0, 0.55)'
  pincel.shadowBlur = 5
  pincel.shadowOffsetY = 1.6

  const degrade = pincel.createLinearGradient(0, 2, 0, PINO.pontaY)
  degrade.addColorStop(0, corpo)
  degrade.addColorStop(1, misturar(corpo, '#000000', 0.16))
  pincel.fillStyle = degrade
  pincel.fill(gota)
  pincel.restore()

  pincel.lineWidth = 0.5
  pincel.strokeStyle = 'rgba(0, 0, 0, 0.4)'
  pincel.stroke(gota)

  pincel.beginPath()
  pincel.arc(12, PINO.cabecaY, PINO.cabecaR, 0, Math.PI * 2)
  pincel.fillStyle = nucleo
  pincel.fill()

  const textura = new CanvasTexture(canvas)
  textura.anisotropy = 4
  return textura
}

/** Mistura dois hexadecimais — só para escurecer a base do degradê. */
function misturar(a: string, b: string, quanto: number): string {
  const cor = new Color(a).lerp(new Color(b), quanto)
  return `#${cor.getHexString()}`
}

/**
 * O disco macio que dá forma ao ponto. Sem ele o `PointsMaterial` desenha
 * quadrados, e 14 mil quadradinhos não leem como um planeta.
 */
function texturaDePonto(): CanvasTexture {
  const lado = 64
  const canvas = document.createElement('canvas')
  canvas.width = lado
  canvas.height = lado

  const pincel = canvas.getContext('2d')
  if (pincel) {
    const gradiente = pincel.createRadialGradient(
      lado / 2,
      lado / 2,
      0,
      lado / 2,
      lado / 2,
      lado / 2,
    )
    gradiente.addColorStop(0, 'rgba(255,255,255,1)')
    gradiente.addColorStop(0.55, 'rgba(255,255,255,1)')
    gradiente.addColorStop(1, 'rgba(255,255,255,0)')
    pincel.fillStyle = gradiente
    pincel.fillRect(0, 0, lado, lado)
  }

  return new CanvasTexture(canvas)
}

/* ------------------------------------------------------------------ */
/* A rota                                                             */
/* ------------------------------------------------------------------ */

/** Cidades a menos disto uma da outra contam como um nó só, em graus. */
const RAIO_DO_AGRUPAMENTO = 1.1

/** Quantos segmentos cada arco tem. */
const PASSOS_DO_ARCO = 44

/**
 * Os nós da rota: as cidades reunidas em grupos, e cada grupo no centro
 * dos seus.
 *
 * Sem isto a rota vira um rabisco. Doze das vinte e nove cidades estão em
 * Sergipe, dentro de um grau e meio umas das outras: ligá-las em fila
 * desenharia um novelo do tamanho de uma cabeça de alfinete, e os arcos
 * que importam — os que atravessam o país — se perderiam nele.
 */
function agrupar(pontos: MarcadorDoGlobo[]) {
  const nos: { lat: number; lng: number; quantos: number }[] = []

  for (const ponto of pontos) {
    const perto = nos.find(
      (no) =>
        Math.abs(no.lat / no.quantos - ponto.lat) < RAIO_DO_AGRUPAMENTO &&
        Math.abs(no.lng / no.quantos - ponto.lng) < RAIO_DO_AGRUPAMENTO,
    )

    if (perto) {
      perto.lat += ponto.lat
      perto.lng += ponto.lng
      perto.quantos += 1
    } else {
      nos.push({ lat: ponto.lat, lng: ponto.lng, quantos: 1 })
    }
  }

  return nos
    .map((no) => ({ lat: no.lat / no.quantos, lng: no.lng / no.quantos }))
    .sort((a, b) => b.lat - a.lat)
}

/**
 * A ROTA QUE LIGA AS CIDADES
 * ==========================
 * Um arco por par de nós vizinhos, do norte para o sul, cada um subindo
 * um pouco acima da superfície no meio do caminho.
 *
 * Tudo entra numa geometria só, em pares de vértices (`LineSegments`), e
 * cada vértice carrega dois números além da posição:
 *
 *   `aT`     onde ele está dentro do próprio arco, de 0 a 1;
 *   `aArco`  o número do arco, que vira o atraso da luz naquele traço.
 *
 * É o que permite acender os nove arcos com uma chamada de desenho só, e
 * ainda assim a luz de cada um sair num tempo diferente.
 *
 * A altura do arco é proporcional ao tamanho dele: o salto de Sergipe ao
 * Paraná sobe alto, e o de Aracaju à Barra dos Coqueiros mal descola do
 * chão. Fosse fixa, o arco curto viraria um poste.
 */
function arcosEntre(pontos: MarcadorDoGlobo[]): BufferGeometry {
  const nos = agrupar(pontos)

  const posicoes: number[] = []
  const ts: number[] = []
  const indices: number[] = []

  for (let a = 0; a + 1 < nos.length; a += 1) {
    const de = naEsfera(nos[a].lat, nos[a].lng).normalize()
    const para = naEsfera(nos[a + 1].lat, nos[a + 1].lng).normalize()

    /* O ângulo entre os dois decide a altura do arco. */
    const angulo = Math.acos(Math.min(1, Math.max(-1, de.dot(para))))
    const altura = 1 + Math.min(0.3, 0.03 + angulo * 0.2)

    const caminho: Vector3[] = []
    for (let i = 0; i <= PASSOS_DO_ARCO; i += 1) {
      const t = i / PASSOS_DO_ARCO
      /* Interpolação esférica à mão: com o ângulo pequeno, `sin(angulo)`
         tende a zero e a fórmula estoura — aí a reta entre os dois já é
         indistinguível do arco. */
      const ponto =
        angulo < 1e-4
          ? de.clone()
          : de
              .clone()
              .multiplyScalar(Math.sin((1 - t) * angulo) / Math.sin(angulo))
              .add(
                para.clone().multiplyScalar(Math.sin(t * angulo) / Math.sin(angulo)),
              )
              .normalize()

      caminho.push(ponto.multiplyScalar(RAIO * (1 + (altura - 1) * Math.sin(Math.PI * t))))
    }

    /* Cada arco sai duas vezes, em raios um fio diferentes.
       O WebGL ignora `linewidth`: em quase todo navegador a linha é de um
       pixel e ponto final. Dois traços paralelos e colados é o jeito
       honesto de conseguir dois — e o custo é uma centena de vértices. */
    for (const afastamento of [1, 1.0022]) {
      for (let i = 0; i < PASSOS_DO_ARCO; i += 1) {
        posicoes.push(
          caminho[i].x * afastamento,
          caminho[i].y * afastamento,
          caminho[i].z * afastamento,
          caminho[i + 1].x * afastamento,
          caminho[i + 1].y * afastamento,
          caminho[i + 1].z * afastamento,
        )
        ts.push(i / PASSOS_DO_ARCO, (i + 1) / PASSOS_DO_ARCO)
        indices.push(a, a)
      }
    }
  }

  const geometria = new BufferGeometry()
  geometria.setAttribute('position', new Float32BufferAttribute(posicoes, 3))
  geometria.setAttribute('aT', new Float32BufferAttribute(ts, 1))
  geometria.setAttribute('aArco', new Float32BufferAttribute(indices, 1))
  return geometria
}

/**
 * O material da rota: um traço fraco sempre aceso e uma luz correndo por
 * cima dele.
 *
 * `d = fract(fase - aT)` dá a distância *para trás* da cabeça da luz:
 * zero exatamente nela, crescendo para quem já ficou para trás e virando
 * quase um no que ainda está pela frente. O `smoothstep` invertido
 * transforma isso na cauda do cometa, e o `fract` faz a volta ao começo
 * do arco sem emenda.
 */
function materialDaRota(cor: Color): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: { cor: { value: cor }, tempo: { value: 0 } },
    vertexShader: `
      attribute float aT;
      attribute float aArco;
      uniform float tempo;
      varying float vBrilho;

      void main() {
        float fase = fract(tempo * 0.22 + aArco * 0.19);
        float d = fract(fase - aT);
        vBrilho = smoothstep(0.3, 0.0, d);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 cor;
      varying float vBrilho;

      void main() {
        gl_FragColor = vec4(cor, 0.34 + vBrilho * 0.66);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
}

/* ------------------------------------------------------------------ */
/* A cena                                                             */
/* ------------------------------------------------------------------ */

export function criarGlobo({
  canvas,
  marcadores,
  cores,
  semMovimento = false,
  aoPassar,
  aoEscolher,
  aoProjetar,
}: OpcoesDoGlobo): Globo {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  })
  renderer.setClearColor(0x000000, 0)

  const cena = new Scene()
  const camera = new PerspectiveCamera(CAMPO_DE_VISAO, 1, 0.1, 100)
  camera.position.set(0, 0, ZOOM.inicial)

  /* Tudo o que é planeta entra aqui: é este grupo que gira. */
  const planeta = new Group()
  cena.add(planeta)

  /* 1. Oceano — opaco, e por isso o que oculta o outro lado do mundo. */
  const oceano = new Mesh(
    new SphereGeometry(RAIO_OCEANO, 64, 48),
    new MeshBasicMaterial({ color: new Color(cores.oceano) }),
  )
  planeta.add(oceano)

  /* 2 e 3. Terra firme, com o Brasil já no verde da marca. */
  const pontos = new Points(
    malhaDeTerra(new Color(cores.terra), new Color(cores.brasil)),
    new PointsMaterial({
      size: 0.0135,
      sizeAttenuation: true,
      vertexColors: true,
      map: texturaDePonto(),
      transparent: true,
      alphaTest: 0.35,
      depthWrite: true,
    }),
  )
  planeta.add(pontos)

  const contorno = new LineSegments(
    linhasDosEstados(),
    new LineBasicMaterial({
      color: new Color(cores.brasil),
      transparent: true,
      opacity: 0.55,
    }),
  )
  planeta.add(contorno)

  /* 5. Atmosfera — casca pintada por dentro, mais forte na borda. */
  const atmosfera = new Mesh(
    new SphereGeometry(RAIO * 1.1, 48, 32),
    new ShaderMaterial({
      uniforms: { cor: { value: new Color(cores.atmosfera) } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 cor;
        varying vec3 vNormal;
        void main() {
          float borda = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(cor, borda * 0.9);
        }
      `,
      side: BackSide,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  )
  cena.add(atmosfera)

  /* 4. A rota — as linhas que ligam as cidades, com a luz correndo. */
  const rota = new LineSegments(
    arcosEntre(marcadores),
    materialDaRota(new Color(cores.rota)),
  )
  rota.renderOrder = 1
  planeta.add(rota)

  /* 5. Marcadores — pinos de mapa. */
  const texturaNormal = texturaDePino(cores.pino, cores.pinoNucleo)
  const texturaEscolhida = texturaDePino(cores.pinoEscolhido, cores.pino)

  const geometriaAlvo = new SphereGeometry(1, 8, 6)

  type Pino = {
    id: string
    pino: Sprite
    alvo: Mesh
    /** Onde a ponta pousa — a própria coordenada, sobre a superfície. */
    posicao: Vector3
    aceso: boolean
  }

  const pinos: Pino[] = marcadores.map((marcador) => {
    /* Um fio acima da superfície: encostado, a ponta do pino brigaria em
       profundidade com os pontos da malha de terra. */
    const base = naEsfera(marcador.lat, marcador.lng, RAIO * 1.004)

    const pino = new Sprite(
      new SpriteMaterial({
        map: texturaNormal,
        transparent: true,
        depthWrite: false,
        /* O teste de profundidade continua ligado: é ele que esconde o
           pino quando a cidade passa para o outro lado do planeta. */
        depthTest: true,
      }),
    )
    /* A âncora é a ponta, não o centro do desenho — é o que faz o pino
       apontar para a cidade em vez de flutuar centrado nela. */
    pino.center.set(ANCORA_DO_PINO.x, ANCORA_DO_PINO.y)
    pino.position.copy(base)

    /* O alvo do clique é uma esfera invisível em volta da cabeça do pino,
       redimensionada a cada quadro junto com ele. Não usa
       `visible = false` de propósito — o raio do Three ignora o que está
       invisível, e este corpo existe só para ser acertado. */
    const alvo = new Mesh(
      geometriaAlvo,
      new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    )
    alvo.userData.id = marcador.id

    planeta.add(pino, alvo)

    return { id: marcador.id, pino, alvo, posicao: base, aceso: true }
  })

  const porId = new Map(pinos.map((pino) => [pino.id, pino]))

  /**
   * O anel que pulsa sob a cidade escolhida. Um só, reposicionado — vinte
   * e nove anéis pulsando ao mesmo tempo seriam ruído, e este é justamente
   * o que diz *qual* das vinte e nove está aberta na ficha ao lado.
   */
  const anel = new Mesh(
    new RingGeometry(0.6, 1, 48),
    new MeshBasicMaterial({
      color: new Color(cores.pinoEscolhido),
      transparent: true,
      opacity: 0,
      side: DoubleSide,
      depthWrite: false,
    }),
  )
  anel.visible = false
  planeta.add(anel)

  /* ---------------------------------------------------------------- */
  /* Estado do passeio                                                */
  /* ---------------------------------------------------------------- */

  const alvo = { ...VISTA_INICIAL, zoom: ZOOM.inicial }
  const atual = { ...VISTA_INICIAL, zoom: ZOOM.max }

  let arrastando = false
  let arrastou = false
  let ultimoPonteiro = { x: 0, y: 0 }
  let interagindo = false
  let destacado: string | null = null
  let sobre: string | null = null
  let rodando = true
  let quadro = 0
  let ultimoInstante = performance.now()
  /** Quanto a câmera recua para caber numa moldura estreita. Ver `medir()`. */
  let ajusteDeAspecto = 1
  /** Onde o anel do pulso está no ciclo dele, de 0 a 1. */
  let fasePulso = 0

  const raio = new Raycaster()
  const ponteiro = new Vector2()
  const projetado = new Vector3()
  /** Reaproveitado dentro do laço — nada de alocar 29 vetores por quadro. */
  const mundo = new Vector3()
  const posicoesNaTela = new Map<string, { x: number; y: number; visivel: boolean }>()

  /* ---------------------------------------------------------------- */
  /* Interação                                                        */
  /* ---------------------------------------------------------------- */

  function medir() {
    const { clientWidth, clientHeight } = canvas
    if (clientWidth === 0 || clientHeight === 0) return

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(clientWidth, clientHeight, false)

    const proporcao = clientWidth / clientHeight
    camera.aspect = proporcao
    camera.updateProjectionMatrix()

    /* A abertura da câmera é vertical. Numa moldura mais alta que larga —
       o celular — o planeta sairia pelas laterais antes de encostar no
       topo, então a câmera recua na mesma medida em que a moldura
       estreita. Acima de 1:1 o ajuste é 1 e nada muda. */
    ajusteDeAspecto = 1 / Math.min(proporcao, 1)
  }

  function ponteiroNormalizado(evento: PointerEvent) {
    const caixa = canvas.getBoundingClientRect()
    ponteiro.x = ((evento.clientX - caixa.left) / caixa.width) * 2 - 1
    ponteiro.y = -((evento.clientY - caixa.top) / caixa.height) * 2 + 1
  }

  /**
   * Qual marcador está sob o ponteiro — ou `null`.
   *
   * O raio acerta também o que está do outro lado do planeta, porque os
   * alvos não escrevem profundidade. O teste do horizonte descarta esses:
   * um ponto a distância `r` do centro só é visível de uma câmera a
   * distância `d` quando a projeção dele na direção da câmera passa de
   * `R²/d` — a fórmula clássica do limbo da esfera.
   */
  function marcadorSobOPonteiro(): string | null {
    raio.setFromCamera(ponteiro, camera)

    /* Só os alvos acesos e do lado de cá do planeta — os do outro lado
       já saíram com `visible = false` em `atualizarPinos()`, e o raio do
       Three pula o que está invisível. Um filtro a menos aqui. */
    const acertos = raio.intersectObjects(
      pinos.filter((pino) => pino.aceso && pino.alvo.visible).map((pino) => pino.alvo),
      false,
    )

    return acertos.length > 0 ? (acertos[0].object.userData.id as string) : null
  }

  function aoDescer(evento: PointerEvent) {
    arrastando = true
    arrastou = false
    interagindo = true
    ultimoPonteiro = { x: evento.clientX, y: evento.clientY }
    canvas.setPointerCapture(evento.pointerId)
  }

  function aoMover(evento: PointerEvent) {
    if (arrastando) {
      const dx = evento.clientX - ultimoPonteiro.x
      const dy = evento.clientY - ultimoPonteiro.y
      if (Math.abs(dx) + Math.abs(dy) > 3) arrastou = true

      ultimoPonteiro = { x: evento.clientX, y: evento.clientY }

      /* Quanto mais perto, menos graus por pixel: a mão continua "colada"
         na superfície em qualquer zoom. */
      const sensibilidade = 0.2 * (atual.zoom / ZOOM.inicial)
      alvo.lng -= dx * sensibilidade
      alvo.lat = Math.max(
        -LATITUDE_MAXIMA,
        Math.min(LATITUDE_MAXIMA, alvo.lat + dy * sensibilidade),
      )
      return
    }

    ponteiroNormalizado(evento)
    const achado = marcadorSobOPonteiro()
    if (achado !== sobre) {
      sobre = achado
      canvas.style.cursor = achado ? 'pointer' : 'grab'
      aoPassar?.(achado)
    }
  }

  function aoSubir(evento: PointerEvent) {
    if (canvas.hasPointerCapture(evento.pointerId)) {
      canvas.releasePointerCapture(evento.pointerId)
    }
    arrastando = false

    if (!arrastou) {
      ponteiroNormalizado(evento)
      const achado = marcadorSobOPonteiro()
      if (achado) aoEscolher?.(achado)
    }
  }

  function aoSair() {
    if (sobre !== null) {
      sobre = null
      canvas.style.cursor = 'grab'
      aoPassar?.(null)
    }
  }

  function aoRolar(evento: WheelEvent) {
    /* Só toma a rolagem quando ela é claramente um gesto de zoom sobre o
       globo; do contrário a página inteira ficaria presa aqui. */
    if (!evento.ctrlKey && Math.abs(evento.deltaY) < 4) return
    evento.preventDefault()
    interagindo = true
    /* Multiplicativo, e não aditivo: um passo de roda vale sempre a mesma
       *fração* da distância, então aproximar de longe anda muito e de
       perto anda pouco — que é como todo mapa se comporta. */
    alvo.zoom = Math.max(
      ZOOM.min,
      Math.min(ZOOM.max, alvo.zoom * (1 + evento.deltaY * 0.0011)),
    )
  }

  canvas.addEventListener('pointerdown', aoDescer)
  canvas.addEventListener('pointermove', aoMover)
  canvas.addEventListener('pointerup', aoSubir)
  canvas.addEventListener('pointercancel', aoSubir)
  canvas.addEventListener('pointerleave', aoSair)
  canvas.addEventListener('wheel', aoRolar, { passive: false })

  const observador = new ResizeObserver(medir)
  observador.observe(canvas)
  medir()

  /* ---------------------------------------------------------------- */
  /* Laço                                                             */
  /* ---------------------------------------------------------------- */

  function desenhar(instante: number) {
    quadro = requestAnimationFrame(desenhar)
    if (!rodando) return

    const passo = Math.min((instante - ultimoInstante) / 1000, 0.05)
    ultimoInstante = instante

    /* Giro ocioso: só quando ninguém está mexendo e nenhuma cidade está
       escolhida — parar no que o leitor escolheu é mais útil do que
       continuar girando por baixo dele. */
    if (!semMovimento && !arrastando && !interagindo && !destacado) {
      alvo.lng -= GIRO_OCIOSO * passo
    }

    /* Uma exponencial normalizada pelo tempo: a suavidade fica igual em
       60 Hz e em 120 Hz. */
    const fatia = semMovimento ? 1 : 1 - Math.pow(1 - SUAVIDADE, passo * 60)

    atual.lat += (alvo.lat - atual.lat) * fatia
    atual.lng += (alvo.lng - atual.lng) * fatia
    atual.zoom += (alvo.zoom - atual.zoom) * fatia

    planeta.rotation.set(
      (atual.lat * Math.PI) / 180,
      (-atual.lng * Math.PI) / 180,
      0,
    )
    atmosfera.rotation.copy(planeta.rotation)
    camera.position.z = atual.zoom * ajusteDeAspecto

    /* A luz que corre pela rota. */
    ;(rota.material as ShaderMaterial).uniforms.tempo.value += semMovimento
      ? 0
      : passo

    planeta.updateMatrixWorld()
    atualizarPinos()
    pulsar(passo)

    renderer.render(cena, camera)

    /* Onde cada marcador caiu na tela — o componente põe os rótulos. */
    if (aoProjetar) {
      const caixa = canvas.getBoundingClientRect()

      posicoesNaTela.clear()
      for (const pino of pinos) {
        if (!pino.aceso) continue

        pino.pino.getWorldPosition(projetado)
        const visivel = pino.pino.visible

        projetado.project(camera)
        posicoesNaTela.set(pino.id, {
          x: ((projetado.x + 1) / 2) * caixa.width,
          y: ((1 - projetado.y) / 2) * caixa.height,
          visivel,
        })
      }
      aoProjetar(posicoesNaTela)
    }
  }

  /**
   * O TAMANHO DOS PINOS, A CADA QUADRO
   * ==================================
   * Duas coisas acontecem aqui, e as duas precisam ser por quadro porque
   * dependem de onde a câmera está.
   *
   * **O tamanho.** Um `Sprite` mede em unidades do mundo, e portanto
   * encolhe com a distância. Aqui a conta é invertida: para o pino medir
   * sempre os mesmos pixels na tela, a medida no mundo é
   *
   *     altura = pixels × 2 × tan(fov/2) × distância ÷ altura_da_tela
   *
   * com a **distância até aquele pino**, e não até o centro do planeta —
   * bem de perto, a cidade na borda está três vezes mais longe que a do
   * meio, e usar a distância do centro deixaria as duas do mesmo tamanho
   * numa perspectiva que grita o contrário.
   *
   * **A visibilidade.** O teste do horizonte esconde quem passou para o
   * outro lado. O teste de profundidade sozinho não resolve: o sprite é
   * um retângulo plano que encara a câmera, e uma cidade logo depois da
   * borda ainda teria a âncora à frente da esfera — o pino apareceria
   * deitado sobre o limbo, apontando para o nada.
   */
  function atualizarPinos() {
    const alturaDaTela = canvas.clientHeight || 1
    const porPixel =
      (2 * Math.tan((CAMPO_DE_VISAO * Math.PI) / 360)) / alturaDaTela

    /* 0 na distância máxima, 1 na mínima — e daí o tamanho do pino. */
    const aproximacao = Math.min(
      1,
      Math.max(0, (ZOOM.max - atual.zoom) / (ZOOM.max - ZOOM.min)),
    )
    const alturaEmPixels =
      ALTURA_DO_PINO.longe +
      (ALTURA_DO_PINO.perto - ALTURA_DO_PINO.longe) * aproximacao
    const alvoEmPixels =
      ALVO_EM_PIXELS.longe +
      (ALVO_EM_PIXELS.perto - ALVO_EM_PIXELS.longe) * aproximacao

    const distanciaDaCamera = camera.position.length()
    /* Plano do limbo: ponto visível é o que projeta além de R²/d na
       direção da câmera. */
    const limite = (RAIO_OCEANO * RAIO_OCEANO) / distanciaDaCamera

    for (const pino of pinos) {
      if (!pino.aceso) {
        pino.pino.visible = false
        pino.alvo.visible = false
        continue
      }

      pino.pino.getWorldPosition(mundo)
      const naFrente = mundo.dot(camera.position) / distanciaDaCamera > limite

      pino.pino.visible = naFrente
      pino.alvo.visible = naFrente
      if (!naFrente) continue

      const distancia = camera.position.distanceTo(mundo)
      const escolhido = pino.id === destacado
      const altura =
        alturaEmPixels * (escolhido ? 1.32 : 1) * porPixel * distancia

      /* A textura é quadrada, então largura e altura do sprite andam
         juntas — a folga transparente em volta do desenho é o que dá a
         proporção do pino. */
      pino.pino.scale.setScalar(altura)

      const alvoNoMundo = alvoEmPixels * porPixel * distancia
      pino.alvo.position.copy(pino.pino.position)
      pino.alvo.scale.setScalar(alvoNoMundo)
    }
  }

  /**
   * O anel sob a cidade escolhida: cresce e desaparece, e recomeça.
   *
   * Fica deitado na superfície — `lookAt(0,0,0)` aponta a normal do anel
   * para o centro do planeta, que é o mesmo que encostá-lo no chão — e
   * um fio acima dela, para não brigar em profundidade com a malha de
   * terra.
   */
  function pulsar(passo: number) {
    const escolhido = destacado ? porId.get(destacado) : undefined

    if (!escolhido || !escolhido.aceso || !escolhido.pino.visible) {
      anel.visible = false
      return
    }

    fasePulso = semMovimento ? 0.35 : (fasePulso + passo * 0.55) % 1

    const crescimento = 0.4 + fasePulso * 1.5
    const distancia = camera.position.distanceTo(
      escolhido.pino.getWorldPosition(mundo),
    )
    const alturaDaTela = canvas.clientHeight || 1
    const porPixel =
      (2 * Math.tan((CAMPO_DE_VISAO * Math.PI) / 360)) / alturaDaTela

    anel.visible = true
    anel.position.copy(escolhido.posicao).setLength(RAIO * 1.002)
    anel.lookAt(0, 0, 0)
    anel.scale.setScalar(18 * porPixel * distancia * crescimento)
    ;(anel.material as MeshBasicMaterial).opacity =
      (semMovimento ? 0.5 : 1 - fasePulso) * 0.55
  }

  quadro = requestAnimationFrame(desenhar)

  /* ---------------------------------------------------------------- */
  /* O que o componente controla                                      */
  /* ---------------------------------------------------------------- */

  /** Troca a textura do pino. O tamanho é refeito no quadro seguinte. */
  function vestir(pino: Pino, escolhido: boolean) {
    const material = pino.pino.material as SpriteMaterial
    material.map = escolhido ? texturaEscolhida : texturaNormal
    material.needsUpdate = true
    /* Na frente dos outros: dois pinos vizinhos e o escolhido por baixo
       seria exatamente o que não se quer ver. */
    pino.pino.renderOrder = escolhido ? 2 : 1
  }

  return {
    irPara(lat, lng) {
      interagindo = true
      /* Pelo caminho mais curto: sem isto, ir de −52° para 170° daria a
         volta pelo Atlântico inteiro em vez de cruzar o Pacífico. */
      const volta = Math.round((atual.lng - lng) / 360) * 360
      alvo.lat = Math.max(-LATITUDE_MAXIMA, Math.min(LATITUDE_MAXIMA, lat))
      alvo.lng = lng + volta
      alvo.zoom = Math.min(alvo.zoom, 1.9)
    },

    destacar(id) {
      if (destacado && porId.has(destacado)) vestir(porId.get(destacado)!, false)
      destacado = id
      fasePulso = 0
      if (id && porId.has(id)) vestir(porId.get(id)!, true)
    },

    filtrar(ids) {
      for (const pino of pinos) {
        pino.aceso = ids === null || ids.has(pino.id)
      }

      /* A rota é refeita: ligar cidades que o filtro apagou desenharia
         um caminho por lugares que não estão mais no mapa. */
      rota.geometry.dispose()
      rota.geometry = arcosEntre(
        marcadores.filter((marcador) => porId.get(marcador.id)?.aceso),
      )
    },

    ativo(ligado) {
      rodando = ligado
      if (ligado) ultimoInstante = performance.now()
    },

    destruir() {
      cancelAnimationFrame(quadro)
      observador.disconnect()
      canvas.removeEventListener('pointerdown', aoDescer)
      canvas.removeEventListener('pointermove', aoMover)
      canvas.removeEventListener('pointerup', aoSubir)
      canvas.removeEventListener('pointercancel', aoSubir)
      canvas.removeEventListener('pointerleave', aoSair)
      canvas.removeEventListener('wheel', aoRolar)

      cena.traverse((objeto) => {
        if (objeto instanceof Mesh || objeto instanceof Points || objeto instanceof LineSegments) {
          objeto.geometry.dispose()
          const material = objeto.material
          for (const item of Array.isArray(material) ? material : [material]) {
            if ('map' in item && item.map) (item.map as CanvasTexture).dispose()
            item.dispose()
          }
        }
      })
      renderer.dispose()
    },
  }
}
