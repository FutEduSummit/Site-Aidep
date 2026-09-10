import { FileImage, FileText, Table2 } from 'lucide-react'
import Image from 'next/image'
import type { DocumentFormat, InstitutionalDocument } from '@/content/types'
import { cn } from '@/lib/utils'

/**
 * FORMATO DO ARQUIVO
 * ==================
 * Como cada formato se apresenta, num só lugar: a tabela de Transparência,
 * o cartão do celular e a moldura da prévia precisam concordar sobre qual
 * desenho representa uma planilha.
 *
 * Na tabela isso resolve uma dúvida prática: relatório em PDF abre e se lê
 * dentro da página; planilha abre como grade de números (ver
 * `SpreadsheetView`). Quem procura os valores de um repasse enxerga na
 * lista qual linha leva a qual, sem abrir uma por uma.
 *
 * Duas famílias de desenho convivem aqui de propósito:
 *
 *   • `artesDeFormato` — o ícone colorido de PDF, CSV e XLSX, que o
 *     visitante reconhece de longe. É o que a lista mostra.
 *   • `iconesDeFormato` — o ícone de traço, monocromático. Vale para os
 *     formatos sem arte e, sobretudo, dentro da moldura da prévia (ver
 *     `DocumentPreview`), onde ele significa "sem primeira página para
 *     mostrar" e não pode competir com as prévias reais ao lado.
 */
/*
 * A planilha leva grade, e não folha com marcas dentro: no tamanho em que
 * o ícone de traço aparece, folha-com-marcas e folha-de-texto ficam
 * indistinguíveis. A grade se reconhece de longe.
 */
export const iconesDeFormato: Record<DocumentFormat, typeof FileText> = {
  pdf: FileText,
  xlsx: Table2,
  csv: Table2,
  doc: FileText,
  docx: FileText,
  imagem: FileImage,
  outro: FileText,
}

/**
 * A ARTE OFICIAL DE CADA FORMATO
 * ==============================
 * PDF, CSV e XLSX têm ícone próprio, colorido, em
 * `public/images/formatos`. Onde existe arte, ela substitui o par
 * ícone-de-traço + sigla: o vermelho do PDF e a grade verde das duas
 * planilhas se reconhecem antes da leitura, e a sigla escrita virava
 * informação repetida ao lado deles.
 *
 * Formato sem arte continua no par ícone + sigla — é o caminho de
 * `DocumentFormatBadge` para DOC, DOCX, imagem e "outro".
 *
 * As artes de PDF e CSV chegaram como quadrados com margem transparente
 * em volta, cada uma com sobra diferente — no mesmo tamanho de tela, o
 * PDF saía um quinto menor que o CSV. Os arquivos aqui estão recortados
 * na margem e reduzidos a 256 px de altura, então `h-*` mede o desenho em
 * si e as artes têm o mesmo peso na lista.
 *
 * A de XLSX é a mesma folha da de CSV com a etiqueta trocada: as duas
 * abrem como grade no site e precisam se parecer na lista, mudando só a
 * sigla — que é a única diferença que importa a quem vai baixar o arquivo.
 *
 * A medida real do arquivo entra aqui porque o `next/image` precisa da
 * proporção para reservar o espaço antes de a imagem chegar.
 */
const artesDeFormato: Partial<
  Record<DocumentFormat, { src: string; width: number; height: number }>
> = {
  pdf: { src: '/images/formatos/pdf.png', width: 195, height: 256 },
  csv: { src: '/images/formatos/csv.png', width: 240, height: 256 },
  xlsx: { src: '/images/formatos/xlsx.png', width: 240, height: 256 },
}

/**
 * A sigla que aparece ao lado do ícone.
 *
 * `imagem` e `outro` são categorias internas, e não o que está escrito no
 * arquivo: nesses dois a extensão diz mais ao visitante (JPG, WEBP, ZIP)
 * e, sendo sigla, serve aos três idiomas sem tradução.
 */
export function rotuloDeFormato(doc: InstitutionalDocument): string {
  if (doc.format === 'imagem' || doc.format === 'outro') {
    const extensao = (doc.fileName ?? doc.file).split('?')[0].split('.').pop()
    if (extensao && /^[a-z0-9]{2,5}$/i.test(extensao)) {
      return extensao.toUpperCase()
    }
  }

  return doc.format.toUpperCase()
}

/**
 * O formato do arquivo: a arte colorida onde ela existe (PDF, CSV), o par
 * ícone + sigla no resto.
 *
 * O `alt` da imagem é a própria sigla, e não texto decorativo: trocar a
 * palavra por um desenho não pode custar a informação a quem navega por
 * leitor de tela.
 */
export function DocumentFormatBadge({
  doc,
  className,
}: {
  doc: InstitutionalDocument
  className?: string
}) {
  const sigla = rotuloDeFormato(doc)
  const arte = artesDeFormato[doc.format]

  if (arte) {
    return (
      <Image
        src={arte.src}
        alt={sigla}
        width={arte.width}
        height={arte.height}
        sizes="28px"
        className={cn('h-7 w-auto shrink-0', className)}
      />
    )
  }

  const Icone = iconesDeFormato[doc.format] ?? FileText

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap text-micro uppercase tracking-[0.14em] text-(--fg-subtle)',
        className,
      )}
    >
      <Icone aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
      {sigla}
    </span>
  )
}
