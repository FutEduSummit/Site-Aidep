/**
 * Testa as interações críticas: menu mobile, indicação da página atual,
 * abertura de toda rota na primeira seção, troca de idioma preservando a
 * página, validação do formulário e ausência de falso sucesso no envio.
 */
import puppeteer from 'puppeteer-core'

const BASE = process.argv[2] ?? 'http://localhost:3741'
const CHROME =
  process.env.CHROME_PATH ??
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const results = []
const check = (name, ok, detail = '') =>
  results.push(`${ok ? 'OK  ' : 'FALHA'} ${name}${detail ? ' — ' + detail : ''}`)

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox'],
})

/* ---------- 1. Menu mobile ---------- */
{
  const page = await browser.newPage()
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
  await page.goto(BASE + '/pt', { waitUntil: 'networkidle2' })

  const toggle = await page.$('button[aria-controls="menu-mobile"]')
  check('botão de menu existe', Boolean(toggle))

  await toggle.click()
  await new Promise((r) => setTimeout(r, 500))

  const opened = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-controls="menu-mobile"]')
    const panel = document.getElementById('menu-mobile')
    return {
      expanded: btn?.getAttribute('aria-expanded'),
      panelVisible: Boolean(panel) && panel.getBoundingClientRect().height > 100,
      links: panel ? panel.querySelectorAll('a').length : 0,
      bodyLocked: document.body.style.overflow === 'hidden',
    }
  })
  check('menu abre', opened.expanded === 'true' && opened.panelVisible)
  check('menu lista rotas', opened.links >= 8, `${opened.links} links`)
  check('rolagem travada', opened.bodyLocked)

  await page.keyboard.press('Escape')
  await new Promise((r) => setTimeout(r, 500))
  const closed = await page.evaluate(() => ({
    expanded: document
      .querySelector('button[aria-controls="menu-mobile"]')
      ?.getAttribute('aria-expanded'),
    panel: Boolean(document.getElementById('menu-mobile')),
    bodyLocked: document.body.style.overflow === 'hidden',
  }))
  check('Escape fecha o menu', closed.expanded === 'false' && !closed.panel)
  check('rolagem restaurada', !closed.bodyLocked)

  await page.close()
}

/* ---------- 2. Troca de idioma preservando a página ---------- */
{
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(BASE + '/pt/projetos/coracao-valente', { waitUntil: 'networkidle2' })

  /* A lista do seletor só existe aberta: sem isto, nenhum `a[hreflang]`
     está no documento e o teste falha por engano. Abre no hover — clicar
     aqui abriria pelo ponteiro e fecharia pelo onClick, no mesmo gesto. */
  await page.hover('nav button[aria-expanded]')
  await new Promise((r) => setTimeout(r, 500))

  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll('nav[aria-label] a[hreflang]')].map((a) => ({
      lang: a.getAttribute('hreflang'),
      href: a.getAttribute('href'),
    })),
  )
  const es = hrefs.find((h) => h.lang === 'es')
  const en = hrefs.find((h) => h.lang === 'en')
  check(
    'seletor mantém a página (ES)',
    es?.href === '/es/proyectos/coracao-valente',
    es?.href,
  )
  check(
    'seletor mantém a página (EN)',
    en?.href === '/en/projects/coracao-valente',
    en?.href,
  )

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('nav a[hreflang="es"]'),
  ])
  const url = page.url()
  const heading = await page.evaluate(() => document.querySelector('h1')?.textContent)
  check('navegação para ES funciona', url.includes('/es/proyectos/coracao-valente'), url)
  check('conteúdo do projeto preservado', heading?.includes('Coração Valente'), heading)

  await page.close()
}

