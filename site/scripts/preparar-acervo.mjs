/**
 * PREPARAR O ACERVO PARA A WEB
 * ============================
 *   npm run acervo
 *
 * Lê a curadoria de `scripts/lib/acervo.mjs`, converte cada arquivo do
 * acervo bruto para o formato que o site serve e escreve o registro de
 * dimensões em `src/content/acervo.ts`.
 *
 *   fotografia  HEIC/JPEG  →  public/images/acervo/<nome>.avif
 *   vídeo       MOV 4K     →  public/videos/<nome>.mp4  +  <nome>.avif (capa)
 *   abertura    MP4 drone  →  public/videos/<nome>.mp4  +  <nome>.avif (capa)
 *
 * Três decisões que valem explicar:
 *
 * 1. **Nada de metadado.** O acervo veio de celular e carrega GPS, modelo
 *    do aparelho e data. Foto e vídeo são regravados sem nenhum metadado —
 *    publicar a coordenada da quadra onde as crianças treinam não é opção.
 *
 * 2. **O vídeo desce de 4K.** O acervo é vertical e aparece no site em uma
 *    coluna estreita; 2160 px seriam 200 MB para exibir um retrato
 *    pequeno. O filme institucional sai em 720×1280 e os clipes da fileira
 *    em 540×960 — o dobro do tamanho em que aparecem, que é o que uma tela
 *    retina precisa —, ambos a 30 quadros e com teto de bitrate.
 *
 * 3. **As dimensões são lidas, nunca digitadas.** `src/content/acervo.ts` é
 *    gerado por este script: largura, altura e duração saem do arquivo
 *    pronto. É o que garante que nenhuma moldura do site erre a proporção.
 *
 * Requisitos: `ffmpeg` e `ffprobe` no PATH. São eles que decodificam o HEIC
 * do iPhone — o `sharp` distribuído no npm **escreve** AVIF mas não **lê**
 * HEIC (o libheif vem sem o decodificador HEVC). Sem eles o script explica
 * e para.
 */

import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import sharp from 'sharp'
import { ORIGEM_PADRAO, aberturas, fotos, videos } from './lib/acervo.mjs'

const exec = promisify(execFile)

const raizProjeto = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const origem = path.resolve(raizProjeto, process.env.ACERVO_ORIGEM ?? ORIGEM_PADRAO)
const destinoFotos = path.join(raizProjeto, 'public/images/acervo')
const destinoVideos = path.join(raizProjeto, 'public/videos')
const registro = path.join(raizProjeto, 'src/content/acervo.ts')
const temporarios = path.join(raizProjeto, 'scripts/.cache/acervo')

/**
 * COMPRESSÃO DAS FOTOGRAFIAS — AVIF
 * =================================
 * O acervo já esteve em WebP `quality: 78`, e a queixa foi direta: imagem
 * de má qualidade. Foi para WebP 88, e os blocos sumiram. Agora sai em
 * **AVIF**, e o motivo não é a moda do formato: é o croma.
 *
 * O WebP lossy guarda cor em 4:2:0 — um valor de cor para cada quadrado
 * de dois por dois pixels, sempre, sem opção. `smartSubsample` só escolhe
 * melhor *qual* valor jogar fora. Era o que borrava o verde da marca
 * contra o branco do uniforme e a linha do campo contra o gramado. O AVIF
 * aceita **4:4:4**: cor por pixel, como no original.
 *
 * As três partes do ajuste, medidas neste acervo (2560 px):
 *
 * - `quality: 78` — na escala do AVIF, que não é a do WebP. Um q78 4:4:4
 *   dá o mesmo peso do WebP 88 que estava publicado (585 kB no quadro de
 *   abertura, 169 kB na foto da formação) carregando bem mais informação:
 *   croma completo e textura preservada onde o WebP já alisava.
 * - `chromaSubsampling: '4:4:4'` — o ponto todo da troca. Custa de 4% a
 *   8% de arquivo sobre o 4:2:0 e devolve a cor que o WebP não guardava.
 * - `effort: 6` — o codificador procura mais antes de decidir. Medido
 *   aqui, `effort` acima de 4 quase não muda o tamanho, mas gasta o
 *   orçamento de bits melhor dentro dele. É tempo de máquina na hora de
 *   preparar o acervo, não peso para quem visita.
 *
 * ESTE ARQUIVO NÃO É O QUE O VISITANTE BAIXA
 * ------------------------------------------
 * O `next/image` recomprime tudo no servidor, na largura que a tela pede
 * (ver `next.config.ts` e `lib/image-quality.ts`). O que este script
 * produz é o **negativo**: quanto mais informação ele guardar, melhor o
 * resultado dessa segunda passagem. Por isso a qualidade daqui é mais
 * alta que a da entrega — e por isso 4:4:4 importa mesmo que a entrega
 * reduza de novo.
 */
