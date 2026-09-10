/**
 * PREPARAR O ACERVO PARA A WEB
 * ============================
 *   npm run acervo
 *
 * Lê a curadoria de `scripts/lib/acervo.mjs`, converte cada arquivo do
 * acervo bruto para o formato que o site serve e escreve o registro de
 * dimensões em `src/content/acervo.ts`.
 *
 *   fotografia  HEIC/JPEG  →  public/images/acervo/<nome>.webp
 *   vídeo       MOV 4K     →  public/videos/<nome>.mp4  +  <nome>.webp (capa)
 *   abertura    MP4 drone  →  public/videos/<nome>.mp4  +  <nome>.webp (capa)
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
 * Requisitos: `ffmpeg` e `ffprobe` no PATH (o HEIC do iPhone é decodificado
 * por eles; o `sharp` só lê AVIF). Sem eles o script explica e para.
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
 * COMPRESSÃO DAS FOTOGRAFIAS
 * ==========================
 * O acervo já esteve publicado em `quality: 78`, e a queixa foi direta:
 * imagem de má qualidade. Em 78 o WebP põe blocos visíveis exatamente
 * onde este acervo mais tem área lisa — camisa de uniforme, parede de
 * ginásio, gramado ao sol.
 *
 * O ajuste tem três partes, e as três importam:
 *
 * - `quality: 88` — o joelho da curva do WebP para fotografia. De 78
 *   para 88 o arquivo cresce cerca de 60%, e é aí que os blocos somem;
 *   de 88 para 95 ele dobra de novo sem diferença que se veja na tela.
 * - `smartSubsample` — sem isto o WebP joga fora três quartos da
 *   informação de cor. É o que borrava o verde da marca contra o branco
 *   do uniforme, e custa quase nada.
 * - `effort: 6` — o codificador procura mais antes de decidir. É tempo
 *   de máquina na hora de preparar o acervo, não peso para quem visita.
 *
 * Somado à largura maior em `lib/acervo.mjs` (2560 px nas faixas
 * sangradas), o acervo passou de 12 MB para cerca de 30 MB — que
 * continua sendo menos do que uma única foto do original, e nenhuma
 * página serve mais que algumas delas.
 */
const QUALIDADE_DA_FOTO = {
  quality: 88,
  effort: 6,
  smartSubsample: true,
}

/** Mesma conversa para a capa do vídeo, que também é fotografia. */
const QUALIDADE_DA_CAPA = { quality: 84, effort: 6, smartSubsample: true }

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

/** Decodifica HEIC para um JPEG temporário; os demais formatos o sharp lê direto. */
async function comoJpeg(arquivo) {
  if (!/\.heic$/i.test(arquivo)) return { caminho: arquivo, temporario: false }

  await mkdir(temporarios, { recursive: true })
  const saida = path.join(temporarios, `${path.basename(arquivo)}.jpg`)
  /* Sem -vf: o HEIC do iPhone vem em ladrilhos e o ffmpeg monta a imagem
     por filtergraph próprio — um filtro simples aqui derruba a conversão. */
  await exec('ffmpeg', ['-v', 'error', '-i', arquivo, '-frames:v', '1', '-update', '1', '-q:v', '2', '-y', saida])
  return { caminho: saida, temporario: true }
}

async function prepararFotos() {
  await mkdir(destinoFotos, { recursive: true })
  const registrados = []

  for (const foto of fotos) {
    const entrada = path.join(origem, foto.origem)
    const saida = path.join(destinoFotos, `${foto.nome}.webp`)

    if (!existsSync(entrada)) {
      console.error(`  ! ${foto.nome}: original não encontrado — ${foto.origem}`)
      continue
    }
    if (reaproveitar('fotos') && existsSync(saida)) {
      const meta = await sharp(saida).metadata()
      registrados.push({ nome: foto.nome, width: meta.width, height: meta.height })
      continue
    }

    const { caminho, temporario } = await comoJpeg(entrada)
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
      .webp(QUALIDADE_DA_FOTO)
      .toFile(saida)

    if (temporario) await rm(caminho, { force: true })

    registrados.push({ nome: foto.nome, width: info.width, height: info.height })
    console.log(`  ✓ ${foto.nome}.webp  ${info.width}×${info.height}  ${kb(info.size)}`)
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
    const saidaCapa = path.join(destinoVideos, `${video.nome}.webp`)

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
      await sharp(bruto).webp(QUALIDADE_DA_CAPA).toFile(saidaCapa)
      await rm(bruto, { force: true })
    }

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
    const saidaCapa = path.join(destinoVideos, `${abertura.nome}.webp`)

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
        .webp(QUALIDADE_DA_FOTO)
        .toFile(saidaCapa)
      await rm(bruto, { force: true })
    }

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
    .map((f) => `  '${f.nome}': { src: '/images/acervo/${f.nome}.webp', width: ${f.width}, height: ${f.height} },`)
    .join('\n')

  const linhasVideo = videosProntos
    .map(
      (v) =>
        `  '${v.nome}': {\n` +
        `    src: '/videos/${v.nome}.mp4',\n` +
        `    poster: '/videos/${v.nome}.webp',\n` +
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
        `    poster: '/videos/${v.nome}.webp',\n` +
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
