/**
 * IMAGENS DE PRÉ-VISUALIZAÇÃO — GERAÇÃO POR IA
 * ============================================
 * Alternativa sem chave de API ao `fetch-preview-images.mjs` (Pexels):
 * gera uma imagem para cada chave do registro de mídia via Pollinations.ai
 * e escreve `src/content/media-preview.ts`.
 *
 * ATENÇÃO — estas imagens são MOCKUP, não são fotografias da AIDEP.
 * Servem só para ver o site com as molduras preenchidas. Nunca aparecem por
 * padrão: só com o interruptor de pré-visualização ligado.
 *
 * O acesso anônimo entrega apenas o modelo `sana` e é limitado por tempo:
 * as gerações saem uma a uma e cenas com muitos rostos em plano médio
 * costumam sair deformadas. Para mockup, o Pexels dá resultado melhor.
 *
 *   npm run images:preview                 # gera o que falta
 *   npm run images:preview -- --force      # regera tudo
 *   npm run images:preview -- --only home.hero,about.hero
 *   npm run images:preview -- --seed v2    # outra safra de imagens
 */

import { mkdir, readFile, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PLAN, STYLE, NEGATIVE } from './lib/media-plan.mjs'
import { jpegSize, renderRegistry, sleep } from './lib/preview-registry.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public', 'images', 'preview')
const registryFile = path.join(root, 'src', 'content', 'media-preview.ts')

const ENDPOINT = 'https://image.pollinations.ai/prompt'
/**
 * O acesso anônimo aceita mais ou menos uma geração a cada 15 s. Em
 * paralelo, devolve 429 em quase todas. Por isso: uma de cada vez, com
 * intervalo, e espera longa quando ainda assim vier 429.
 */
const THROTTLE_MS = 16_000
const RETRIES = 5
const RATE_LIMIT_WAIT_MS = 45_000

/* ------------------------------------------------------------------ */

/** Dimensões pedidas: lado maior em ~1280px, respeitando a proporção. */
function requestedSize([w, h]) {
  const long = 1280
  return w >= h
    ? { width: long, height: Math.round((long * h) / w) }
    : { width: Math.round((long * w) / h), height: long }
}

/** Semente estável por chave — a mesma chave devolve sempre a mesma imagem. */
function seedFor(key, salt) {
  let hash = 2166136261
  for (const char of `${key}:${salt}`) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash) % 1_000_000
}

async function exists(file) {
  try {
    await stat(file)
    return true
  } catch {
    return false
  }
}

async function fetchImage(key, entry, salt) {
  const { width, height } = requestedSize(entry.ratio)
  const prompt = `${entry.prompt}. ${STYLE}`
  const url =
    `${ENDPOINT}/${encodeURIComponent(prompt)}` +
    `?width=${width}&height=${height}` +
    `&seed=${seedFor(key, salt)}` +
    `&nologo=true&enhance=true&safe=true` +
    `&negative=${encodeURIComponent(NEGATIVE)}` +
    `&referrer=aidep-site`

  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(180_000) })
      if (response.status === 429) {
        const error = new Error('HTTP 429 (limite de uso)')
        error.rateLimited = true
        throw error
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const buffer = Buffer.from(await response.arrayBuffer())
      if (buffer.length < 5_000) throw new Error('resposta muito pequena')
      return buffer
    } catch (error) {
      if (attempt === RETRIES) throw error
      const wait = error.rateLimited ? RATE_LIMIT_WAIT_MS * attempt : attempt * 5_000
      console.log(`  … ${key}: ${error.message} — nova tentativa em ${wait / 1000}s`)
      await sleep(wait)
    }
  }
  throw new Error('inalcançável')
}

function readFlag(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

/* ------------------------------------------------------------------ */

async function main() {
  const force = process.argv.includes('--force')
  const salt = readFlag('--seed') ?? 'aidep-v1'
  const only = readFlag('--only')?.split(',').map((value) => value.trim())

  const keys = Object.keys(PLAN).filter((key) => !only || only.includes(key))
  if (!keys.length) {
    console.error('Nenhuma chave selecionada. Chaves válidas:\n' + Object.keys(PLAN).join('\n'))
    process.exitCode = 1
    return
  }

  await mkdir(outDir, { recursive: true })

  const assets = {}
  const failures = []
  let generated = 0

  for (const key of keys) {
    const file = path.join(outDir, `${key}.jpg`)
    const relative = `/images/preview/${key}.jpg`
    let buffer

    if (!force && (await exists(file))) {
      buffer = await readFile(file)
      console.log(`· ${key} — já existe`)
    } else {
      /* Espaça as chamadas: o acesso anônimo é limitado por tempo. */
      if (generated > 0) await sleep(THROTTLE_MS)
      generated += 1
      try {
        buffer = await fetchImage(key, PLAN[key], salt)
        await writeFile(file, buffer)
        console.log(`✓ ${key} — ${(buffer.length / 1024).toFixed(0)} kB`)
      } catch (error) {
        failures.push(`${key}: ${error.message}`)
        console.error(`✗ ${key} — ${error.message}`)
        continue
      }
    }

    const { width, height } = jpegSize(buffer)
    assets[key] = { src: relative, width, height, alt: PLAN[key].alt }
  }

  /* Toda imagem que já está no disco continua no registro, tenha ela sido
     gerada agora ou numa execução anterior. Uma falha de rede nunca deve
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
      origin: 'imagens de mockup geradas por IA (Pollinations.ai, modelo sana)',
      command: 'npm run images:preview',
    }),
    'utf8',
  )
  console.log(`\n${Object.keys(ordered).length} imagem(ns) no registro → src/content/media-preview.ts`)

  if (failures.length) {
    console.error(`\n${failures.length} falha(s):\n${failures.join('\n')}`)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
