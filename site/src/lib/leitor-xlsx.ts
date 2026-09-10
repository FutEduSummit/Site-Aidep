'use client'

import type { Planilha } from '@/lib/previa-planilha'

/**
 * LEITURA DE .XLSX NO PRÓPRIO NAVEGADOR
 * =====================================
 * A planilha em CSV o site lê como texto (ver `lib/previa-planilha.ts`).
 * O `.xlsx` não é texto: é um zip com XML dentro. Este módulo o abre e
 * devolve a mesma grade (`Planilha`) que o CSV devolve, para que a janela
 * de documento (`SpreadsheetView`) e a miniatura da tabela desenhem os
 * dois formatos pelo mesmo caminho.
 *
 * Por que sem biblioteca: o navegador já traz as duas peças que faltavam
 * — `DecompressionStream` descomprime o zip e o `DOMParser` lê o XML. Uma
 * biblioteca de Excel custaria centenas de kB no pacote de uma página que
 * mostra dois documentos, e a leitura que interessa aqui é a de uma
 * exportação de sistema: uma aba, células de texto, número e data.
 *
 * O que este leitor entende, porque é o que aparece nas planilhas de
 * prestação de contas:
 *
 *   • a primeira aba do arquivo, com as colunas na posição declarada em
 *     cada célula (coluna vazia no meio continua vazia, e não some);
 *   • texto — da tabela compartilhada (`sharedStrings`), escrito na
 *     própria célula, ou resultado de fórmula;
 *   • número com o formato do arquivo: data virá data, e não 45994;
 *     "R$ 293.999,96" virá com o real e os separadores que a planilha
 *     manda escrever.
 *
 * O que ele não entende — `.xls` antigo (binário, não é zip), planilha
 * protegida por senha, navegador sem `DecompressionStream` — devolve
 * `null`, e a janela volta a oferecer o download. Nada disso derruba a
 * página.
 */

/** Assinatura de arquivo zip: `PK\x03\x04`. */
export function ehZip(bytes: ArrayBuffer): boolean {
  if (bytes.byteLength < 4) return false

  const inicio = new Uint8Array(bytes, 0, 4)
  return (
    inicio[0] === 0x50 &&
    inicio[1] === 0x4b &&
    inicio[2] === 0x03 &&
    inicio[3] === 0x04
  )
}

/* ------------------------------------------------------------------ */
/* O zip                                                               */
/* ------------------------------------------------------------------ */

type EntradaZip = { metodo: number; inicio: number; tamanho: number }

/**
 * Índice do zip, lido do diretório central (o fim do arquivo). É de lá
 * que se lê a lista de nomes sem descomprimir nada — assim o leitor
 * descomprime só as quatro partes que usa, e não o tema do Excel nem as
 * abas que ninguém vai abrir.
 */
function indexarZip(bytes: ArrayBuffer): Map<string, EntradaZip> | null {
  const vista = new DataView(bytes)
  const nomes = new TextDecoder()
  const entradas = new Map<string, EntradaZip>()

  /* O fim do diretório central tem tamanho variável (pode levar um
     comentário no rabo), então se procura a assinatura de trás para a
     frente. 22 é o tamanho do registro sem comentário. */
  let fim = -1
  for (let i = bytes.byteLength - 22; i >= 0; i -= 1) {
    if (vista.getUint32(i, true) === 0x06054b50) {
      fim = i
      break
    }
  }
  if (fim < 0) return null

  const total = vista.getUint16(fim + 10, true)
  let ponteiro = vista.getUint32(fim + 16, true)

  for (let n = 0; n < total; n += 1) {
    if (ponteiro + 46 > bytes.byteLength) return null
    if (vista.getUint32(ponteiro, true) !== 0x02014b50) return null

    const metodo = vista.getUint16(ponteiro + 10, true)
    const tamanho = vista.getUint32(ponteiro + 20, true)
    const tamanhoDoNome = vista.getUint16(ponteiro + 28, true)
    const tamanhoDoExtra = vista.getUint16(ponteiro + 30, true)
    const tamanhoDoComentario = vista.getUint16(ponteiro + 32, true)
    const cabecalhoLocal = vista.getUint32(ponteiro + 42, true)

    const nome = nomes.decode(
      new Uint8Array(bytes, ponteiro + 46, tamanhoDoNome),
    )

    /* Onde os bytes começam de fato só o cabeçalho local diz: o campo
       "extra" dele costuma ter tamanho diferente do que está aqui. */
    if (cabecalhoLocal + 30 > bytes.byteLength) return null
    const inicio =
      cabecalhoLocal +
      30 +
      vista.getUint16(cabecalhoLocal + 26, true) +
      vista.getUint16(cabecalhoLocal + 28, true)

    if (inicio + tamanho <= bytes.byteLength) {
      entradas.set(nome, { metodo, inicio, tamanho })
    }

    ponteiro += 46 + tamanhoDoNome + tamanhoDoExtra + tamanhoDoComentario
  }

  return entradas
}

