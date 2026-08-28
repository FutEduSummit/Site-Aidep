import type { InstitutionalDocument } from './types'

/**
 * DOCUMENTOS DE EXEMPLO — ARQUIVO GERADO
 * ======================================
 * NÃO EDITE À MÃO. Gere de novo com:
 *
 *     npm run docs:example
 *
 * A lista e o texto dos arquivos moram em `scripts/lib/example-documents.mjs`.
 *
 * São documentos de DEMONSTRAÇÃO: conteúdo fictício, cada página marcada
 * com a palavra EXEMPLO. Não são documentos oficiais da AIDEP e não valem
 * como prestação de contas.
 *
 * Estão na página de Transparência enquanto o conteúdo de exemplo
 * estiver ligado — o padrão, ver `lib/example-content.ts`. Com
 * `NEXT_PUBLIC_EXAMPLE_CONTENT=0` a lista volta a ser vazia e a página
 * exibe o estado vazio institucional.
 */
export const exampleDocuments: InstitutionalDocument[] = [
  {
    id: "relatorio-atividades-2025",
    title: {
      pt: "Relatório anual de atividades 2025",
      en: "2025 annual activities report",
      es: "Informe anual de actividades 2025",
    },
    category: "reports",
    year: 2025,
    publishedAt: "2026-03-18",
    file: "/documentos/exemplo/relatorio-anual-atividades-2025.pdf",
    format: "pdf",
    sizeLabel: "4 kB",
  },
  {
    id: "relatorio-atividades-2024",
    title: {
      pt: "Relatório anual de atividades 2024",
      en: "2024 annual activities report",
      es: "Informe anual de actividades 2024",
    },
    category: "reports",
    year: 2024,
    publishedAt: "2025-03-25",
    file: "/documentos/exemplo/relatorio-anual-atividades-2024.pdf",
    format: "pdf",
    sizeLabel: "4 kB",
  },
  {
    id: "estatuto-social",
    title: {
      pt: "Estatuto social",
      en: "Articles of association",
      es: "Estatuto social",
    },
    category: "institutional",
    year: 2024,
    publishedAt: "2025-01-15",
    file: "/documentos/exemplo/estatuto-social.pdf",
    format: "pdf",
    sizeLabel: "4 kB",
  },
  {
    id: "ata-eleicao-diretoria",
    title: {
      pt: "Ata de eleição da diretoria (2025–2028)",
      en: "Minutes of the board election (2025–2028)",
      es: "Acta de elección de la directiva (2025–2028)",
    },
    category: "institutional",
    year: 2025,
    publishedAt: "2025-02-10",
    file: "/documentos/exemplo/ata-eleicao-diretoria-2025-2028.pdf",
    format: "pdf",
    sizeLabel: "4 kB",
  },
  {
    id: "certidao-regularidade",
    title: {
      pt: "Certidão de regularidade",
      en: "Certificate of good standing",
      es: "Certificado de regularidad",
    },
    category: "institutional",
    year: 2026,
    publishedAt: "2026-07-02",
    file: "/documentos/exemplo/certidao-regularidade.pdf",
    format: "pdf",
    sizeLabel: "3 kB",
  },
  {
    id: "prestacao-contas-1s-2026",
    title: {
      pt: "Prestação de contas — 1º semestre de 2026",
      en: "Accountability report — first half of 2026",
      es: "Rendición de cuentas — primer semestre de 2026",
    },
    category: "accountability",
    year: 2026,
    publishedAt: "2026-08-10",
    file: "/documentos/exemplo/prestacao-de-contas-1o-semestre-2026.pdf",
    format: "pdf",
    sizeLabel: "4 kB",
  },
  {
    id: "prestacao-contas-2s-2025",
    title: {
      pt: "Prestação de contas — 2º semestre de 2025",
      en: "Accountability report — second half of 2025",
      es: "Rendición de cuentas — segundo semestre de 2025",
    },
    category: "accountability",
    year: 2025,
    publishedAt: "2026-02-12",
    file: "/documentos/exemplo/prestacao-de-contas-2o-semestre-2025.pdf",
    format: "pdf",
    sizeLabel: "4 kB",
  },
  {
    id: "demonstracoes-contabeis-2025",
    title: {
      pt: "Demonstrações contábeis 2025",
      en: "2025 financial statements",
      es: "Estados contables 2025",
    },
    category: "accountability",
    year: 2025,
    publishedAt: "2026-04-08",
    file: "/documentos/exemplo/demonstracoes-contabeis-2025.pdf",
    format: "pdf",
    sizeLabel: "3 kB",
  },
  {
    id: "planilha-repasses-2026",
    title: {
      pt: "Repasses por projeto — 2026 (planilha)",
      en: "Transfers by project — 2026 (spreadsheet)",
      es: "Transferencias por proyecto — 2026 (planilla)",
    },
    category: "accountability",
    year: 2026,
    publishedAt: "2026-08-10",
    file: "/documentos/exemplo/repasses-por-projeto-2026.csv",
    format: "csv",
    sizeLabel: "1 kB",
  },
  {
    id: "relatorio-coracao-valente-2025",
    title: {
      pt: "Relatório do projeto Coração Valente 2025",
      en: "2025 report — Coração Valente project",
      es: "Informe del proyecto Coração Valente 2025",
    },
    category: "projects",
    year: 2025,
    publishedAt: "2026-03-18",
    file: "/documentos/exemplo/relatorio-projeto-coracao-valente-2025.pdf",
    format: "pdf",
    sizeLabel: "4 kB",
    projectSlug: "coracao-valente",
  },
  {
    id: "relatorio-futsal-na-escola-2025",
    title: {
      pt: "Relatório do projeto Futsal na Escola 2025",
      en: "2025 report — Futsal na Escola project",
      es: "Informe del proyecto Futsal na Escola 2025",
    },
    category: "projects",
    year: 2025,
    publishedAt: "2026-03-18",
    file: "/documentos/exemplo/relatorio-projeto-futsal-na-escola-2025.pdf",
    format: "pdf",
    sizeLabel: "3 kB",
    projectSlug: "futsal-na-escola",
  },
  {
    id: "relatorio-futedu-summit-2026",
    title: {
      pt: "Relatório do FutEdu Summit 2026",
      en: "2026 FutEdu Summit report",
      es: "Informe del FutEdu Summit 2026",
    },
    category: "projects",
    year: 2026,
    publishedAt: "2026-07-30",
    file: "/documentos/exemplo/relatorio-futedu-summit-2026.pdf",
    format: "pdf",
    sizeLabel: "3 kB",
    projectSlug: "futedu-summit",
  },
]

/** Data da última publicação do conjunto de exemplo. */
export const exampleLastUpdatedAt = "2026-08-10"
