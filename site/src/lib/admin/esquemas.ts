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

/**
 * Endereço de arquivo já publicado.
 *
 * Normalmente é a URL do Storage, devolvida pelo envio. Mas há conteúdo no
 * banco cujo arquivo está versionado em `public/` e chegou por script —
 * os documentos reais da Transparência, por exemplo, com endereço
 * `/documentos/reais/…`. Exigir URL absoluta aqui fazia o painel recusar
 * de salvar um documento que ele mesmo lista: o cliente abria, mudava o
 * título e levava "Endereço de arquivo inválido" num campo que nem
 * aparece na tela. Caminho a partir da raiz do site vale, portanto —
 * `//` fora, que é URL sem protocolo, não caminho.
 */
const urlDeArquivo = z
  .string()
  .trim()
  .refine(
    (valor) =>
      /^https?:\/\/\S+$/i.test(valor) || /^\/(?!\/)\S*$/.test(valor),
    'Endereço de arquivo inválido.',
  )

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
/* Captura do painel Discricionárias e Legais                         */
/* ------------------------------------------------------------------ */

/**
 * A tela do painel do Governo Federal que abre a página de Transparência.
 *
 * `capturadoEm` é a data impressa no cabeçalho do painel do governo, e
 * não a data do envio — é ela que a faixa verde do site anuncia, e por
 * isso é obrigatória: publicar um número de repasse sem dizer de quando
 * ele é seria apresentar como atual algo que pode ter mudado.
 *
 * `alt` é opcional. Vazio, o site usa a descrição genérica da tela (ver
 * `paraPainel` em `lib/cms/mapear.ts`) — o painel não sabe quais números
 * estão na imagem que acabou de subir, e não vai inventá-los.
 */
export const painelSchema = z.object({
  imagem: imagemEnviada,
  capturadoEm: dataIso,
  alt: traduzido.default({ pt: '', en: '', es: '' }),
})

export type PainelPayload = z.infer<typeof painelSchema>

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

/**
 * Um local de atuação.
 *
 * `cidade`, `regiao`, `local` e `polos` são o que o painel edita. `uf` e
 * `coords` **atravessam** o formulário sem aparecer nele: são o que
 * resolve o que o cadastro do IBGE não tem — as sete regiões
 * administrativas do Distrito Federal, por exemplo, que não são
 * municípios e por isso vêm com coordenada à mão em
 * `content/projects.ts`. Sem esta passagem, salvar o projeto pelo painel
 * apagaria a coordenada e sete pontos sumiriam do mapa.
 */
const localSchema = z.object({
  cidade: traduzidoObrigatorio,
  regiao: z.string().trim().default(''),
  local: z.string().trim().default(''),
  /** Quantos polos o projeto mantém nesta cidade. 0 e 1 valem o mesmo. */
  polos: z.number().int().min(0).max(999).default(0),
  uf: z.string().trim().max(40).default(''),
  coords: z
    .object({ lat: z.number(), lng: z.number() })
    .nullable()
    .default(null),
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

/* ------------------------------------------------------------------ */
/* Senha                                                              */
/* ------------------------------------------------------------------ */

/**
 * Tamanho mínimo da senha do painel — o mesmo número que o formulário
 * cobra antes de enviar, que a ação confere antes de gravar e que
 * `scripts/criar-admin.mjs` exige no terminal.
 *
 * O Supabase tem o próprio mínimo (Authentication → Policies). Se o do
 * projeto for maior, é ele que manda: a mensagem de recusa dele chega ao
 * formulário como está.
 */
export const SENHA_MINIMA = 8
