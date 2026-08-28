/**
 * IMAGENS DE PRÉ-VISUALIZAÇÃO — BANCO PEXELS
 * ==========================================
 * Baixa uma fotografia do Pexels para cada chave do registro de mídia e
 * escreve `src/content/media-preview.ts`.
 *
 * ATENÇÃO — são fotografias de BANCO, não são registros da AIDEP. Servem
 * só para ver o site com as molduras preenchidas. Nunca aparecem por
 * padrão: só com o interruptor de pré-visualização ligado.
 *
 * Chave de API (grátis, sem cartão): https://www.pexels.com/api/
 * Guarde em `.env.local` como PEXELS_API_KEY=...
 *
 *   npm run images:pexels                        # baixa o que falta
 *   npm run images:pexels -- --force             # rebaixa tudo
 *   npm run images:pexels -- --only home.hero
 *   npm run images:pexels -- --pick home.hero=3  # troca por outra foto da busca
 *   npm run images:pexels -- --list home.hero    # mostra as opções da busca
 */

import { mkdir, readFile, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PLAN, orientationOf } from './lib/media-plan.mjs'
import { jpegSize, renderRegistry, sleep } from './lib/preview-registry.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public', 'images', 'preview')
const registryFile = path.join(root, 'src', 'content', 'media-preview.ts')

const SEARCH = 'https://api.pexels.com/v1/search'
const PER_PAGE = 12
const THROTTLE_MS = 3_000
/**
 * Cuidado com o ritmo: uma rajada de buscas faz o Pexels bloquear a chave
 * por alguns minutos, e o bloqueio aparece como 401 "Invalid API key" — não
 * como 429. Insistir depressa só prolonga o castigo. Daí o intervalo entre
 * as chaves e a espera longa a cada 401.
 */
const RETRIES = 4
const BLOCKED_WAIT_MS = 60_000

/* ------------------------------------------------------------------ */

