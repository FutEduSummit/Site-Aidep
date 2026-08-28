import { exampleContentEnabled } from '@/lib/preview'
import { exampleDocuments, exampleLastUpdatedAt } from './documents-example'
import type { DocumentCategory, InstitutionalDocument, Localized } from './types'

/**
 * TRANSPARÊNCIA
 * =============
 * Nenhum documento, relatório ou valor financeiro real foi fornecido.
 * Nada é inventado na build pública: a lista fica vazia e a página exibe o
 * estado vazio institucional, com todo o sistema de filtros, busca e
 * download pronto para receber os arquivos.
 *
 * Na build de pré-visualização entram os documentos de exemplo de
 * `documents-example.ts` — arquivos de demonstração, marcados com a
 * palavra EXEMPLO em cada página, para avaliar a lista, os filtros, a
 * busca, a visualização e o download funcionando.
 *
 * O briefing informa que a prestação de contas é preparada mensalmente. A
 * data de última atualização só é preenchida quando houver publicação real.
 *
 * Para publicar um documento:
 *   1. coloque o arquivo em `public/documentos/…`;
 *   2. acrescente um item na lista `published` abaixo;
 *   3. preencha `lastUpdatedAt` com a data da publicação.
 */

/** Documentos publicados pela associação. */
const published: InstitutionalDocument[] = []

export const documents: InstitutionalDocument[] = exampleContentEnabled
  ? [...published, ...exampleDocuments]
  : published

/** Data da última publicação real — `null` enquanto não houver nenhuma. */
const publishedAt: string | null = null

export const lastUpdatedAt: string | null = exampleContentEnabled
  ? (publishedAt ?? exampleLastUpdatedAt)
  : publishedAt

export const documentCategories: {
  id: DocumentCategory
  label: Localized
}[] = [
  {
    id: 'reports',
    label: { pt: 'Relatórios', en: 'Reports', es: 'Informes' },
  },
  {
    id: 'institutional',
    label: {
      pt: 'Documentos institucionais',
      en: 'Institutional documents',
      es: 'Documentos institucionales',
    },
  },
  {
    id: 'accountability',
    label: {
      pt: 'Prestação de contas',
      en: 'Accountability',
      es: 'Rendición de cuentas',
    },
  },
  {
    id: 'projects',
    label: {
      pt: 'Documentos de projetos',
      en: 'Project documents',
      es: 'Documentos de proyectos',
    },
  },
]

/** Anos disponíveis, derivados dos documentos publicados. */
export function getDocumentYears(): number[] {
  return [...new Set(documents.map((doc) => doc.year))].sort((a, b) => b - a)
}
