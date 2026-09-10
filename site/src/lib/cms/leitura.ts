import 'server-only'

import type {
  DocumentCategoryEntry,
  InstitutionalDocument,
  NewsArticle,
  Project,
  TransparencyPanelCapture,
} from '@/content/types'
import { clientePublico } from '@/lib/supabase/publico'
import {
  paraCategoria,
  paraDocumento,
  paraNoticia,
  paraPainel,
  paraProjeto,
} from './mapear'
import {
  colunasCategoria,
  colunasDocumento,
  colunasNoticia,
  colunasPainel,
  colunasProjeto,
  type LinhaCategoria,
  type LinhaDocumento,
  type LinhaNoticia,
  type LinhaPainel,
  type LinhaProjeto,
} from './tipos'

/**
 * LEITURA PÚBLICA DO CONTEÚDO
 * ===========================
 * O que o site mostra vem daqui.
 *
 * Toda função devolve `null` em três situações: Supabase não configurado,
 * consulta com erro ou tabela ainda vazia. Nos três casos quem chamou volta
 * para o conteúdo estático de `src/content` — é isso que faz o site
 * continuar de pé se o banco cair, e que mantém os projetos do briefing no
 * ar enquanto o cliente não importa nada para o painel.
 *
 * Assim que houver uma linha publicada, o banco passa a mandar sozinho.
 */

/* O construtor de consulta do Supabase é "thenable", não uma Promise —
   daí `PromiseLike` aqui em vez de `Promise`. */
async function consultar<T>(
  tabela: string,
  executar: () => PromiseLike<{
    data: unknown
    error: { message: string } | null
  }>,
): Promise<T[] | null> {
  try {
    const { data, error } = await executar()

    if (error) {
      /* Antes da migração rodar, este é o estado esperado — e aparece em
         toda renderização. Vale dizer o que fazer em vez de só o sintoma. */
      const tabelaAusente = error.message.includes('schema cache')

      console.error(
        tabelaAusente
          ? `[aidep] a tabela "${tabela}" ainda não existe no Supabase. Rode os arquivos de supabase/migrations/ no SQL Editor, em ordem. Até lá o site usa o conteúdo de src/content.`
          : `[aidep] falha ao ler "${tabela}" no Supabase: ${error.message}`,
      )
      return null
    }

    const linhas = (data ?? []) as T[]
    return linhas.length > 0 ? linhas : null
  } catch (erro) {
    console.error(`[aidep] Supabase inacessível ao ler "${tabela}":`, erro)
    return null
  }
}

export async function lerCategorias(): Promise<DocumentCategoryEntry[] | null> {
  const supabase = clientePublico()
  if (!supabase) return null

  const linhas = await consultar<LinhaCategoria>('documento_categorias', () =>
    supabase
      .from('documento_categorias')
      .select(colunasCategoria)
      .order('ordem', { ascending: true }),
  )

  return linhas?.map(paraCategoria) ?? null
}

export async function lerDocumentos(): Promise<InstitutionalDocument[] | null> {
  const supabase = clientePublico()
  if (!supabase) return null

  const linhas = await consultar<LinhaDocumento>('documentos', () =>
    supabase
      .from('documentos')
      .select(colunasDocumento)
      .eq('publicado', true)
      .order('publicado_em', { ascending: false }),
  )

  return linhas?.map(paraDocumento) ?? null
}

export async function lerNoticias(): Promise<NewsArticle[] | null> {
  const supabase = clientePublico()
  if (!supabase) return null

  const linhas = await consultar<LinhaNoticia>('noticias', () =>
    supabase
      .from('noticias')
      .select(colunasNoticia)
      .eq('publicado', true)
      .order('data', { ascending: false }),
  )

  return linhas?.map(paraNoticia) ?? null
}

export async function lerProjetos(): Promise<Project[] | null> {
  const supabase = clientePublico()
  if (!supabase) return null

  const linhas = await consultar<LinhaProjeto>('projetos', () =>
    supabase
      .from('projetos')
      .select(colunasProjeto)
      .eq('publicado', true)
      .order('ordem', { ascending: true })
      .order('criado_em', { ascending: true }),
  )

  return linhas?.map(paraProjeto) ?? null
}

/**
 * A captura do painel Discricionárias e Legais que abre a Transparência.
 *
 * A tabela tem no máximo uma linha (ver migração 0003), então `limit(1)` é
 * a consulta inteira. `null` enquanto ninguém enviou nada pelo painel — e
 * nesse caso vale a captura versionada com o site (ver
 * `content/painel-transferegov.ts`).
 */
export async function lerPainel(): Promise<TransparencyPanelCapture | null> {
  const supabase = clientePublico()
  if (!supabase) return null

  const linhas = await consultar<LinhaPainel>('painel_transparencia', () =>
    supabase.from('painel_transparencia').select(colunasPainel).limit(1),
  )

  return linhas?.[0] ? paraPainel(linhas[0]) : null
}