/** Lê PEXELS_API_KEY do ambiente ou de .env.local / .env — sem dependências. */
async function readApiKey() {
  if (process.env.PEXELS_API_KEY) return process.env.PEXELS_API_KEY.trim()

  for (const name of ['.env.local', '.env']) {
    try {
      const content = await readFile(path.join(root, name), 'utf8')
      const match = content.match(/^\s*PEXELS_API_KEY\s*=\s*(.+)\s*$/m)
      if (match) return match[1].trim().replace(/^["']|["']$/g, '')
    } catch {
      /* arquivo ausente — segue */
    }
  }
  return null
}

async function search(apiKey, entry) {
  const url =
    `${SEARCH}?query=${encodeURIComponent(entry.query)}` +
    `&per_page=${PER_PAGE}` +
    `&orientation=${orientationOf(entry.ratio)}` +
    `&size=large`

  let last = 'sem resposta'

  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    const response = await fetch(url, {
      headers: { Authorization: apiKey },
      signal: AbortSignal.timeout(60_000),
    })

    if (response.ok) {
      const body = await response.json()
      if (!body.photos?.length) {
        throw new Error(`nenhum resultado para "${entry.query}"`)
      }
      return body.photos
    }

    /* 401 é chave errada — insistir não resolve, e mascara o problema real.
       Uma chave do Pexels tem 56 caracteres; conferir o começo e o fim ao
       copiar evita perder tempo com "instabilidade" que não existe. */
    if (response.status === 401) {
      throw new Error(
        `401 Invalid API key — a chave tem ${apiKey.length} caracteres ` +
          `(as do Pexels têm 56). Confira PEXELS_API_KEY em .env.local.`,
      )
    }

    last = response.status === 429 ? '429 (limite de requisições)' : `HTTP ${response.status}`

    if (attempt < RETRIES) {
      const wait = response.status === 429 ? BLOCKED_WAIT_MS * attempt : attempt * 2_000
      console.log(`  … ${entry.query}: ${last} — nova tentativa em ${wait / 1000}s`)
      await sleep(wait)
    }
  }

  throw new Error(last)
}

async function download(photo) {
  /* `large2x` tem ~1880px de largura — folgado para as molduras do site. */
  const source = photo.src.large2x ?? photo.src.large ?? photo.src.original

  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      const response = await fetch(source, { signal: AbortSignal.timeout(120_000) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const buffer = Buffer.from(await response.arrayBuffer())
      if (buffer.length < 5_000) throw new Error('arquivo muito pequeno')
      return buffer
    } catch (error) {
      if (attempt === RETRIES) throw new Error(`${error.message} ao baixar a imagem`)
      await sleep(attempt * 1_500)
    }
  }
  throw new Error('inalcançável')
}

async function exists(file) {
  try {
    await stat(file)
    return true
  } catch {
    return false
  }
}

function readFlag(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

/** `--pick home.hero=3,about.hero=0` → { 'home.hero': 3, 'about.hero': 0 } */
function readPicks() {
  const raw = readFlag('--pick')
  if (!raw) return {}
  return Object.fromEntries(
    raw.split(',').map((pair) => {
      const [key, index] = pair.split('=')
      return [key.trim(), Number(index)]
    }),
  )
}

/** Guarda a escolha entre execuções, para `--force` não desfazer o ajuste. */
const picksFile = path.join(outDir, '.picks.json')

async function loadPicks() {
  try {
    return JSON.parse(await readFile(picksFile, 'utf8'))
  } catch {
    return {}
  }
}

/* ------------------------------------------------------------------ */

async function main() {
  const apiKey = await readApiKey()
  if (!apiKey) {
    console.error(
      'PEXELS_API_KEY não encontrada.\n\n' +
        '  1. pegue a chave grátis em https://www.pexels.com/api/ (sem cartão)\n' +
        '  2. escreva em site/.env.local:  PEXELS_API_KEY=sua-chave\n\n' +
        'Alternativa sem chave nenhuma: npm run images:preview (gera por IA).',
    )
    process.exitCode = 1
    return
  }

  const force = process.argv.includes('--force')
  const only = readFlag('--only')?.split(',').map((value) => value.trim())
  const listKey = readFlag('--list')
  const picks = { ...(await loadPicks()), ...readPicks() }

  await mkdir(outDir, { recursive: true })

  /* Modo consulta: mostra as opções da busca para escolher outra foto. */
  if (listKey) {
    const entry = PLAN[listKey]
    if (!entry) {
      console.error(`chave desconhecida: ${listKey}`)
      process.exitCode = 1
      return
    }
    const photos = await search(apiKey, entry)
    console.log(`"${entry.query}" — ${orientationOf(entry.ratio)}\n`)
    photos.forEach((photo, index) => {
      const marker = (picks[listKey] ?? 0) === index ? '→' : ' '
      console.log(
        `${marker} ${String(index).padStart(2)}  ${photo.photographer.padEnd(24)} ${photo.url}`,
      )
    })
    console.log(`\nPara trocar:  npm run images:pexels -- --force --only ${listKey} --pick ${listKey}=N`)
    return
  }

  const keys = Object.keys(PLAN).filter((key) => !only || only.includes(key))
  if (!keys.length) {
    console.error('Nenhuma chave selecionada. Chaves válidas:\n' + Object.keys(PLAN).join('\n'))
    process.exitCode = 1
    return
  }

  const assets = {}
  const failures = []
  const credits = { ...(await loadCredits()) }
  let first = true

  for (const key of keys) {
    const file = path.join(outDir, `${key}.jpg`)
    const relative = `/images/preview/${key}.jpg`
    let buffer

    if (!force && (await exists(file)) && credits[key]) {
      buffer = await readFile(file)
      console.log(`· ${key} — já existe`)
    } else {
      if (!first) await sleep(THROTTLE_MS)
      first = false
      try {
        const photos = await search(apiKey, PLAN[key])
        const index = Math.min(picks[key] ?? 0, photos.length - 1)
        const photo = photos[index]
        buffer = await download(photo)
        await writeFile(file, buffer)
        credits[key] = `Foto: ${photo.photographer} / Pexels — ${photo.url}`
        console.log(
          `✓ ${key} — ${photo.photographer} (${index}/${photos.length}) ${(buffer.length / 1024).toFixed(0)} kB`,
        )
      } catch (error) {
        failures.push(`${key}: ${error.message}`)
        console.error(`✗ ${key} — ${error.message}`)
        continue
      }
    }

    const { width, height } = jpegSize(buffer)
    assets[key] = {
      src: relative,
      width,
      height,
      alt: PLAN[key].alt,
      credit: credits[key],
    }
  }

  /* Toda imagem que já está no disco continua no registro, tenha ela sido
     baixada agora ou numa execução anterior. Uma falha de rede nunca deve
     apagar do site o que já estava lá. */
  for (const key of Object.keys(PLAN)) {
    if (assets[key]) continue
    const file = path.join(outDir, `${key}.jpg`)
    if (!(await exists(file))) continue
    const { width, height } = jpegSize(await readFile(file))
    assets[key] = {
      src: `/images/preview/${key}.jpg`,
      width,
      height,
      alt: PLAN[key].alt,
      credit: credits[key],
    }
  }

  const ordered = Object.fromEntries(
    Object.keys(PLAN).filter((key) => assets[key]).map((key) => [key, assets[key]]),
  )

  /* Sem nenhuma imagem e com falhas, a execução não produziu nada: deixa o
     registro como está em vez de esvaziá-lo. */
  if (!Object.keys(ordered).length && failures.length) {
    console.error(`\n${failures.length} falha(s) e nenhuma imagem — registro intacto.`)
    console.error(failures.join('\n'))
    process.exitCode = 1
    return
  }

  await writeFile(
    registryFile,
    renderRegistry(ordered, {
      origin: 'fotografias de banco do Pexels (licença Pexels — uso comercial livre)',
      command: 'npm run images:pexels',
    }),
    'utf8',
  )
  await writeFile(creditsFile, JSON.stringify(credits, null, 2), 'utf8')
  await writeFile(picksFile, JSON.stringify(picks, null, 2), 'utf8')

  console.log(`\n${Object.keys(ordered).length} imagem(ns) no registro → src/content/media-preview.ts`)

  if (failures.length) {
    console.error(`\n${failures.length} falha(s):\n${failures.join('\n')}`)
    process.exitCode = 1
  }
}

const creditsFile = path.join(outDir, '.credits.json')

async function loadCredits() {
  try {
    return JSON.parse(await readFile(creditsFile, 'utf8'))
  } catch {
    return {}
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
