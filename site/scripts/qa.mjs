/**
 * QA automatizado do site da AIDEP.
 *
 * Percorre todas as rotas nos três idiomas, em todos os breakpoints
 * exigidos, e reporta:
 *   • erros de console e requisições que falharam;
 *   • overflow horizontal (e qual elemento o causou);
 *   • imagens deformadas em relação à proporção do arquivo;
 *   • imagens que carregaram mas estão invisíveis — moldura sem altura
 *     recortando tudo, ou máscara de revelação presa no estado escondido;
 *   • links internos quebrados;
 *   • ausência de h1 ou de landmarks.
 *
 * Uso: node scripts/qa.mjs [baseUrl]
 */
import puppeteer from 'puppeteer-core'

const BASE = process.argv[2] ?? 'http://localhost:3741'
const CHROME =
  process.env.CHROME_PATH ??
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const WIDTHS = [360, 390, 768, 1024, 1440, 1920]

const ROUTES = [
  '/pt',
  '/pt/projetos',
  '/pt/projetos/coracao-valente',
  '/pt/projetos/futsal-na-escola',
  '/pt/projetos/futedu-summit',
  '/pt/noticias',
  '/pt/transparencia',
  '/pt/parceiros',
  '/pt/doacoes',
  '/en',
  '/en/projects',
  '/en/projects/futedu-summit',
  '/en/news',
  '/en/transparency',
  '/en/partners',
  '/en/donate',
  '/es',
  '/es/proyectos',
  '/es/proyectos/coracao-valente',
  '/es/noticias',
  '/es/transparencia',
  '/es/socios',
  '/es/donaciones',
]

const problems = []
const report = (route, width, kind, detail) =>
  problems.push({ route, width, kind, detail })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

const linkTargets = new Set()