const QUALIDADE_DA_FOTO = {
  quality: 78,
  effort: 6,
  chromaSubsampling: '4:4:4',
}

/**
 * Mesma conversa para a capa do vídeo, que também é fotografia. Um degrau
 * abaixo porque ela é o quadro parado de um vídeo já comprimido: o
 * detalhe fino que o q78 preservaria não existe no arquivo de origem.
 */
const QUALIDADE_DA_CAPA = { quality: 72, effort: 6, chromaSubsampling: '4:4:4' }

const soFaltantes = process.argv.includes('--faltantes')
/* Sem `--fotos` nem `--videos`, faz os dois. */
const apenas = process.argv.includes('--fotos')
  ? 'fotos'
  : process.argv.includes('--videos')
    ? 'videos'
    : process.argv.includes('--aberturas')
      ? 'aberturas'
      : 'tudo'

/**
 * `true` quando a etapa deve apenas ler o que já está publicado — porque
 * foi pedido `--faltantes`, ou porque a rodada é só da outra etapa. De
 * qualquer jeito o registro em `src/content/acervo.ts` sai completo: as
 * medidas vêm do arquivo que está em `public/`, novo ou antigo.
 */
function reaproveitar(etapa) {
  return soFaltantes || (apenas !== 'tudo' && apenas !== etapa)
}

/* ------------------------------------------------------------------ */

async function checarFerramentas() {
  for (const ferramenta of ['ffmpeg', 'ffprobe']) {
    try {
      await exec(ferramenta, ['-version'])
    } catch {
      console.error(
        `\n${ferramenta} não encontrado no PATH.\n` +
          'É ele que decodifica o HEIC do iPhone e recomprime o vídeo.\n' +
          'Instale (winget install Gyan.FFmpeg · brew install ffmpeg) e rode de novo.\n',
      )
      process.exit(1)
    }
  }
}