/** O XML de uma parte do zip, já descomprimido. `null` quando não dá. */
async function lerParte(
  bytes: ArrayBuffer,
  entradas: Map<string, EntradaZip>,
  nome: string,
): Promise<string | null> {
  const entrada = entradas.get(nome)
  if (!entrada) return null

  const fatia = new Uint8Array(bytes, entrada.inicio, entrada.tamanho)

  /* Método 0 = guardado sem compressão; 8 = deflate, o normal no .xlsx.
     Qualquer outro é raro o bastante para não valer código. */
  if (entrada.metodo === 0) return new TextDecoder().decode(fatia)
  if (entrada.metodo !== 8) return null
  if (typeof DecompressionStream === 'undefined') return null

  const fluxo = new Blob([fatia])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'))

  return new Response(fluxo).text()
}

/* ------------------------------------------------------------------ */
/* O XML                                                               */
/* ------------------------------------------------------------------ */

const RELACOES = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'

function analisarXml(texto: string): Document | null {
  const documento = new DOMParser().parseFromString(texto, 'application/xml')
  return documento.getElementsByTagName('parsererror').length > 0
    ? null
    : documento
}

/**
 * Busca por nome local, ignorando o prefixo de namespace: o Excel escreve
 * `<row>`, e outros geradores escrevem `<x:row>` — é a mesma coisa.
 */
function filhos(no: Document | Element, nome: string): Element[] {
  return Array.from(no.getElementsByTagNameNS('*', nome))
}

/** Texto de todos os `<t>` dentro do nó, na ordem (texto rico vem em pedaços). */
function textoDe(no: Element): string {
  return filhos(no, 't')
    .map((pedaco) => pedaco.textContent ?? '')
    .join('')
}

/* ------------------------------------------------------------------ */
/* Formato dos números                                                 */
/* ------------------------------------------------------------------ */

/**
 * Os formatos que o Excel não escreve no arquivo porque todo mundo os
 * conhece de cor. Só os que mudam o que se lê na tela entram aqui — os
 * de fração e notação científica caem no número cru, que é o que a
 * planilha de repasse nunca usa.
 */
const FORMATOS_DE_FABRICA: Record<number, string> = {
  1: '0',
  2: '0.00',
  3: '#,##0',
  4: '#,##0.00',
  9: '0%',
  10: '0.00%',
  14: 'dd/mm/yyyy',
  15: 'd/mmm/yy',
  16: 'd/mmm',
  17: 'mmm/yy',
  18: 'h:mm',
  19: 'h:mm:ss',
  20: 'h:mm',
  21: 'h:mm:ss',
  22: 'dd/mm/yyyy h:mm',
  37: '#,##0',
  38: '#,##0',
  39: '#,##0.00',
  40: '#,##0.00',
  45: 'mm:ss',
  46: 'h:mm:ss',
  47: 'mm:ss',
}

/** Formato de data ou hora — tem dia, mês, ano ou hora fora das aspas. */
function ehFormatoDeTempo(codigo: string): boolean {
  const semLiterais = codigo
    .replace(/\[[^\]]*\]/g, '')
    .replace(/"[^"]*"/g, '')
    .replace(/\\./g, '')

  return /[ymdhs]/i.test(semLiterais)
}

const MESES_CURTOS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
]

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

function doisDigitos(valor: number): string {
  return String(valor).padStart(2, '0')
}

/**
 * A data escrita como a planilha manda escrever. `m` é mês, menos quando
 * vem depois de hora ou antes de segundo — aí é minuto; é a mesma regra
 * do Excel, e sem ela "h:mm" viraria hora e mês.
 */
