import { z } from 'zod'

/**
 * O QUE O PAINEL PODE ENVIAR
 * ==========================
 * Os formulários do painel são componentes de cliente: o que chega na
 * Server Action é JSON vindo do navegador e não pode ser tratado como
 * confiável, mesmo com o cliente logado. Estes esquemas são a fronteira —
 * abaixo deles, todo dado já está no formato certo.
 *
 * O mesmo arquivo roda nos dois lados: o formulário valida antes de enviar,
 * para mostrar o erro no campo, e a ação valida de novo antes de gravar.
 */

/** Texto nos três idiomas. Só o português é obrigatório. */
const traduzido = z.object({
  pt: z.string().trim().default(''),
  en: z.string().trim().default(''),
  es: z.string().trim().default(''),
})

const traduzidoObrigatorio = traduzido.extend({
  pt: z.string().trim().min(1, 'Preencha o português.'),
})

const listaTraduzida = z.object({
  pt: z.array(z.string()).default([]),
  en: z.array(z.string()).default([]),
  es: z.array(z.string()).default([]),
})

/** Endereço de arquivo já enviado ao Storage. */
const urlDeArquivo = z.string().trim().url('Endereço de arquivo inválido.')

const dataIso = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use uma data no formato AAAA-MM-DD.')

const slug = z
  .string()
  .trim()
  .min(2, 'O endereço precisa de pelo menos 2 caracteres.')
  .max(90, 'Endereço muito longo.')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use apenas letras minúsculas sem acento, números e hífen.',
  )

/* ------------------------------------------------------------------ */
/* Imagem enviada pelo painel                                         */
/* ------------------------------------------------------------------ */

export const imagemEnviada = z.object({
  url: urlDeArquivo,
  /** Caminho dentro do bucket — guardado para poder apagar depois. */
  path: z.string().trim().default(''),
  largura: z.number().int().positive().default(1600),
  altura: z.number().int().positive().default(900),
})

export type ImagemEnviada = z.infer<typeof imagemEnviada>

/* ------------------------------------------------------------------ */
/* Categoria de documento                                             */
/* ------------------------------------------------------------------ */

export const cores = [
  'verde',
  'azul',
  'ambar',
  'roxo',
  'cinza',
  'vermelho',
] as const

export const categoriaSchema = z.object({
  id: slug,
  rotulo: traduzidoObrigatorio,
  cor: z.enum(cores).default('cinza'),
  ordem: z.number().int().min(0).max(999).default(0),
})

export type CategoriaPayload = z.infer<typeof categoriaSchema>

/* ------------------------------------------------------------------ */
/* Documento de transparência                                         */
/* ------------------------------------------------------------------ */

export const formatos = [
  'pdf',
  'xlsx',
  'csv',
  'doc',
  'docx',
  'imagem',
  'outro',
] as const

export const documentoSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: traduzidoObrigatorio,
  /** A coluna "Conteúdo" da tabela: o que o documento traz, em uma frase. */
  conteudo: traduzido.default({ pt: '', en: '', es: '' }),
  categoriaId: z.string().trim().min(1, 'Escolha uma categoria.'),
  ano: z
    .number()
    .int()
    .min(1990, 'Ano fora do intervalo.')
    .max(2200, 'Ano fora do intervalo.'),
  publicadoEm: dataIso,
  arquivoUrl: urlDeArquivo,
  arquivoPath: z.string().trim().default(''),
  arquivoNome: z.string().trim().default(''),
  formato: z.enum(formatos).default('pdf'),
  tamanhoBytes: z.number().int().nonnegative().nullable().default(null),
  miniatura: imagemEnviada.nullable().default(null),
  projetoSlug: z.string().trim().default(''),
  publicado: z.boolean().default(true),
})

export type DocumentoPayload = z.infer<typeof documentoSchema>

/* ------------------------------------------------------------------ */
/* Notícia                                                            */
/* ------------------------------------------------------------------ */

