import puppeteer from 'puppeteer-core'
const BASE = 'http://localhost:3741'
const OUT = process.argv[2]
const CHROME = process.env.CHROME_PATH ?? 'C:\Program Files\Google\Chrome\Application\chrome.exe'

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await browser.setCookie({ name: 'aidep-preview', value: 'liberado', domain: 'localhost', path: '/' })
await page.setViewport({ width: 1440, height: 900 })
await page.goto(BASE + '/pt/projetos/coracao-valente', { waitUntil: 'networkidle2', timeout: 120000 })
await page.evaluate(async () => {
  const step = window.innerHeight * 0.6
  for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)) }
  window.scrollTo(0, 0)
})
await new Promise(r => setTimeout(r, 1200))

const sec = await page.$('#project-gallery')
if (!sec) { console.log('secao nao encontrada'); const ids = await page.$$eval('section[id]', els => els.map(e => e.id)); console.log(ids) }
else {
  await sec.screenshot({ path: OUT + '/galeria-antes.png' })
  const botao = await page.$$eval('button', els => { const b = els.find(e => /ver mais/i.test(e.textContent||'')); if (b) { b.click(); return true } return false })
  if (botao) {
    await new Promise(r => setTimeout(r, 2500))
    await page.evaluate(async () => { const s = document.querySelector('#project-gallery'); s?.scrollIntoView(); const step = window.innerHeight*0.6; for (let y = window.scrollY; y < window.scrollY + 4000; y += step) { window.scrollTo(0, y); await new Promise(r=>setTimeout(r,120)) } })
    await new Promise(r => setTimeout(r, 1500))
    const sec2 = await page.$('#project-gallery')
    await sec2.screenshot({ path: OUT + '/galeria-depois.png' })
  }
}
await browser.close()
console.log('ok')