function kb(bytes) {
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.round(bytes / 1000)} kB`
}

/**
 * Apaga o arquivo que a rodada anterior publicou em WebP. Até esta troca o
 * acervo saía em `.webp`; sem esta limpeza os dois formatos ficariam lado a
 * lado em `public/` — o antigo iria para o repositório sem nada apontando
 * para ele, dobrando o peso do que é versionado.
 *
 * Só é chamado depois de o `.avif` estar no lugar: apagar antes deixaria a
 * imagem sem arquivo nenhum se a rodada fosse interrompida no meio.
 */
async function apagarWebpAntigo(caminhoAvif) {
  await rm(caminhoAvif.replace(/\.avif$/, '.webp'), { force: true })
}

/**
 * Decodifica HEIC para um PNG temporário; os demais formatos o sharp lê
 * direto.
 *
 * PNG, e não JPEG. Este arquivo é só a ponte entre o ffmpeg e o sharp, e um
 * JPEG no meio do caminho põe uma compressão com perda **antes** da que
 * vale — a do AVIF. Metade do acervo é HEIC de iPhone e passava por aqui:
 * era uma geração de perda que ninguém pediu, em sessenta fotografias. O
 * PNG temporário é grande (20 MB para um arquivo de 12 MP) e vive os poucos
 * segundos até o AVIF ficar pronto.
 *
 * A conversão é tentada mais de uma vez de propósito: o ffmpeg abre um
 * decodificador por ladrilho do HEIC e, com a máquina ocupada, falha com
 * "Cannot allocate memory" num arquivo que converte sem queixa na tentativa
 * seguinte.
 */
async function comoPng(arquivo) {
  if (!/\.heic$/i.test(arquivo)) return { caminho: arquivo, temporario: false }

  await mkdir(temporarios, { recursive: true })
  const saida = path.join(temporarios, `${path.basename(arquivo)}.png`)

  for (let tentativa = 1; ; tentativa += 1) {
    try {
      /* Sem -vf: o HEIC do iPhone vem em ladrilhos e o ffmpeg monta a imagem
         por filtergraph próprio — um filtro simples aqui derruba a conversão. */
      await exec('ffmpeg', ['-v', 'error', '-i', arquivo, '-frames:v', '1', '-update', '1', '-y', saida])
      return { caminho: saida, temporario: true }
    } catch (erro) {
      if (tentativa === 3) throw erro
      await new Promise((seguir) => setTimeout(seguir, 1500 * tentativa))
    }
  }
}

async function prepararFotos() {
  await mkdir(destinoFotos, { recursive: true })
  const registrados = []

  for (const foto of fotos) {
    const entrada = path.join(origem, foto.origem)
    const saida = path.join(destinoFotos, `${foto.nome}.avif`)

    if (!existsSync(entrada)) {
      console.error(`  ! ${foto.nome}: original não encontrado — ${foto.origem}`)
      continue
    }
    if (reaproveitar('fotos') && existsSync(saida)) {
      const meta = await sharp(saida).metadata()
      await apagarWebpAntigo(saida)
      registrados.push({ nome: foto.nome, width: meta.width, height: meta.height })
      continue
    }

    /* Uma fotografia que não converte não derruba as outras 128: o erro é
       relatado e a rodada segue. Quem cobra a falta é o `tsc` — a chave sem
       arquivo desaparece do registro e `content/media.ts` para de compilar,
       em vez de o site publicar uma imagem quebrada. Rodar de novo com
       `--faltantes` retoma só o que ficou. */
    try {
      const { caminho, temporario } = await comoPng(entrada)
      const info = await sharp(caminho)
        /* `rotate()` sem argumento aplica a orientação do EXIF e a descarta —
           é o que impede a foto de celular de sair deitada. */
        .rotate()
        .resize({
          width: foto.largura,
          withoutEnlargement: true,
          /* Lanczos com nitidez de volta: reduzir uma foto de 12 MP para
             2560 px sempre come detalhe, e sem esta correção o resultado
             chega macio demais — foi metade da queixa de qualidade. */
          kernel: 'lanczos3',
        })
        .sharpen({ sigma: 0.6, m1: 0.4, m2: 1.6 })
        .avif(QUALIDADE_DA_FOTO)
        .toFile(saida)

      if (temporario) await rm(caminho, { force: true })
      await apagarWebpAntigo(saida)

      registrados.push({ nome: foto.nome, width: info.width, height: info.height })
      console.log(`  ✓ ${foto.nome}.avif  ${info.width}×${info.height}  ${kb(info.size)}`)
    } catch (erro) {
      console.error(`  ! ${foto.nome}: ${String(erro.message).split('\n')[0]}`)
    }
  }

  return registrados
}

async function duracao(arquivo) {
  const { stdout } = await exec('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    arquivo,
  ])
  return Number(stdout.trim())
}

async function dimensoes(arquivo) {
  const { stdout } = await exec('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height',
    '-of', 'csv=s=x:p=0',
    arquivo,
  ])
  const [w, h] = stdout.trim().split('x').map(Number)
  return { width: w, height: h }
}

async function prepararVideos() {
  await mkdir(destinoVideos, { recursive: true })
  const registrados = []

  for (const video of videos) {
    const entrada = path.join(origem, video.origem)
    const saidaVideo = path.join(destinoVideos, `${video.nome}.mp4`)
    const saidaCapa = path.join(destinoVideos, `${video.nome}.avif`)

    if (!existsSync(entrada)) {
      console.error(`  ! ${video.nome}: original não encontrado — ${video.origem}`)
      continue
    }

    if (!reaproveitar('videos') || !existsSync(saidaVideo)) {
      /* Os dois abrem no mesmo player de ~448 px, mas o filme
         institucional é o que se assiste até o fim: ganha mais resolução
         e mais teto de bitrate. Os clipes são vistos de relance, e na
         fileira aparecem como prévia muda em cartões de ~248 px. */
      const lado = video.destaque ? [720, 1280] : [540, 960]
      const crf = video.destaque ? '29' : '30'
      const teto = video.destaque ? '1100k' : '900k'

      await exec(
        'ffmpeg',
        [
          '-v', 'error', '-i', entrada,
          /* Cabe na moldura sem deformar, sempre em dimensão par (o H.264
             em 4:2:0 não aceita lado ímpar) e a no máximo 30 quadros: o
             acervo tem clipes a 60 fps que dobrariam o arquivo sem que
             ninguém percebesse a diferença num cartão de 280 px. */
          '-vf',
          `scale=w=${lado[0]}:h=${lado[1]}:force_original_aspect_ratio=decrease,` +
            'scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30',
          '-c:v', 'libx264',
          '-preset', 'slow',
          '-crf', crf,
          /* Teto de bitrate: sem ele, a cena de gramado ao vento (ruído em
             tudo que é quadro) sozinha vale metade do peso da página. */
          '-maxrate', teto,
          '-bufsize', `${parseInt(teto, 10) * 2}k`,
          '-profile:v', 'high',
          '-pix_fmt', 'yuv420p',
          '-c:a', 'aac',
          '-b:a', video.destaque ? '112k' : '80k',
          '-ac', video.destaque ? '2' : '1',
          '-map_metadata', '-1',
          /* Índice no começo do arquivo: o navegador começa a tocar sem
             baixar o vídeo inteiro. */
          '-movflags', '+faststart',
          '-y', saidaVideo,
        ],
        { maxBuffer: 1024 * 1024 * 16 },
      )
    }

    if (!reaproveitar('videos') || !existsSync(saidaCapa)) {
      const bruto = path.join(temporarios, `${video.nome}-capa.jpg`)
      await mkdir(temporarios, { recursive: true })
      await exec('ffmpeg', [
        '-v', 'error', '-ss', String(video.poster ?? 1), '-i', saidaVideo,
        '-frames:v', '1', '-update', '1', '-q:v', '2', '-y', bruto,
      ])
      await sharp(bruto).avif(QUALIDADE_DA_CAPA).toFile(saidaCapa)
      await rm(bruto, { force: true })
    }

    await apagarWebpAntigo(saidaCapa)

    const [{ width, height }, segundos, arquivo] = await Promise.all([
      dimensoes(saidaVideo),
      duracao(saidaVideo),
      stat(saidaVideo),
    ])

    registrados.push({
      nome: video.nome,
      width,
      height,
      duracao: Math.round(segundos),
      destaque: Boolean(video.destaque),
    })
    console.log(
      `  ✓ ${video.nome}.mp4  ${width}×${height}  ${Math.round(segundos)}s  ${kb(arquivo.size)}`,
    )
  }

  return registrados
}

/**
 * OS VÍDEOS DA ABERTURA
 * =====================
 * Outro problema, outro tratamento. Os clipes da fileira aparecem em
 * cartões de 248 px; estes ocupam a tela inteira, atrás do título.
 *
 * - **1920×1080**, e não 540: aqui a largura da janela é a largura do
 *   vídeo.
 * - **Sem faixa de áudio** (`-an`). A abertura toca muda, por decisão e
 *   porque nenhum navegador deixa tocar com som sem gesto do visitante.
 *   Todo o orçamento de bytes vai para a imagem.
 * - **Cortado** em `inicio` e `duracao`, no trecho que se sustenta em
 *   laço. O `-ss` vem antes do `-i` de propósito: assim o ffmpeg salta
 *   direto para o ponto em vez de decodificar tudo até lá.
 * - **Fecho de grupo curto** (`-g 48`): o laço reinicia sem o tranco de
 *   esperar o próximo quadro-chave.
 */
async function prepararAberturas() {
  await mkdir(destinoVideos, { recursive: true })
  const registrados = []

  for (const abertura of aberturas) {
    const entrada = path.join(origem, abertura.origem)
    const saidaVideo = path.join(destinoVideos, `${abertura.nome}.mp4`)
    const saidaCapa = path.join(destinoVideos, `${abertura.nome}.avif`)

    if (!existsSync(entrada)) {
      console.error(`  ! ${abertura.nome}: original não encontrado — ${abertura.origem}`)
      continue
    }

    if (!reaproveitar('aberturas') || !existsSync(saidaVideo)) {
      await exec(
        'ffmpeg',
        [
          '-v', 'error',
          '-ss', String(abertura.inicio ?? 0),
          '-t', String(abertura.duracao),
          '-i', entrada,
          '-vf',
          'scale=w=1920:h=1080:force_original_aspect_ratio=decrease,' +
            'scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30',
          '-c:v', 'libx264',
          '-preset', 'slow',
          '-crf', '25',
          '-maxrate', '3200k',
          '-bufsize', '6400k',
          '-profile:v', 'high',
          '-pix_fmt', 'yuv420p',
          '-g', '48',
          '-an',
          '-map_metadata', '-1',
          '-movflags', '+faststart',
          '-y', saidaVideo,
        ],
        { maxBuffer: 1024 * 1024 * 16 },
      )
    }

    if (!reaproveitar('aberturas') || !existsSync(saidaCapa)) {
      const bruto = path.join(temporarios, `${abertura.nome}-capa.jpg`)
      await mkdir(temporarios, { recursive: true })
      /* O quadro sai do **original**, não do mp4 já comprimido: esta capa
         é a primeira imagem que a página mostra, e tirá-la do arquivo de
         1920 px seria pôr a compressão do vídeo dentro dela. O instante é
         contado a partir do começo da tomada, então soma o corte. */
      await exec('ffmpeg', [
        '-v', 'error',
        '-ss', String((abertura.inicio ?? 0) + (abertura.poster ?? 1)),
        '-i', entrada,
        '-frames:v', '1', '-update', '1', '-q:v', '2', '-y', bruto,
      ])
      await sharp(bruto)
        .resize({ width: 2560, withoutEnlargement: true, kernel: 'lanczos3' })
        .sharpen({ sigma: 0.6, m1: 0.4, m2: 1.6 })
        .avif(QUALIDADE_DA_FOTO)
        .toFile(saidaCapa)
      await rm(bruto, { force: true })
    }

    await apagarWebpAntigo(saidaCapa)

    const [{ width, height }, segundos, arquivo, capa] = await Promise.all([
      dimensoes(saidaVideo),
      duracao(saidaVideo),
      stat(saidaVideo),
      sharp(saidaCapa).metadata(),
    ])

    registrados.push({
      nome: abertura.nome,
      width,
      height,
      duracao: Math.round(segundos),
      capa: { width: capa.width, height: capa.height },
    })
    console.log(
      `  ✓ ${abertura.nome}.mp4  ${width}×${height}  ${segundos.toFixed(1)}s  ${kb(arquivo.size)}`,
    )
  }

  return registrados
}

/* ------------------------------------------------------------------ */

function gerarRegistro(fotosProntas, videosProntos, aberturasProntas) {
  const linhasFoto = fotosProntas
    .map((f) => `  '${f.nome}': { src: '/images/acervo/${f.nome}.avif', width: ${f.width}, height: ${f.height} },`)
    .join('\n')

  const linhasVideo = videosProntos
    .map(
      (v) =>
        `  '${v.nome}': {\n` +
        `    src: '/videos/${v.nome}.mp4',\n` +
        `    poster: '/videos/${v.nome}.avif',\n` +
        `    width: ${v.width},\n` +
        `    height: ${v.height},\n` +
        `    duration: ${v.duracao},\n` +
        `  },`,
    )
    .join('\n')

  const linhasAbertura = aberturasProntas
    .map(
      (v) =>
        `  '${v.nome}': {\n` +
        `    src: '/videos/${v.nome}.mp4',\n` +
        `    poster: '/videos/${v.nome}.avif',\n` +
        `    width: ${v.width},\n` +
        `    height: ${v.height},\n` +
        `    duration: ${v.duracao},\n` +
        `    capa: { width: ${v.capa.width}, height: ${v.capa.height} },\n` +
        `  },`,
    )
    .join('\n')

  return `/**
 * ARQUIVO GERADO — não edite à mão.
 * Refaça com \`npm run acervo\` (ver \`scripts/preparar-acervo.mjs\`).
 *
 * Medidas reais dos arquivos publicados em \`public/images/acervo\` e
 * \`public/videos\`. Quem dá nome, legenda e destino a cada um é
 * \`content/media.ts\` (fotografias) e \`content/videos.ts\` (vídeos).
 */

