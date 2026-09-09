'use client'

/**
 * LEITURA DA PLANILHA PARA A JANELA DE DOCUMENTO
 * ==============================================
 * O navegador não desenha planilha dentro de um quadro: `.xlsx` é um zip
 * binário, e `.csv` ele oferece para download ou joga como texto cru. Em
 * ambos os casos quem clicou em "Visualizar" na Transparência não vê a
 * planilha — vê um arquivo baixando.
 *
 * O CSV, porém, é texto. Este módulo o baixa, separa as colunas e devolve
 * a grade pronta para o `SpreadsheetView` desenhar como tabela de verdade
 * dentro da própria página, com cabeçalho e colunas alinhadas.
 *
 * Os mesmos cuidados da prévia do PDF (ver `lib/previa-pdf.ts`): cada
 * arquivo é lido UMA vez por sessão, e pedidos simultâneos ao mesmo
 * arquivo compartilham a mesma promessa. Fechar e reabrir a janela, ou
 * abrir o próximo documento e voltar, não baixa nada de novo.
 *
 * Falha de rede ou arquivo ilegível devolvem `null`, e a janela volta a
 * oferecer o download. Nada disso derruba a página.
 */

/**
 * Coluna de número: a que só tem valor, e por isso alinha à direita com
 * dígitos de largura fixa — é o que deixa a coluna de reais legível de
 * cima a baixo. Aceita o formato brasileiro ("1.234,56") e o inglês
 * ("1,234.56"); "2026-01" e "12/2026" não entram, são data.
 *
 * Mora aqui, junto da leitura, porque a janela (`SpreadsheetView`) e a
 * miniatura da tabela (`previaDaPlanilha`) precisam alinhar as mesmas
 * colunas à direita — divergir faria a prévia mentir sobre a planilha.
 */
export function pareceNumero(valor: string): boolean {
  return /^-?R?\$?\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?%?$/.test(valor.trim())
}

export type Planilha = {
  /** Linhas de comentário do topo do arquivo (as que começam com `#`). */
  notas: string[]
  cabecalho: string[]
  linhas: string[][]
  /**
   * Total de linhas do arquivo. Maior que `linhas.length` quando a
   * planilha passou de `LIMITE_LINHAS` e foi cortada para exibição.
   */
  totalDeLinhas: number
}

/**
 * Planilha de prestação de contas costuma ter dezenas de linhas; uma
 * exportação de sistema pode ter dezenas de milhares. Acima disto a
 * janela mostra o começo e avisa — desenhar 40 mil linhas travaria a
 * rolagem, e quem precisa da planilha inteira usa o botão de download.
 */
const LIMITE_LINHAS = 500

/** Concluídas: URL do arquivo → grade pronta, ou `null` se não deu. */
const prontas = new Map<string, Planilha | null>()

/** Em curso: URL do arquivo → promessa que os interessados aguardam. */
const emAndamento = new Map<string, Promise<Planilha | null>>()

/* ------------------------------------------------------------------ */
/* Leitura                                                             */
/* ------------------------------------------------------------------ */

/**
 * Tira do topo as linhas de comentário. O gerador do acervo de exemplo
 * marca assim o aviso de dado fictício (ver `scripts/gen-example-documents.mjs`),
 * e a janela mostra esse aviso acima da tabela em vez de como primeira
 * linha de dados.
 */
function separarNotas(texto: string): { notas: string[]; corpo: string } {
  const linhas = texto.split(/\r?\n/)
  const notas: string[] = []

  let i = 0
  while (i < linhas.length && linhas[i].startsWith('#')) {
    const nota = linhas[i].replace(/^#+\s*/, '').trim()
    if (nota) notas.push(nota)
    i += 1
  }

  return { notas, corpo: linhas.slice(i).join('\n') }
}

/**
 * Qual caractere separa as colunas. Não é sempre a vírgula: o Excel em
 * português exporta com ponto e vírgula, e exportação de sistema às
 * vezes usa tabulação. Vence quem mais aparece na linha do cabeçalho,
 * fora das aspas — dentro delas o caractere é conteúdo, não separador.
 */
function detectarSeparador(corpo: string): string {
  const contagem: Record<string, number> = { ',': 0, ';': 0, '\t': 0 }
  let entreAspas = false

  for (let i = 0; i < corpo.length; i += 1) {
    const caractere = corpo[i]

    if (caractere === '"') {
      /* Aspas dobradas são uma aspa escapada, e não o fim do campo. */
      if (entreAspas && corpo[i + 1] === '"') {
        i += 1
        continue
      }
      entreAspas = !entreAspas
      continue
    }

    if (entreAspas) continue
    if (caractere === '\n') break
    if (caractere in contagem) contagem[caractere] += 1
  }

  const vencedor = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0]
  return vencedor[1] > 0 ? vencedor[0] : ','
}

