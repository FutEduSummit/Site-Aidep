/**
 * DOCUMENTOS DE EXEMPLO — GERAÇÃO DOS ARQUIVOS
 * ============================================
 * Escreve os arquivos de demonstração da página de Transparência em
 * `public/documentos/exemplo/` e o registro
 * `src/content/documents-example.ts`.
 *
 *   npm run docs:example
 *
 * ATENÇÃO — os arquivos gerados NÃO são documentos oficiais da AIDEP:
 * cada página traz a marca EXEMPLO e um aviso de conteúdo fictício. Eles
 * só aparecem no site na build de pré-visualização (ver `lib/preview.ts`).
 * Quando os documentos reais chegarem, apague a pasta, cadastre-os em
 * `src/content/documents.ts` e o gerador deixa de ser necessário.
 *
 * O PDF é escrito à mão, sem dependências: uma página A4 por vez, fontes
 * Type 1 padrão (Helvetica) e texto em WinAnsi — o suficiente para um
 * documento de demonstração legível em qualquer leitor.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CATEGORY_LABEL,
  EXAMPLE_DOCUMENTS,
  EXAMPLE_LAST_UPDATE,
} from './lib/example-documents.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public', 'documentos', 'exemplo')
const publicPath = '/documentos/exemplo'
const registryFile = path.join(root, 'src', 'content', 'documents-example.ts')

/* ------------------------------------------------------------------ */
/* Texto em WinAnsi                                                    */
/* ------------------------------------------------------------------ */

/** Pontuação tipográfica que existe em WinAnsi fora do Latin-1. */
const WINANSI = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
}

/**
 * Strings do dicionario /Info nao usam WinAnsi: para sair certo em
 * qualquer leitor, vao como texto UTF-16BE em hexadecimal.
 */
function hexText(value) {
  let out = 'FEFF'
  for (const unit of value) {
    for (let i = 0; i < unit.length; i += 1) {
      out += unit.charCodeAt(i).toString(16).padStart(4, '0').toUpperCase()
    }
  }
  return `<${out}>`
}

