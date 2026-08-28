/** Captura telas para revisão visual. Uso: node scripts/shots.mjs <baseUrl> <outDir> */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'fs'
import { join } from 'path'

const BASE = process.argv[2] ?? 'http://localhost:3741'
const OUT = process.argv[3] ?? 'shots'
const CHROME =
  process.env.CHROME_PATH ??
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

mkdirSync(OUT, { recursive: true })

const jobs = [
  { route: '/pt', width: 1440, height: 900, offsets: [0, 900, 1900, 3200, 4600, 6200, 7600, 9000, 10400, 11800, 13200, 14600] },
  { route: '/pt', width: 390, height: 844, offsets: [0, 800, 1700, 2800] },
  { route: '/pt/projetos/coracao-valente', width: 1440, height: 900, offsets: [0, 950, 1900] },
  { route: '/pt/doacoes', width: 1440, height: 900, offsets: [0, 900, 1800] },
  { route: '/pt/transparencia', width: 1440, height: 900, offsets: [0, 850] },
  { route: '/en/partners', width: 1024, height: 900, offsets: [0, 900] },
]

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox'],
})

for (const job of jobs) {
  const page = await browser.newPage()
  await page.setViewport({ width: job.width, height: job.height })
  await page.goto(BASE + job.route, { waitUntil: 'networkidle2', timeout: 45000 })

  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 90))
    }
  })

  for (const offset of job.offsets) {
    await page.evaluate((y) => window.scrollTo(0, y), offset)
    await new Promise((r) => setTimeout(r, 700))
    const name = `${job.route.replace(/\//g, '_') || '_root'}-${job.width}-${offset}.png`
    await page.screenshot({ path: join(OUT, name) })
  }
  await page.close()
  console.log('ok', job.route, job.width)
}

await browser.close()