/**
 * Divide o texto em linhas e colunas seguindo o CSV como ele é de fato
 * escrito: campo entre aspas pode conter o separador, quebra de linha e
 * aspas dobradas — é assim que "1.234,56" e endereço com vírgula chegam
 * inteiros.
 */
function dividir(corpo: string, separador: string): string[][] {
  const grade: string[][] = []
  let linha: string[] = []
  let campo = ''
  let entreAspas = false

  for (let i = 0; i < corpo.length; i += 1) {
    const caractere = corpo[i]

    if (entreAspas) {
      if (caractere !== '"') {
        campo += caractere
        continue
      }
      if (corpo[i + 1] === '"') {
        campo += '"'
        i += 1
        continue
      }
      entreAspas = false
      continue
    }

    if (caractere === '"') {
      entreAspas = true
      continue
    }

    if (caractere === separador) {
      linha.push(campo)
      campo = ''
      continue
    }

    /* CRLF: quem fecha a linha é o \n que vem em seguida. */
    if (caractere === '\r') continue

    if (caractere === '\n') {
      linha.push(campo)
      grade.push(linha)
      linha = []
      campo = ''
      continue
    }

    campo += caractere
  }

  if (campo !== '' || linha.length > 0) {
    linha.push(campo)
    grade.push(linha)
  }

  return grade
}

/** Linha sem nada — o \r\n final do arquivo, ou linha em branco no meio. */
function vazia(linha: string[]): boolean {
  return linha.every((celula) => celula.trim() === '')
}

/** Analisa o texto do CSV. Devolve `null` quando não sobra nada para mostrar. */
export function analisarCsv(texto: string): Planilha | null {
  /* BOM: o gerador o escreve para o Excel em português abrir com os
     acentos certos, e sem tirá-lo a primeira coluna viria com um
     caractere invisível no nome. */
  const { notas, corpo } = separarNotas(texto.replace(/^﻿/, ''))

  const grade = dividir(corpo, detectarSeparador(corpo)).filter(
    (linha) => !vazia(linha),
  )
  if (grade.length === 0) return null

  const [cabecalho, ...linhas] = grade
  const colunas = cabecalho.length

  return {
    notas,
    cabecalho: cabecalho.map((celula) => celula.trim()),
    /* Linha curta ganha células vazias, linha longa é cortada: a tabela
       precisa de retângulo, e planilha exportada erra a contagem com
       alguma frequência. */
    linhas: linhas
      .slice(0, LIMITE_LINHAS)
      .map((linha) =>
        Array.from({ length: colunas }, (_, i) => (linha[i] ?? '').trim()),
      ),
    totalDeLinhas: linhas.length,
  }
}

async function baixar(url: string): Promise<Planilha | null> {
  const resposta = await fetch(url)
  if (!resposta.ok) return null

  return analisarCsv(await resposta.text())
}

/** A planilha pronta para desenhar, ou `null` quando não foi possível ler. */
export function carregarPlanilha(url: string): Promise<Planilha | null> {
  const pronta = prontas.get(url)
  if (pronta !== undefined) return Promise.resolve(pronta)

  const jaPedida = emAndamento.get(url)
  if (jaPedida) return jaPedida

  const tarefa = baixar(url)
    .catch((erro) => {
      console.error('[aidep] não foi possível ler a planilha:', erro)
      return null
    })
    .then((planilha) => {
      prontas.set(url, planilha)
      emAndamento.delete(url)
      return planilha
    })

  emAndamento.set(url, tarefa)
  return tarefa
}