/** Escapa uma string para dentro de um literal `( )` do PDF. */
function escapeText(value) {
  let out = ''
  for (const char of value) {
    const code = char.codePointAt(0)
    const byte = code > 0xff ? (WINANSI[code] ?? 0x3f) : code
    if (byte === 0x28 || byte === 0x29 || byte === 0x5c) {
      out += `\\${String.fromCharCode(byte)}`
    } else if (byte < 32 || byte > 126) {
      out += `\\${byte.toString(8).padStart(3, '0')}`
    } else {
      out += String.fromCharCode(byte)
    }
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

const PAGE = { width: 595.28, height: 841.89, margin: 56 }
const USABLE = PAGE.width - PAGE.margin * 2
const GREEN = '0.063 0.588 0.243'
const INK = '0.06 0.06 0.06'
const GRAY = '0.42 0.42 0.42'
const RULE = '0.85 0.85 0.85'

/** Largura média por caractere — o bastante para quebrar linha. */
const RATIO = { F1: 0.55, F2: 0.5 }

function textOp(value, x, y, size, font, color) {
  return (
    `BT /${font} ${size} Tf ${color} rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm ` +
    `(${escapeText(value)}) Tj ET\n`
  )
}

function wrap(value, size, font, width = USABLE) {
  const max = Math.max(8, Math.floor(width / (size * RATIO[font])))
  const lines = []
  let line = ''
  for (const word of value.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word
    if (candidate.length <= max) {
      line = candidate
    } else {
      if (line) lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

function formatDate(iso) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso))
}

/** Constrói o texto de todas as páginas de um documento. */
function composePages(doc) {
  const pages = []
  let content = ''
  let y = 0

  function openPage() {
    content = ''
    /* Marca d'água inclinada — a primeira coisa desenhada fica no fundo. */
    content += `q 0.9063 0.4226 -0.4226 0.9063 100 210 cm ${textOp('EXEMPLO', 0, 0, 76, 'F1', '0.925 0.925 0.925')}Q\n`
    /* Módulo do símbolo + assinatura institucional. */
    content += `${GREEN} rg ${PAGE.margin} ${PAGE.height - PAGE.margin - 10} 64 9 re f\n`
    content += textOp('AIDEP', PAGE.margin, PAGE.height - PAGE.margin - 50, 25, 'F1', INK)
    content += textOp(
      'Associação Internacional para o Desenvolvimento do Desporto e Paradesporto',
      PAGE.margin,
      PAGE.height - PAGE.margin - 66,
      7.6,
      'F2',
      GRAY,
    )
    /* Rodapé do aviso, em todas as páginas. */
    content += `${RULE} rg ${PAGE.margin} 82 ${USABLE} 0.7 re f\n`
    content += textOp(
      'Documento de exemplo gerado para a pré-visualização do site institucional.',
      PAGE.margin,
      66,
      7.6,
      'F2',
      GRAY,
    )
    content += textOp(
      'Conteúdo fictício — não é documento oficial da AIDEP.',
      PAGE.margin,
      54,
      7.6,
      'F1',
      GRAY,
    )
    y = PAGE.height - PAGE.margin - 108
  }

  function closePage() {
    pages.push(content)
  }

  function ensure(space) {
    if (y - space >= 104) return
    closePage()
    openPage()
  }

  function paragraph(value, { size = 10, font = 'F2', color = INK, leading = 15, after = 10 } = {}) {
    for (const line of wrap(value, size, font)) {
      ensure(leading)
      content += textOp(line, PAGE.margin, y, size, font, color)
      y -= leading
    }
    y -= after
  }

  openPage()

  /* Capa: categoria, título, resumo e a régua institucional. */
  paragraph(`${CATEGORY_LABEL[doc.category]} · ${doc.year}`, {
    size: 8,
    font: 'F1',
    color: GRAY,
    leading: 12,
    after: 12,
  })
  paragraph(doc.title.pt, { size: 21, font: 'F1', leading: 26, after: 14 })
  if (doc.summary) {
    paragraph(doc.summary, { size: 11, color: GRAY, leading: 16, after: 16 })
  }
  paragraph(`Publicado em ${formatDate(doc.publishedAt)}`, {
    size: 8,
    color: GRAY,
    leading: 12,
    after: 18,
  })

  ensure(20)
  content += `${RULE} rg ${PAGE.margin} ${y} ${USABLE} 0.7 re f\n`
  y -= 26

  for (const block of doc.body) {
    paragraph(block)
  }

  closePage()
  return pages
}

/* ------------------------------------------------------------------ */
/* Arquivo PDF                                                         */
/* ------------------------------------------------------------------ */

function buildPdf(doc) {
  const pages = composePages(doc)
  const objects = []

  objects[0] = '<</Type/Catalog/Pages 2 0 R>>'
  objects[2] =
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold/Encoding/WinAnsiEncoding>>'
  objects[3] =
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>'

  let next = 5
  const pageIds = []
  for (const content of pages) {
    const pageId = next++
    const contentId = next++
    pageIds.push(pageId)
    objects[pageId - 1] =
      `<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${PAGE.width} ${PAGE.height}]` +
      `/Resources<</Font<</F1 3 0 R/F2 4 0 R>>>>/Contents ${contentId} 0 R>>`
    objects[contentId - 1] = `<</Length ${content.length}>>\nstream\n${content}\nendstream`
  }

  objects[1] =
    `<</Type/Pages/Kids[${pageIds.map((id) => `${id} 0 R`).join(' ')}]` +
    `/Count ${pageIds.length}>>`

  const infoId = next++
  objects[infoId - 1] =
    `<</Title${hexText(doc.title.pt)}` +
    `/Subject${hexText('Documento de exemplo — conteúdo fictício, não é documento oficial da AIDEP')}` +
    `/Author${hexText('AIDEP — arquivo de exemplo')}` +
    `/Creator(scripts/gen-example-documents.mjs)>>`

  let out = '%PDF-1.4\n'
  const offsets = []
  objects.forEach((body, index) => {
    offsets[index] = out.length
    out += `${index + 1} 0 obj\n${body}\nendobj\n`
  })

  const startxref = out.length
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets) {
    out += `${String(offset).padStart(10, '0')} 00000 n \n`
  }
  out +=
    `trailer\n<</Size ${objects.length + 1}/Root 1 0 R/Info ${infoId} 0 R>>\n` +
    `startxref\n${startxref}\n%%EOF\n`

  return Buffer.from(out, 'latin1')
}

function buildCsv(doc) {
  const cell = (value) =>
    /[",;\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
  const lines = [
    `# ${doc.table.note}`,
    doc.table.header.join(','),
    ...doc.table.rows.map((row) => row.map(cell).join(',')),
  ]
  /* BOM: o Excel em português abre o arquivo com os acentos certos. */
  return Buffer.from(`﻿${lines.join('\r\n')}\r\n`, 'utf8')
}

/* ------------------------------------------------------------------ */
/* Registro                                                            */
/* ------------------------------------------------------------------ */

function sizeLabel(bytes) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} kB`
    : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

function renderRegistry(entries) {
  const items = entries
    .map((entry) => {
      const lines = [
        '  {',
        `    id: ${JSON.stringify(entry.id)},`,
        '    title: {',
        `      pt: ${JSON.stringify(entry.title.pt)},`,
        `      en: ${JSON.stringify(entry.title.en)},`,
        `      es: ${JSON.stringify(entry.title.es)},`,
        '    },',
        `    category: ${JSON.stringify(entry.category)},`,
        `    year: ${entry.year},`,
        `    publishedAt: ${JSON.stringify(entry.publishedAt)},`,
        `    file: ${JSON.stringify(entry.file)},`,
        `    format: ${JSON.stringify(entry.format)},`,
        `    sizeLabel: ${JSON.stringify(entry.sizeLabel)},`,
      ]
      if (entry.projectSlug) {
        lines.push(`    projectSlug: ${JSON.stringify(entry.projectSlug)},`)
      }
      lines.push('  },')
      return lines.join('\n')
    })
    .join('\n')

  return `import type { InstitutionalDocument } from './types'

/**
 * DOCUMENTOS DE EXEMPLO — ARQUIVO GERADO
 * ======================================
 * NÃO EDITE À MÃO. Gere de novo com:
 *
 *     npm run docs:example
 *
 * A lista e o texto dos arquivos moram em \`scripts/lib/example-documents.mjs\`.
 *
 * São documentos de DEMONSTRAÇÃO: conteúdo fictício, cada página marcada
 * com a palavra EXEMPLO. Não são documentos oficiais da AIDEP e não valem
 * como prestação de contas.
 *
 * Eles só chegam à página de Transparência quando o conteúdo de exemplo
 * está ligado (\`lib/preview.ts\` — \`next dev\` ou
 * \`NEXT_PUBLIC_PREVIEW_IMAGES=1\`). Na build pública, a lista volta a ser
 * vazia e a página exibe o estado vazio institucional.
 */
export const exampleDocuments: InstitutionalDocument[] = [
${items}
]

/** Data da última publicação do conjunto de exemplo. */
export const exampleLastUpdatedAt = ${JSON.stringify(EXAMPLE_LAST_UPDATE)}
`
}

/* ------------------------------------------------------------------ */

async function main() {
  await mkdir(outDir, { recursive: true })

  const entries = []
  for (const doc of EXAMPLE_DOCUMENTS) {
    const buffer = doc.format === 'csv' ? buildCsv(doc) : buildPdf(doc)
    const name = `${doc.file}.${doc.format}`
    await writeFile(path.join(outDir, name), buffer)
    entries.push({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      year: doc.year,
      publishedAt: doc.publishedAt,
      file: `${publicPath}/${name}`,
      format: doc.format,
      sizeLabel: sizeLabel(buffer.length),
      projectSlug: doc.projectSlug,
    })
    console.log(`✓ ${name} — ${sizeLabel(buffer.length)}`)
  }

  await writeFile(registryFile, renderRegistry(entries), 'utf8')
  console.log(
    `\n${entries.length} documento(s) de exemplo → src/content/documents-example.ts`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
