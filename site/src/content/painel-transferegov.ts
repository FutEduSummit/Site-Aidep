import { lerPainel } from '@/lib/cms/leitura'
import type { TransparencyPanelCapture } from './types'

/**
 * PAINEL DISCRICIONÁRIAS E LEGAIS — A CAPTURA
 * ===========================================
 * A tela do painel público do Governo Federal como ela está no ar. É o que
 * a página de Transparência mostra logo na abertura (ver
 * `TransparencyPanel`): o visitante vê os números do repasse sem baixar
 * arquivo e sem sair do site.
 *
 * QUEM ATUALIZA É A ASSOCIAÇÃO
 * ----------------------------
 * A fonte da verdade é o painel do cliente
 * (`/admin/documentos/painel`): a imagem vai para o Storage do Supabase e
 * a linha para a tabela `painel_transparencia`. A tela envelhece a cada
 * repasse, e trocá-la não pode depender de alguém mexer no código.
 *
 * Enquanto essa tabela estiver vazia — ou se o Supabase estiver fora do ar
 * — vale a captura abaixo, versionada junto com o site: a primeira,
 * entregue pela associação.
 *
 * O QUE ESTÁ NELA
 * ---------------
 * O Transferegov (antigo SICONV) é o sistema em que a União registra toda
 * transferência a organização da sociedade civil, e "Discricionárias e
 * Legais" é a vista pública desse registro. A captura mostra o resumo da
 * AIDEP: 4 propostas apresentadas e 4 aprovadas, 4 instrumentos
 * assinados, R$ 6,27 milhões de valor global, o mesmo valor já liberado,
 * R$ 1,12 milhão em conta e nada devolvido.
 *
 * POR QUE UMA IMAGEM, E NÃO O PDF EMBUTIDO
 * ----------------------------------------
 * O extrato em PDF continua publicado na lista de documentos abaixo, com
 * prévia e download (ver `documents-real.ts`). Aqui em cima o que
 * interessa é a tela aparecer de imediato — sem leitor de PDF, sem páginas
 * para virar, sem pedir download a quem só quer conferir os números.
 *
 * A MEDIDA É A DO ARQUIVO
 * -----------------------
 * `width` e `height` são os pixels reais do PNG. É com eles que o
 * `next/image` reserva a moldura antes de a imagem chegar — errar aqui faz
 * a página saltar durante o carregamento.
 *
 * Esta imagem NÃO passa pelo registro de `media.ts` de propósito: lá,
 * chave sem arquivo cai numa fotografia de banco equivalente, e foto de
 * banco no lugar de um painel do Governo Federal seria dado inventado.
 */
const capturaEntregue: TransparencyPanelCapture = {
  image: {
    src: '/images/transparencia/painel-discricionarias-legais.png',
    width: 3183,
    height: 2900,
    alt: {
      pt: 'Tela do painel Discricionárias e Legais do Transferegov com o resumo da AIDEP: 4 propostas apresentadas e 100% aprovadas, 4 instrumentos assinados, R$ 6,27 milhões de valor global, R$ 6,27 milhões liberados, R$ 1,12 milhão de saldo em conta e nenhum valor devolvido.',
      en: 'Screen of the Brazilian government’s Discricionárias e Legais dashboard showing AIDEP’s summary: 4 proposals submitted and 100% approved, 4 signed agreements, R$ 6.27 million in total value, R$ 6.27 million released, R$ 1.12 million in account and nothing returned.',
      es: 'Pantalla del panel Discricionárias e Legais de Transferegov con el resumen de AIDEP: 4 propuestas presentadas y 100 % aprobadas, 4 instrumentos firmados, R$ 6,27 millones de valor global, R$ 6,27 millones liberados, R$ 1,12 millones de saldo en cuenta y ningún valor devuelto.',
    },
  },
  /** Data impressa no cabeçalho do painel: "Atualizado em 09/09/2026". */
  capturedAt: '2026-09-09',
}

/**
 * A captura que está no ar: a enviada pelo painel do cliente e, enquanto
 * não houver nenhuma, a entregue com o site.
 */
export async function getPainelTransparencia(): Promise<TransparencyPanelCapture> {
  const doPainel = await lerPainel()
  return doPainel ?? capturaEntregue
}