/** Planilha já lida nesta sessão, para reabrir a janela sem piscar. */
export function planilhaEmCache(url: string): Planilha | null | undefined {
  return prontas.get(url)
}

/* ------------------------------------------------------------------ */
/* Miniatura da planilha                                               */
/* ------------------------------------------------------------------ */

/**
 * MINIATURA DA PLANILHA
 * =====================
 * A coluna "Prévia" da Transparência mostra a primeira página de cada
 * documento. O PDF tem página, e ela é desenhada em `lib/previa-pdf.ts`;
 * a planilha não tem — então esta é desenhada aqui, do mesmo jeito e no
 * mesmo formato de folha, a partir da grade já lida.
 *
 * O resultado é uma imagem: o componente da prévia (`DocumentPreview`)
 * trata PDF e planilha pelo mesmo caminho, e a coluna fica visualmente
 * coerente de cima a baixo em vez de misturar página com ícone.
 *
 * Não é uma tabela para ler — na moldura da tabela ela tem 80 px de
 * largura. É para reconhecer: cabeçalho, gutter de linhas numeradas,
 * colunas de valor alinhadas à direita. O visitante vê que aquela linha
 * leva a números, e não a um relatório de texto.
 */

/** Medida do desenho: proporção A4, o dobro da moldura, para telas retina. */
const LARGURA_DA_MINIATURA = 224
const ALTURA_DA_MINIATURA = 314

/** Além disto a coluna sai fina demais para significar coisa alguma. */
const MAXIMO_DE_COLUNAS = 6

const MARGEM = 9
const LARGURA_DO_GUTTER = 11
const ALTURA_DO_CABECALHO = 13
const ALTURA_DA_LINHA = 11

/* Os mesmos neutros do site (ver `app/globals.css`). O canvas não lê
   variável de CSS, então aqui vão os valores. */
const COR = {
  papel: '#ffffff',
  faixa: '#f0f0f0',
  linha: '#dcdcdc',
  linhaForte: '#bdbdbd',
  texto: '#1c1c1c',
  textoFraco: '#6b6b6b',
} as const

const miniaturasProntas = new Map<string, string | null>()
const miniaturasEmAndamento = new Map<string, Promise<string | null>>()

/** Escreve o texto cortado no limite da célula, sem transbordar para a vizinha. */
function escreverNaCelula(
  contexto: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
  largura: number,
  aDireita: boolean,
) {
  if (!texto) return

  contexto.save()
  contexto.beginPath()
  contexto.rect(x, y - ALTURA_DA_LINHA, largura, ALTURA_DA_LINHA * 2)
  contexto.clip()
  contexto.textAlign = aDireita ? 'right' : 'left'
  contexto.fillText(texto, aDireita ? x + largura : x, y)
  contexto.restore()
}