/* ---------- 3. Formulário de contato ---------- */
{
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(BASE + '/pt#contato', { waitUntil: 'networkidle2' })

  await page.click('form button[type="submit"]')
  await new Promise((r) => setTimeout(r, 700))

  const errors = await page.evaluate(() => ({
    invalid: document.querySelectorAll('form [aria-invalid="true"]').length,
    described: [...document.querySelectorAll('form [aria-describedby]')].filter((el) =>
      document.getElementById(el.getAttribute('aria-describedby')),
    ).length,
    messages: [...document.querySelectorAll('form p')]
      .map((p) => p.textContent)
      .filter((t) => t && t.length > 5).length,
  }))
  check('validação bloqueia envio vazio', errors.invalid >= 4, `${errors.invalid} campos`)
  check('erros ligados por aria-describedby', errors.described >= 4)

  await page.evaluate(() => {
    const setValue = (el, value) => {
      const setter = Object.getOwnPropertyDescriptor(
        el instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype,
        'value',
      ).set
      setter.call(el, value)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
    const form = document.querySelector('form')
    setValue(form.querySelector('input[type="text"]'), 'Maria Aparecida')
    setValue(form.querySelector('input[type="email"]'), 'maria@exemplo.com')
    const texts = form.querySelectorAll('input[type="text"]')
    setValue(texts[texts.length - 1], 'Proposta de parceria esportiva')
    setValue(
      form.querySelector('textarea'),
      'Gostaria de entender como apoiar os polos esportivos da associação neste ano.',
    )
    form.querySelector('input[type="checkbox"]').click()
  })

  await new Promise((r) => setTimeout(r, 400))
  await page.click('form button[type="submit"]')
  await new Promise((r) => setTimeout(r, 1800))

  const status = await page.evaluate(() => {
    const box = document.querySelector('[role="status"]')
    return box ? box.textContent : null
  })
  check('sem endpoint, não exibe sucesso falso', Boolean(status) && !/enviada\./i.test(status ?? ''), status?.slice(0, 90))
  check('oferece alternativa por e-mail', /e-mail/i.test(status ?? ''))

  await page.close()
}

/* ---------- 4. Navegação por teclado e skip link ---------- */
{
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(BASE + '/pt', { waitUntil: 'networkidle2' })
  await page.keyboard.press('Tab')
  await new Promise((r) => setTimeout(r, 500))
  const first = await page.evaluate(() => {
    const el = document.activeElement
    return {
      text: el?.textContent?.trim().slice(0, 40),
      href: el?.getAttribute('href'),
      visible: el ? el.getBoundingClientRect().top > -50 : false,
    }
  })
  check('primeiro Tab foca o skip link', first.href === '#conteudo', first.text)
  check('skip link fica visível ao receber foco', first.visible)
  await page.close()
}

/* ---------- 5. Página atual marcada no menu ---------- */
{
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 900 })

  for (const [route, label] of [
    ['/pt', 'Página inicial'],
    ['/pt/projetos', 'Projetos'],
    ['/pt/projetos/coracao-valente', 'Projetos'],
    ['/pt/doacoes', 'Doações'],
  ]) {
    await page.goto(BASE + route, { waitUntil: 'networkidle2' })
    const current = await page.evaluate(() => {
      const nav = document.querySelector('header nav[aria-label]')
      const marked = [...(nav?.querySelectorAll('a[aria-current="page"]') ?? [])]
      return {
        count: marked.length,
        text: marked[0]?.textContent?.replace(/\s*\(.*\)\s*$/, '').trim(),
      }
    })
    check(
      `${route} marca a página atual no menu`,
      current.count === 1 && current.text === label,
      `${current.count} marcado(s): ${current.text ?? '—'}`,
    )
  }

  /* O menu não pode acender dois itens ao mesmo tempo, nem apontar a
     Página inicial quando o visitante está em outra rota. */
  await page.goto(BASE + '/pt/noticias', { waitUntil: 'networkidle2' })
  const homeMarked = await page.evaluate(() => {
    const nav = document.querySelector('header nav[aria-label]')
    const home = [...(nav?.querySelectorAll('a') ?? [])].find(
      (a) => a.getAttribute('href') === '/pt',
    )
    return home?.getAttribute('aria-current')
  })
  check('Página inicial não fica ativa em outra rota', homeMarked === null)

  await page.close()
}