export type ArquivoDeImagem = {
  src: string
  width: number
  height: number
}

export type ArquivoDeVideo = ArquivoDeImagem & {
  /** Capa exibida antes de o vídeo tocar. */
  poster: string
  /** Duração em segundos, arredondada. */
  duration: number
}

/**
 * Vídeo horizontal da abertura da Página inicial. Diferente do clipe da
 * fileira, aqui a capa tem medida própria: ela é publicada em 2560 px,
 * porque é ela — e não o vídeo — a primeira imagem que a página mostra.
 */
export type ArquivoDeAbertura = ArquivoDeVideo & {
  capa: { width: number; height: number }
}

export const imagensDoAcervo = {
${linhasFoto}
} satisfies Record<string, ArquivoDeImagem>

export const videosDoAcervo = {
${linhasVideo}
} satisfies Record<string, ArquivoDeVideo>

export const aberturasDoAcervo = {
${linhasAbertura}
} satisfies Record<string, ArquivoDeAbertura>

export type ImagemDoAcervo = keyof typeof imagensDoAcervo
export type VideoDoAcervo = keyof typeof videosDoAcervo
export type AberturaDoAcervo = keyof typeof aberturasDoAcervo
`
}

/* ------------------------------------------------------------------ */

await checarFerramentas()

if (!existsSync(origem)) {
  console.error(
    `\nAcervo bruto não encontrado em:\n  ${origem}\n\n` +
      'Aponte a pasta com ACERVO_ORIGEM="/caminho/da/pasta" antes de rodar.\n',
  )
  process.exit(1)
}

console.log(`\nAcervo bruto: ${origem}\n`)
console.log('Fotografias')
const fotosProntas = await prepararFotos()
console.log('\nVídeos')
const videosProntos = await prepararVideos()
console.log('\nAberturas')
const aberturasProntas = await prepararAberturas()

await writeFile(
  registro,
  gerarRegistro(fotosProntas, videosProntos, aberturasProntas),
  'utf8',
)
await rm(temporarios, { recursive: true, force: true })

console.log(
  `\n${fotosProntas.length} fotografias, ${videosProntos.length} vídeos e ` +
    `${aberturasProntas.length} aberturas publicados.` +
    `\nRegistro atualizado: src/content/acervo.ts\n`,
)