function formatarTempo(codigo: string, data: Date): string {
  const partes = codigo.match(/(\[[^\]]*\]|"[^"]*"|\\.|y+|m+|d+|h+|s+|am\/pm|a\/p|.)/gi)
  if (!partes) return ''

  let saida = ''
  let ultimaUnidade = ''
  const doDia = /h/i.test(codigo)
  const doZeroAsDoze = /am\/pm|a\/p/i.test(codigo)

  partes.forEach((parte, indice) => {
    const chave = parte.toLowerCase()

    if (parte.startsWith('[')) return
    if (parte.startsWith('"')) {
      saida += parte.slice(1, -1)
      return
    }
    if (parte.startsWith('\\')) {
      saida += parte.slice(1)
      return
    }

    if (chave === 'am/pm' || chave === 'a/p') {
      saida += data.getUTCHours() < 12 ? 'AM' : 'PM'
      return
    }

    if (/^y+$/.test(chave)) {
      const ano = data.getUTCFullYear()
      saida += parte.length <= 2 ? doisDigitos(ano % 100) : String(ano)
      ultimaUnidade = 'y'
      return
    }

    if (/^d+$/.test(chave)) {
      saida += parte.length >= 2 ? doisDigitos(data.getUTCDate()) : String(data.getUTCDate())
      ultimaUnidade = 'd'
      return
    }

    if (/^h+$/.test(chave)) {
      const hora24 = data.getUTCHours()
      const hora = doZeroAsDoze ? hora24 % 12 || 12 : hora24
      saida += parte.length >= 2 ? doisDigitos(hora) : String(hora)
      ultimaUnidade = 'h'
      return
    }

    if (/^s+$/.test(chave)) {
      saida += doisDigitos(data.getUTCSeconds())
      ultimaUnidade = 's'
      return
    }

    if (/^m+$/.test(chave)) {
      const proxima = partes.slice(indice + 1).find((seguinte) => /^[ymdhs]+$/i.test(seguinte))
      const ehMinuto =
        ultimaUnidade === 'h' || (doDia && proxima?.toLowerCase().startsWith('s'))

      if (ehMinuto) {
        saida += doisDigitos(data.getUTCMinutes())
        ultimaUnidade = 'n'
        return
      }

      const mes = data.getUTCMonth()
      if (parte.length >= 4) saida += MESES[mes]
      else if (parte.length === 3) saida += MESES_CURTOS[mes]
      else if (parte.length === 2) saida += doisDigitos(mes + 1)
      else saida += String(mes + 1)

      ultimaUnidade = 'm'
      return
    }

    saida += parte
  })

  return saida
}

/**
 * O número escrito como a planilha manda: casas decimais, separador de
 * milhar e o que estiver entre aspas no formato (o "R$ ", em geral).
 *
 * Vai em português porque é o idioma do arquivo, e não o da tela: a
 * planilha de um termo de fomento federal escreve 293.999,96, e mudar
 * isso conforme o idioma do visitante faria a página divergir do arquivo
 * que ele acabou de baixar.
 */
function formatarNumero(codigo: string, valor: number): string {
  /* O formato tem seções separadas por `;`: positivo, negativo, zero. */
  const secoes = codigo.split(';')
  const negativo = valor < 0 && secoes.length > 1
  const secao = negativo ? secoes[1] : secoes[0]
  const numero = negativo ? Math.abs(valor) : valor

  const porcento = secao.includes('%')
  const escalado = porcento ? numero * 100 : numero

  const semLiterais = secao
    .replace(/\[[^\]]*\]/g, '')
    .replace(/"[^"]*"/g, ' ')
    .replace(/\\./g, ' ')

  const decimais = semLiterais.split('.')[1]?.match(/0/g)?.length ?? 0
  const milhar = /[#0],[#0]/.test(semLiterais)

  const escrito = escalado.toLocaleString('pt-BR', {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
    useGrouping: milhar,
  })

  /* O que vem escrito fora dos placeholders — "R$ " antes, "%" depois. */
  const marcadores = /[#0?]/
  const antes: string[] = []
  const depois: string[] = []
  let passouDoNumero = false

  const pedacos = secao.match(/(\[[^\]]*\]|"[^"]*"|\\.|[#0?.,]+|.)/g) ?? []
  for (const pedaco of pedacos) {
    if (marcadores.test(pedaco)) {
      passouDoNumero = true
      continue
    }
    if (pedaco.startsWith('[')) continue

    const texto = pedaco.startsWith('"')
      ? pedaco.slice(1, -1)
      : pedaco.startsWith('\\')
        ? pedaco.slice(1)
        : pedaco === '%'
          ? '%'
          : /^[\s+\-()$R]+$/.test(pedaco)
            ? pedaco
            : ''

    if (!texto) continue
    if (passouDoNumero) depois.push(texto)
    else antes.push(texto)
  }

  return `${antes.join('')}${escrito}${depois.join('')}`.trim()
}

/* ------------------------------------------------------------------ */
/* A planilha                                                          */
/* ------------------------------------------------------------------ */

/** `A` → 0, `B` → 1, `AA` → 26. A referência da célula diz a coluna. */
function colunaDe(referencia: string): number {
  const letras = referencia.match(/^[A-Z]+/i)?.[0]
  if (!letras) return -1

  let indice = 0
  for (const letra of letras.toUpperCase()) {
    indice = indice * 26 + (letra.charCodeAt(0) - 64)
  }
  return indice - 1
}

/**
 * O dia que o número da célula representa. A planilha guarda data como
 * dias contados de uma origem — 1899-12-30 no padrão, 1904-01-01 nos
 * arquivos salvos no Mac antigo, que o próprio arquivo declara.
 */
function dataDoSerial(serial: number, de1904: boolean): Date {
  const origem = de1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 30)
  return new Date(origem + Math.round(serial * 86400000))
}