/* ---------- 6. Toda rota abre na primeira seção ---------- */
{
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(BASE + '/pt', { waitUntil: 'networkidle2' })

  /* Sai do topo antes de navegar: é exatamente a situação em que a página
     nova costumava abrir já na segunda seção. */
  await page.evaluate(() => window.scrollTo(0, 3000))
  await new Promise((r) => setTimeout(r, 600))

  for (const [href, name] of [
    ['/pt/projetos', 'Projetos'],
    ['/pt/transparencia', 'Transparência'],
    ['/pt/doacoes', 'Doações'],
  ]) {
    await page.evaluate((h) => {
      const link = [...document.querySelectorAll('a')].find(
        (a) => a.getAttribute('href') === h,
      )
      link?.click()
    }, href)
    await new Promise((r) => setTimeout(r, 1600))

    const top = await page.evaluate(() => ({
      y: window.scrollY,
      url: location.pathname,
    }))
    check(
      `${name} abre no topo`,
      top.url === href && top.y <= 4,
      `${top.url} · scrollY ${Math.round(top.y)}`,
    )

    await page.evaluate(() => window.scrollTo(0, 2500))
    await new Promise((r) => setTimeout(r, 400))
    await page.goto(BASE + '/pt', { waitUntil: 'networkidle2' })
    await page.evaluate(() => window.scrollTo(0, 3000))
    await new Promise((r) => setTimeout(r, 500))
  }

  await page.close()
}

/* ---------- 7. Âncoras da Página inicial ---------- */
{
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(BASE + '/pt', { waitUntil: 'networkidle2' })

  const anchors = await page.evaluate(() =>
    ['a-aidep', 'publico-atendido', 'impacto', 'contato'].map((id) => ({
      id,
      exists: Boolean(document.getElementById(id)),
    })),
  )
  for (const anchor of anchors) {
    check(`seção #${anchor.id} existe na Home`, anchor.exists)
  }

  /* O link do hero não pode trocar de rota: é a mesma página. */
  await page.evaluate(() => {
    const link = [...document.querySelectorAll('a')].find(
      (a) => a.getAttribute('href') === '#a-aidep',
    )
    link?.click()
  })
  await new Promise((r) => setTimeout(r, 1200))
  const afterAnchor = await page.evaluate(() => ({
    path: location.pathname,
    hash: location.hash,
    y: window.scrollY,
    /* O recuo do header fixo tem de estar aplicado: a seção não pode
       ficar escondida atrás dele. */
    sectionTop: document.getElementById('a-aidep')?.getBoundingClientRect().top,
  }))
  check(
    'âncora do hero rola sem trocar de página',
    afterAnchor.path === '/pt' && afterAnchor.hash === '#a-aidep' && afterAnchor.y > 100,
    `${afterAnchor.path}${afterAnchor.hash} · scrollY ${Math.round(afterAnchor.y)}`,
  )
  check(
    'seção ancorada não fica sob o header',
    afterAnchor.sectionTop !== undefined && afterAnchor.sectionTop >= 0,
    `topo em ${Math.round(afterAnchor.sectionTop ?? -1)}px`,
  )

  await page.close()
}

/* ---------- 8. Rotas removidas devolvem 404 traduzido ---------- */
{
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  for (const route of ['/pt/a-aidep', '/pt/impacto', '/pt/contato', '/en/about']) {
    const response = await page.goto(BASE + route, { waitUntil: 'domcontentloaded' })
    check(`${route} devolve 404`, response?.status() === 404, String(response?.status()))
  }

  await page.close()
}

await browser.close()

console.log('\n========= INTERAÇÕES =========')
results.forEach((r) => console.log(r))
const failed = results.filter((r) => r.startsWith('FALHA'))
process.exit(failed.length ? 1 : 0)