for (const route of ROUTES) {
  for (const width of WIDTHS) {
    const page = await browser.newPage()
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })

    const consoleErrors = []
    const failedRequests = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', (error) => consoleErrors.push(String(error)))
    page.on('requestfailed', (request) =>
      failedRequests.push(`${request.url()} — ${request.failure()?.errorText}`),
    )

    const response = await page.goto(BASE + route, {
      waitUntil: 'networkidle2',
      timeout: 90000,
    })

    if (!response || response.status() >= 400) {
      report(route, width, 'status', String(response?.status()))
    }

    /* Rola a página inteira para disparar animações, contadores e o
       ScrollTrigger, exatamente como um visitante faria. */
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y)
        await new Promise((resolve) => setTimeout(resolve, 60))
      }
      window.scrollTo(0, document.body.scrollHeight)
      await new Promise((resolve) => setTimeout(resolve, 250))
      window.scrollTo(0, 0)
      await new Promise((resolve) => setTimeout(resolve, 150))
    })

    const audit = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth
      const offenders = []

      for (const element of document.querySelectorAll('body *')) {
        const style = getComputedStyle(element)
        if (style.position === 'fixed' || style.display === 'none') continue
        const rect = element.getBoundingClientRect()
        if (rect.width === 0 && rect.height === 0) continue
        if (rect.right > docWidth + 1.5 || rect.left < -1.5) {
          offenders.push(
            `${element.tagName.toLowerCase()}.${String(element.className || '')
              .split(' ')
              .slice(0, 3)
              .join('.')} [${Math.round(rect.left)} → ${Math.round(rect.right)}]`,
          )
        }
        if (offenders.length > 4) break
      }

      const distorted = []
      for (const img of document.querySelectorAll('img')) {
        if (!img.naturalWidth || !img.complete) continue
        const rect = img.getBoundingClientRect()
        if (rect.width < 8 || rect.height < 8) continue
        const style = getComputedStyle(img)
        if (style.objectFit === 'cover' || style.objectFit === 'contain') continue
        const natural = img.naturalWidth / img.naturalHeight
        const rendered = rect.width / rect.height
        if (Math.abs(natural - rendered) / natural > 0.02) {
          distorted.push(
            `${img.getAttribute('src')?.slice(0, 70)} ${natural.toFixed(3)} vs ${rendered.toFixed(3)}`,
          )
        }
      }

      const links = [...document.querySelectorAll('a[href]')]
        .map((a) => a.getAttribute('href'))
        .filter((href) => href && href.startsWith('/'))

      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: docWidth,
        offenders,
        distorted,
        h1: document.querySelectorAll('h1').length,
        main: document.querySelectorAll('main').length,
        links: [...new Set(links)],
        missingAlt: [...document.querySelectorAll('img')].filter(
          (img) => img.getAttribute('alt') === null,
        ).length,
      }
    })

    if (audit.scrollWidth > audit.clientWidth + 1) {
      report(
        route,
        width,
        'overflow-x',
        `${audit.scrollWidth} > ${audit.clientWidth} :: ${audit.offenders.join(' | ') || 'sem elemento identificado'}`,
      )
    }
    if (audit.distorted.length) {
      report(route, width, 'imagem-deformada', audit.distorted.join(' | '))
    }

    /* Imagem que carregou, tem tamanho e ainda assim não chega aos olhos de
       ninguém. Já aconteceu duas vezes, por motivos diferentes — moldura de
       parallax com altura zero recortando tudo, e máscara de revelação que
       nunca abria —, e nenhuma das checagens acima percebia: a imagem está
       lá, no tamanho certo e sem deformação. Aqui a pergunta é outra —
       algum ancestral a esconde por inteiro?

       Cada suspeita é reconfirmada com a imagem trazida para a cena e um
       tempo de acomodação. Sem isso o resultado seria só ruído: a varredura
       acima corre a página em passos largos e deixa para trás revelações
       que ainda não dispararam — elas abrem normalmente quando alguém rola
       até ali, que é justamente o que a reconfirmação reproduz. */
    const invisible = await page.evaluate(async () => {
      function hiddenBy(img) {
        let node = img.parentElement
        while (node && node !== document.body) {
          const style = getComputedStyle(node)
          const box = node.getBoundingClientRect()
          if (style.overflow !== 'visible' && (box.width < 2 || box.height < 2)) {
            return `ancestral recorta com ${Math.round(box.width)}×${Math.round(box.height)}`
          }
          /* Máscara presa no estado escondido: uma borda em 100% não deixa
             sobrar área nenhuma. */
          if (/\b100%/.test(style.clipPath)) return `máscara presa em ${style.clipPath}`
          node = node.parentElement
        }
        return ''
      }

      const suspects = [...document.querySelectorAll('img')].filter((img) => {
        if (!img.naturalWidth) return false
        const rect = img.getBoundingClientRect()
        return rect.width >= 8 && rect.height >= 8 && hiddenBy(img)
      })

      const confirmed = []
      for (const img of suspects) {
        img.scrollIntoView({ block: 'center', behavior: 'instant' })
        await new Promise((resolve) => setTimeout(resolve, 900))
        const cause = hiddenBy(img)
        if (cause) {
          confirmed.push(`${(img.getAttribute('alt') || '?').slice(0, 40)} — ${cause}`)
        }
      }
      return confirmed
    })

    if (invisible.length) {
      report(route, width, 'imagem-invisivel', invisible.slice(0, 4).join(' | '))
    }
    if (audit.h1 !== 1) report(route, width, 'h1', `encontrados: ${audit.h1}`)
    if (audit.main !== 1) report(route, width, 'main', `encontrados: ${audit.main}`)
    if (audit.missingAlt) {
      report(route, width, 'img-sem-alt', String(audit.missingAlt))
    }
    if (consoleErrors.length) {
      report(route, width, 'console', consoleErrors.slice(0, 3).join(' | '))
    }
    if (failedRequests.length) {
      report(route, width, 'request', failedRequests.slice(0, 3).join(' | '))
    }

    audit.links.forEach((href) => linkTargets.add(href))
    await page.close()
  }
  process.stdout.write(`. ${route}\n`)
}

/* Verificação de links internos */
const broken = []
for (const href of linkTargets) {
  const response = await fetch(BASE + href, { redirect: 'follow' })
  if (!response.ok) broken.push(`${href} → ${response.status}`)
}

await browser.close()

console.log('\n================ RESULTADO ================')
console.log(`Rotas verificadas: ${ROUTES.length} × ${WIDTHS.length} larguras`)
console.log(`Links internos verificados: ${linkTargets.size}`)

if (broken.length) {
  console.log('\nLINKS QUEBRADOS:')
  broken.forEach((item) => console.log('  ' + item))
} else {
  console.log('Links quebrados: nenhum')
}

if (problems.length === 0) {
  console.log('\nNenhum problema encontrado.')
} else {
  console.log(`\nPROBLEMAS (${problems.length}):`)
  const grouped = new Map()
  for (const problem of problems) {
    const key = `${problem.kind} :: ${problem.detail}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(`${problem.route}@${problem.width}`)
  }
  for (const [key, where] of grouped) {
    console.log(`\n• ${key}`)
    console.log(`  ${where.slice(0, 8).join(', ')}${where.length > 8 ? ` (+${where.length - 8})` : ''}`)
  }
}

process.exit(problems.length || broken.length ? 1 : 0)
