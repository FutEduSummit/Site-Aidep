/**
 * Verifica o site com `prefers-reduced-motion: reduce`.
 * Confirma que todo o conteúdo permanece visível (nada preso em opacidade 0
 * ou fora da tela) e que o marquee e o parallax ficam estáticos.
 */
import puppeteer from 'puppeteer-core'

const BASE = process.argv[2] ?? 'http://localhost:3741'
const CHROME =
  process.env.CHROME_PATH ??
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const ROUTES = [
  '/pt',
  '/pt/projetos',
  '/pt/projetos/coracao-valente',
  '/pt/transparencia',
  '/pt/parceiros',
  '/pt/doacoes',
  '/pt/noticias',
]

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-prefers-reduced-motion'],
})

const problems = []

for (const route of ROUTES) {
  const page = await browser.newPage()
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' },
  ])
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 45000 })

  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 70))
    }
    window.scrollTo(0, 0)
    await new Promise((r) => setTimeout(r, 200))
  })

  const audit = await page.evaluate(() => {
    const hidden = []
    const moved = []
    const animated = []

    const targets = document.querySelectorAll(
      'main h1, main h2, main h3, main p, main li, main dd',
    )

    for (const el of targets) {
      const style = getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) continue
      if (Number(style.opacity) < 0.9) {
        hidden.push(`${el.tagName}: opacity ${style.opacity} — ${el.textContent?.slice(0, 40)}`)
      }
      if (style.transform !== 'none' && style.transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
        moved.push(`${el.tagName}: ${style.transform} — ${el.textContent?.slice(0, 30)}`)
      }
      if (hidden.length > 3 && moved.length > 3) break
    }

    for (const el of document.querySelectorAll('[data-motion="marquee"] *')) {
      const style = getComputedStyle(el)
      if (style.animationName !== 'none') {
        animated.push(`marquee anima: ${style.animationName}`)
        break
      }
    }

    return {
      hidden: hidden.slice(0, 4),
      moved: moved.slice(0, 4),
      animated,
      prefers: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    }
  })

  if (!audit.prefers) problems.push(`${route}: emulação não aplicada`)
  if (audit.hidden.length) problems.push(`${route}: oculto → ${audit.hidden.join(' | ')}`)
  if (audit.moved.length) problems.push(`${route}: deslocado → ${audit.moved.join(' | ')}`)
  if (audit.animated.length) problems.push(`${route}: ${audit.animated.join(' | ')}`)

  console.log(`. ${route}`)
  await page.close()
}

await browser.close()

console.log('\n========= REDUCED MOTION =========')
if (problems.length === 0) {
  console.log('Todo o conteúdo visível, sem deslocamento e sem movimento contínuo.')
} else {
  problems.forEach((p) => console.log('• ' + p))
}
process.exit(problems.length ? 1 : 0)