function vazia(linha: string[]): boolean {
  return linha.every((celula) => celula.trim() === '')
}

/**
 * A grade da primeira aba do `.xlsx`, no mesmo formato que o CSV devolve.
 * `linhas` é cortada em `limiteDeLinhas`; `totalDeLinhas` continua sendo
 * o tamanho real do arquivo, para a janela poder avisar do corte.
 */
export async function lerXlsx(
  bytes: ArrayBuffer,
  limiteDeLinhas: number,
): Promise<Planilha | null> {
  const entradas = indexarZip(bytes)
  if (!entradas) return null

  const ler = (nome: string) => lerParte(bytes, entradas, nome)

  /* Qual XML é a primeira aba: o `workbook.xml` dá a ordem das abas e o
     `.rels` traduz o id da aba em caminho de arquivo. `sheet1.xml` só
     por acaso é a primeira — quem reordena as abas no Excel desfaz
     essa coincidência. */
  const livro = await ler('xl/workbook.xml')
  const relacoes = await ler('xl/_rels/workbook.xml.rels')

  const xmlDoLivro = livro ? analisarXml(livro) : null
  const de1904 = xmlDoLivro
    ? filhos(xmlDoLivro, 'workbookPr').some(
        (no) => no.getAttribute('date1904') === '1' || no.getAttribute('date1904') === 'true',
      )
    : false

  let caminhoDaAba: string | null = null
  const aba = xmlDoLivro ? filhos(xmlDoLivro, 'sheet')[0] : null
  const idDaAba = aba?.getAttributeNS(RELACOES, 'id') ?? aba?.getAttribute('r:id')

  if (idDaAba && relacoes) {
    const xmlDasRelacoes = analisarXml(relacoes)
    const relacao = xmlDasRelacoes
      ? filhos(xmlDasRelacoes, 'Relationship').find(
          (no) => no.getAttribute('Id') === idDaAba,
        )
      : null
    const destino = relacao?.getAttribute('Target') ?? null
    if (destino) {
      caminhoDaAba = destino.startsWith('/')
        ? destino.slice(1)
        : `xl/${destino.replace(/^\.\//, '')}`
    }
  }

  const textoDaAba =
    (caminhoDaAba ? await ler(caminhoDaAba) : null) ??
    (await ler('xl/worksheets/sheet1.xml'))
  if (!textoDaAba) return null

  const xmlDaAba = analisarXml(textoDaAba)
  if (!xmlDaAba) return null

  /* Tabela de textos: célula de texto guarda só o índice dela. */
  const compartilhados: string[] = []
  const textoCompartilhado = await ler('xl/sharedStrings.xml')
  if (textoCompartilhado) {
    const xml = analisarXml(textoCompartilhado)
    if (xml) {
      for (const item of filhos(xml, 'si')) compartilhados.push(textoDe(item))
    }
  }

  /* Formatos: o `s` da célula aponta para um `xf`, que aponta para o
     código do formato — é esse caminho que transforma 45994 em data. */
  const formatoPorEstilo: string[] = []
  const textoDosEstilos = await ler('xl/styles.xml')
  if (textoDosEstilos) {
    const xml = analisarXml(textoDosEstilos)
    if (xml) {
      const codigos: Record<number, string> = { ...FORMATOS_DE_FABRICA }
      for (const formato of filhos(xml, 'numFmt')) {
        const id = Number(formato.getAttribute('numFmtId'))
        const codigo = formato.getAttribute('formatCode')
        if (Number.isFinite(id) && codigo) codigos[id] = codigo
      }

      const usados = filhos(xml, 'cellXfs')[0]
      if (usados) {
        for (const xf of filhos(usados, 'xf')) {
          const id = Number(xf.getAttribute('numFmtId') ?? 0)
          formatoPorEstilo.push(codigos[id] ?? '')
        }
      }
    }
  }

  /* Estilo declarado na coluna, e não na célula: alguns geradores contam
     com ele para a coluna inteira de datas. */
  const estiloDaColuna = new Map<number, number>()
  for (const coluna of filhos(xmlDaAba, 'col')) {
    const estilo = Number(coluna.getAttribute('style'))
    if (!Number.isFinite(estilo) || !coluna.getAttribute('style')) continue

    const de = Number(coluna.getAttribute('min') ?? 0)
    const ate = Number(coluna.getAttribute('max') ?? de)
    for (let i = de; i <= ate && i - de < 1000; i += 1) {
      estiloDaColuna.set(i - 1, estilo)
    }
  }

  function escreverCelula(celula: Element, coluna: number): string {
    const tipo = celula.getAttribute('t') ?? 'n'

    if (tipo === 's') {
      const indice = Number(filhos(celula, 'v')[0]?.textContent ?? NaN)
      return compartilhados[indice] ?? ''
    }

    /* `inlineStr` guarda o texto na própria célula; `str` é resultado de
       fórmula de texto; `e` é célula em erro (#N/D e parentes). */
    if (tipo === 'inlineStr') return textoDe(celula)
    if (tipo === 'str' || tipo === 'e') {
      return filhos(celula, 'v')[0]?.textContent ?? ''
    }
    if (tipo === 'b') {
      return filhos(celula, 'v')[0]?.textContent === '1' ? 'VERDADEIRO' : 'FALSO'
    }

    const cru = filhos(celula, 'v')[0]?.textContent
    if (cru === null || cru === undefined || cru === '') return ''

    const numero = Number(cru)
    if (!Number.isFinite(numero)) return cru

    const estilo = celula.getAttribute('s')
    const indiceDoEstilo = estilo ? Number(estilo) : estiloDaColuna.get(coluna)
    const codigo =
      indiceDoEstilo !== undefined && Number.isFinite(indiceDoEstilo)
        ? (formatoPorEstilo[indiceDoEstilo] ?? '')
        : ''

    /* Sem formato declarado (o "Geral" do Excel) fica o número como está
       no arquivo: agrupar milhar por conta própria estragaria a coluna de
       número de instrumento, que é código e não valor. */
    if (!codigo || codigo === 'General' || codigo === '@') return cru

    if (ehFormatoDeTempo(codigo)) {
      return formatarTempo(codigo, dataDoSerial(numero, de1904))
    }

    return formatarNumero(codigo, numero)
  }

  /* Cada linha na posição que a célula declara: linha com coluna vazia no
     meio não pode empurrar as seguintes para a esquerda. */
  const grade: string[][] = []
  for (const linha of filhos(xmlDaAba, 'row')) {
    const celulas: string[] = []

    for (const celula of filhos(linha, 'c')) {
      const referencia = celula.getAttribute('r') ?? ''
      const coluna = colunaDe(referencia)
      const indice = coluna >= 0 ? coluna : celulas.length

      while (celulas.length < indice) celulas.push('')
      celulas[indice] = escreverCelula(celula, indice).trim()
    }

    grade.push(celulas)
  }

  const preenchidas = grade.filter((linha) => !vazia(linha))
  if (preenchidas.length === 0) return null

  const [cabecalho, ...linhas] = preenchidas
  /* A grade é retangular pela linha mais larga do arquivo: cabeçalho
     curto não pode esconder coluna com dado. */
  const colunas = preenchidas.reduce((maior, linha) => Math.max(maior, linha.length), 0)

  return {
    notas: [],
    cabecalho: Array.from({ length: colunas }, (_, i) => cabecalho[i] ?? ''),
    linhas: linhas
      .slice(0, limiteDeLinhas)
      .map((linha) => Array.from({ length: colunas }, (_, i) => linha[i] ?? '')),
    totalDeLinhas: linhas.length,
  }
}