function desenharPlanilha(planilha: Planilha): string | null {
  const tela = document.createElement('canvas')
  tela.width = LARGURA_DA_MINIATURA
  tela.height = ALTURA_DA_MINIATURA

  const contexto = tela.getContext('2d')
  if (!contexto) return null

  contexto.fillStyle = COR.papel
  contexto.fillRect(0, 0, tela.width, tela.height)
  contexto.textBaseline = 'alphabetic'

  let topo = MARGEM

  /* A nota do topo do arquivo — no acervo de exemplo, o aviso de dado
     fictício. A janela a mostra acima da tabela; a miniatura faz igual. */
  const nota = planilha.notas[0]
  if (nota) {
    contexto.font = '7px system-ui, sans-serif'
    contexto.fillStyle = COR.textoFraco
    escreverNaCelula(
      contexto,
      nota,
      MARGEM,
      topo + 7,
      tela.width - MARGEM * 2,
      false,
    )
    topo += 14
  }

  const colunas = Math.min(planilha.cabecalho.length, MAXIMO_DE_COLUNAS)
  const esquerda = MARGEM + LARGURA_DO_GUTTER
  const larguraDaGrade = tela.width - MARGEM - esquerda
  const larguraDaColuna = larguraDaGrade / colunas

  const numericas = planilha.cabecalho
    .slice(0, colunas)
    .map((_, coluna) => {
      const valores = planilha.linhas
        .map((linha) => linha[coluna] ?? '')
        .filter((valor) => valor !== '')

      return valores.length > 0 && valores.every(pareceNumero)
    })

  /* Cabeçalho: faixa cinza atravessando a grade, como na janela. */
  contexto.fillStyle = COR.faixa
  contexto.fillRect(MARGEM, topo, tela.width - MARGEM * 2, ALTURA_DO_CABECALHO)

  contexto.font = '600 6px system-ui, sans-serif'
  contexto.fillStyle = COR.textoFraco
  planilha.cabecalho.slice(0, colunas).forEach((titulo, coluna) => {
    escreverNaCelula(
      contexto,
      titulo.toUpperCase(),
      esquerda + coluna * larguraDaColuna + 2,
      topo + 9,
      larguraDaColuna - 4,
      numericas[coluna],
    )
  })

  const inicioDasLinhas = topo + ALTURA_DO_CABECALHO
  const cabem = Math.floor(
    (tela.height - MARGEM - inicioDasLinhas) / ALTURA_DA_LINHA,
  )
  const linhas = planilha.linhas.slice(0, Math.max(0, cabem))

  contexto.font = '7px system-ui, sans-serif'
  linhas.forEach((linha, indice) => {
    const y = inicioDasLinhas + indice * ALTURA_DA_LINHA
    const base = y + 8

    contexto.fillStyle = COR.textoFraco
    contexto.font = '6px system-ui, sans-serif'
    escreverNaCelula(
      contexto,
      String(indice + 1),
      MARGEM,
      base,
      LARGURA_DO_GUTTER - 2,
      true,
    )

    contexto.fillStyle = COR.texto
    contexto.font = '7px system-ui, sans-serif'
    linha.slice(0, colunas).forEach((celula, coluna) => {
      escreverNaCelula(
        contexto,
        celula,
        esquerda + coluna * larguraDaColuna + 2,
        base,
        larguraDaColuna - 4,
        numericas[coluna],
      )
    })

    /* Fio de baixo da linha. */
    contexto.fillStyle = COR.linha
    contexto.fillRect(MARGEM, y + ALTURA_DA_LINHA - 0.5, tela.width - MARGEM * 2, 0.5)
  })

  /* Fios verticais: o gutter das linhas numeradas e a divisa das colunas. */
  const fimDaGrade = inicioDasLinhas + linhas.length * ALTURA_DA_LINHA
  contexto.fillStyle = COR.linhaForte
  contexto.fillRect(esquerda - 2, topo, 0.5, fimDaGrade - topo)
  contexto.fillRect(MARGEM, inicioDasLinhas - 0.5, tela.width - MARGEM * 2, 0.5)

  contexto.fillStyle = COR.linha
  for (let coluna = 1; coluna < colunas; coluna += 1) {
    contexto.fillRect(
      esquerda + coluna * larguraDaColuna - 1,
      topo,
      0.5,
      fimDaGrade - topo,
    )
  }

  return tela.toDataURL('image/webp', 0.85)
}

/**
 * A planilha desenhada como folha, pronta para um `<img>`, ou `null`
 * quando o arquivo não pôde ser lido.
 */
export function previaDaPlanilha(url: string): Promise<string | null> {
  const pronta = miniaturasProntas.get(url)
  if (pronta !== undefined) return Promise.resolve(pronta)

  const jaPedida = miniaturasEmAndamento.get(url)
  if (jaPedida) return jaPedida

  const tarefa = carregarPlanilha(url)
    .then((planilha) => (planilha ? desenharPlanilha(planilha) : null))
    .catch((erro) => {
      console.error('[aidep] não foi possível desenhar a prévia da planilha:', erro)
      return null
    })
    .then((imagem) => {
      miniaturasProntas.set(url, imagem)
      miniaturasEmAndamento.delete(url)
      return imagem
    })

  miniaturasEmAndamento.set(url, tarefa)
  return tarefa
}

/** Miniatura já desenhada nesta sessão, para a primeira renderização não piscar. */
export function previaDePlanilhaEmCache(url: string): string | null | undefined {
  return miniaturasProntas.get(url)
}
