import type { InstitutionalDocument } from './types'

/**
 * TRANSPARÊNCIA — DOCUMENTOS REAIS
 * ================================
 * Os dois primeiros documentos oficiais da AIDEP publicados na página de
 * Transparência. Diferente de `documents-example.ts`, aqui **não há nada
 * de demonstração**: os dois arquivos vieram da associação e são o
 * extrato do painel público do Governo Federal.
 *
 * O QUE ELES SÃO
 * --------------
 * O Transferegov (antigo SICONV) é o sistema em que a União registra toda
 * transferência a organização da sociedade civil. O painel
 * "Discricionárias e Legais" é a vista pública desse registro, e o extrato
 * da AIDEP mostra quatro termos de fomento com o Ministério do Esporte:
 *
 *   nº 975578  R$ 4.900.000,00  implantação de 14 núcleos de futebol
 *   nº 975579  R$   588.000,00  implantação de 2 núcleos de futebol
 *   nº 993281  R$   490.000,00  implantação de 2 núcleos de futebol e futsal
 *   nº 982451  R$   293.999,96  Iniciação ao Futsal no Paraná
 *                               ────────────────
 *                               R$ 6.271.999,96
 *
 * Os quatro estão em execução, e o painel informa R$ 1,12 milhão ainda em
 * conta e nada devolvido. O extrato é de 1º de setembro de 2026 — a data
 * impressa no cabeçalho do próprio painel, que é o que vale como data de
 * publicação aqui.
 *
 * O PDF é o painel inteiro, com os gráficos; a planilha é a mesma
 * informação linha a linha, e é ela que a página de Transparência abre em
 * tabela sem exigir download (ver `lib/previa-planilha.ts`).
 *
 * DE ONDE VÊM OS ARQUIVOS
 * -----------------------
 * Ficam em `public/documentos/reais/`, versionados junto com o site. Não
 * passam pelo Storage do Supabase porque não foram enviados pelo painel:
 * chegaram prontos e não mudam. Documento que o cliente subir depois pelo
 * `/admin/documentos` continua indo para o Storage, como sempre.
 *
 * Para publicá-los no banco (que é de onde o site lê quando a tabela tem
 * linhas): `npm run documentos:publicar`.
 */

/** Data impressa no cabeçalho do painel: "Atualizado em 01/09/2026". */
const EXTRAIDO_EM = '2026-09-01'

export const realDocuments: InstitutionalDocument[] = [
  {
    id: 'transferegov-painel-2026-09',
    title: {
      pt: 'Transferências federais — painel do Transferegov',
      en: 'Federal transfers — Transferegov dashboard',
      es: 'Transferencias federales — panel de Transferegov',
    },
    description: {
      pt: 'Extrato do painel público do Governo Federal com os quatro termos de fomento firmados pela AIDEP com o Ministério do Esporte: R$ 6,27 milhões em valor global, o mesmo valor já liberado e R$ 1,12 milhão em conta. Nada devolvido.',
      en: 'Extract from the Brazilian government’s public dashboard listing the four funding agreements AIDEP holds with the Ministry of Sport: R$ 6.27 million in total value, the same amount already released and R$ 1.12 million still in account. Nothing returned.',
      es: 'Extracto del panel público del Gobierno Federal con los cuatro convenios de fomento firmados por AIDEP con el Ministerio del Deporte: R$ 6,27 millones de valor global, el mismo monto ya liberado y R$ 1,12 millones en cuenta. Nada devuelto.',
    },
    category: 'painel',
    year: 2026,
    publishedAt: EXTRAIDO_EM,
    file: '/documentos/reais/transferegov-instrumentos-aidep.pdf',
    fileName: 'aidep-transferegov-painel-2026-09.pdf',
    format: 'pdf',
    sizeLabel: '745 kB',
  },
  {
    id: 'transferegov-instrumentos-2026-09',
    title: {
      pt: 'Instrumentos assinados — planilha detalhada',
      en: 'Signed agreements — detailed spreadsheet',
      es: 'Instrumentos firmados — planilla detallada',
    },
    description: {
      pt: 'Os mesmos quatro termos de fomento, linha a linha: número do instrumento, objeto, órgão concedente, vigência, valor global, valor empenhado, valor liberado, movimentações e saldo em conta.',
      en: 'The same four agreements, row by row: agreement number, purpose, granting body, term, total value, committed and released amounts, transactions and balance.',
      es: 'Los mismos cuatro convenios, línea por línea: número del instrumento, objeto, órgano concedente, vigencia, valor global, valor comprometido, valor liberado, movimientos y saldo en cuenta.',
    },
    category: 'accountability',
    year: 2026,
    publishedAt: EXTRAIDO_EM,
    file: '/documentos/reais/transferegov-instrumentos-aidep.xlsx',
    fileName: 'aidep-transferegov-instrumentos-2026-09.xlsx',
    format: 'xlsx',
    sizeLabel: '7 kB',
  },
]