export const blocoSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('paragraph'), text: z.string().trim().min(1) }),
  z.object({ type: z.literal('heading'), text: z.string().trim().min(1) }),
  z.object({
    type: z.literal('list'),
    items: z.array(z.string().trim().min(1)).min(1),
  }),
  z.object({
    type: z.literal('quote'),
    text: z.string().trim().min(1),
    cite: z.string().trim().default(''),
  }),
])

export type BlocoPayload = z.infer<typeof blocoSchema>

const corpoSchema = z.object({
  pt: z.array(blocoSchema).default([]),
  en: z.array(blocoSchema).default([]),
  es: z.array(blocoSchema).default([]),
})

export const noticiaSchema = z.object({
  id: z.string().uuid().optional(),
  slug,
  titulo: traduzidoObrigatorio,
  resumo: traduzidoObrigatorio,
  categoria: traduzidoObrigatorio,
  corpo: corpoSchema.default({ pt: [], en: [], es: [] }),
  data: dataIso,
  autor: z.string().trim().default(''),
  capa: imagemEnviada.nullable().default(null),
  capaAlt: traduzido.default({ pt: '', en: '', es: '' }),
  projetosRelacionados: z.array(z.string().trim()).default([]),
  publicado: z.boolean().default(false),
})

export type NoticiaPayload = z.infer<typeof noticiaSchema>

/* ------------------------------------------------------------------ */
/* Projeto                                                            */
/* ------------------------------------------------------------------ */

const localSchema = z.object({
  cidade: traduzidoObrigatorio,
  regiao: z.string().trim().default(''),
  local: z.string().trim().default(''),
})

const metricaSchema = z.object({
  id: z.string().trim().default(''),
  valor: z.number().int().min(0, 'O número não pode ser negativo.'),
  prefixo: z.string().trim().default(''),
  sufixo: traduzido.default({ pt: '', en: '', es: '' }),
  rotulo: traduzidoObrigatorio,
})

const passoSchema = z.object({
  titulo: traduzidoObrigatorio,
  texto: traduzidoObrigatorio,
})

const fotoSchema = imagemEnviada.extend({
  alt: traduzido.default({ pt: '', en: '', es: '' }),
})

export const projetoSchema = z.object({
  id: z.string().uuid().optional(),
  slug,
  /** Nome próprio — não se traduz. */
  nome: z.string().trim().min(2, 'Informe o nome do projeto.'),
  categoria: traduzidoObrigatorio,
  resumo: traduzidoObrigatorio,
  descricao: listaTraduzida.default({ pt: [], en: [], es: [] }),
  objetivo: traduzido.default({ pt: '', en: '', es: '' }),
  publico: listaTraduzida.default({ pt: [], en: [], es: [] }),
  locais: z.array(localSchema).default([]),
  metricas: z.array(metricaSchema).default([]),
  metodologia: z.array(passoSchema).default([]),
  resultados: listaTraduzida.default({ pt: [], en: [], es: [] }),
  galeria: z.array(fotoSchema).default([]),
  capa: imagemEnviada.nullable().default(null),
  capaAlt: traduzido.default({ pt: '', en: '', es: '' }),
  ordem: z.number().int().min(0).max(999).default(0),
  publicado: z.boolean().default(true),
})

export type ProjetoPayload = z.infer<typeof projetoSchema>

/* ------------------------------------------------------------------ */
/* Resposta das ações                                                 */
/* ------------------------------------------------------------------ */

export type Resultado =
  | { ok: true; id: string; slug?: string }
  | { ok: false; erro: string; campos?: Record<string, string> }

/** Traduz o relatório do zod para o mapa `campo → mensagem` do formulário. */
export function camposComErro(erro: z.ZodError): Record<string, string> {
  const mapa: Record<string, string> = {}

  for (const problema of erro.issues) {
    const caminho = problema.path.join('.')
    if (!mapa[caminho]) mapa[caminho] = problema.message
  }

  return mapa
}

/** Sugere um endereço a partir do título: "Notícia da AIDEP" → "noticia-da-aidep". */
export function sugerirSlug(texto: string): string {
  return texto
    .normalize('NFD')
    /* NFD separa a letra do acento; aqui caem os acentos soltos. */
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
