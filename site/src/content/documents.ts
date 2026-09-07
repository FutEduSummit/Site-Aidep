import { lerCategorias, lerDocumentos } from '@/lib/cms/leitura'
import { exampleContentEnabled } from '@/lib/example-content'
import { exampleDocuments, exampleLastUpdatedAt } from './documents-example'
import type { DocumentCategoryEntry, InstitutionalDocument } from './types'

/**
 * TRANSPARÊNCIA
 * =============
 * A fonte da verdade é o painel do cliente (`/admin/documentos`): o PDF vai
 * para o Storage do Supabase e a linha para a tabela `documentos`.
 *
 * Enquanto essa tabela estiver vazia — ou se o Supabase estiver fora do ar
 * — valem os documentos abaixo: os cadastrados à mão em `publicados` e,
 * com o conteúdo de exemplo ligado (o padrão), os de demonstração de
 * `documents-example.ts`, cada um marcado com a palavra EXEMPLO na página.
 *
 * Com `NEXT_PUBLIC_EXAMPLE_CONTENT=0` e a tabela vazia, a página de
 * Transparência exibe o estado vazio institucional, com filtros, busca,
 * visualização e download prontos para receber os arquivos reais.
 */

/** Documentos cadastrados diretamente no código. Normalmente vazio. */
const publicados: InstitutionalDocument[] = []

const reserva: InstitutionalDocument[] = exampleContentEnabled
  ? [...publicados, ...exampleDocuments]
  : publicados

/**
 * Categorias usadas quando o Supabase ainda não respondeu. Espelham as que
 * a migração cadastra — no painel, o cliente renomeia, recolore e cria as
 * dele em `/admin/documentos/categorias`.
 */
export const documentCategories: DocumentCategoryEntry[] = [
  {
    id: 'painel',
    label: { pt: 'Painel', en: 'Dashboard', es: 'Panel' },
    color: 'verde',
  },
  {
    id: 'accountability',
    label: {
      pt: 'Prestação de contas',
      en: 'Accountability',
      es: 'Rendición de cuentas',
    },
    color: 'azul',
  },
  {
    id: 'reports',
    label: { pt: 'Relatórios', en: 'Reports', es: 'Informes' },
    color: 'ambar',
  },
  {
    id: 'institutional',
    label: {
      pt: 'Documentos institucionais',
      en: 'Institutional documents',
      es: 'Documentos institucionales',
    },
    color: 'roxo',
  },
  {
    id: 'projects',
    label: {
      pt: 'Documentos de projetos',
      en: 'Project documents',
      es: 'Documentos de proyectos',
    },
    color: 'cinza',
  },
]

export async function getDocuments(): Promise<InstitutionalDocument[]> {
  const doPainel = await lerDocumentos()
  const todos = doPainel ?? reserva

  return [...todos].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export async function getDocumentCategories(): Promise<DocumentCategoryEntry[]> {
  const doPainel = await lerCategorias()
  return doPainel ?? documentCategories
}

/** Anos disponíveis, derivados da lista que está no ar. */
export function getDocumentYears(documents: InstitutionalDocument[]): number[] {
  return [...new Set(documents.map((doc) => doc.year))].sort((a, b) => b - a)
}

/**
 * Data da publicação mais recente — é o que a página anuncia como "última
 * atualização". `null` enquanto não houver documento nenhum, e nesse caso
 * a página diz que a atualização está pendente em vez de inventar data.
 */
export function getLastUpdatedAt(
  documents: InstitutionalDocument[],
): string | null {
  if (documents.length === 0) {
    return exampleContentEnabled ? exampleLastUpdatedAt : null
  }

  return documents.reduce(
    (maisRecente, doc) =>
      doc.publishedAt > maisRecente ? doc.publishedAt : maisRecente,
    documents[0].publishedAt,
  )
}
