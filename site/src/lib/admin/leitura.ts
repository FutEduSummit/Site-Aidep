import 'server-only'

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
} from '@/lib/cms/tipos'
import { clienteServidor } from '@/lib/supabase/servidor'

/**
 * LEITURA DO PAINEL
 * =================
 * Diferente da leitura pública (`lib/cms/leitura.ts`) em dois pontos, e os
 * dois importam:
 *
 *   • usa o cliente com sessão, então o RLS devolve também o que ainda
 *     está como rascunho — é o painel, o cliente precisa ver o que não
 *     publicou;
 *   • devolve a linha crua do banco, não o tipo do site: o formulário
 *     precisa editar exatamente o que está gravado.
 */

export async function listarCategorias(): Promise<LinhaCategoria[]> {
  const supabase = await clienteServidor()
  const { data } = await supabase
    .from('documento_categorias')
    .select(colunasCategoria)
    .order('ordem', { ascending: true })

  return (data ?? []) as LinhaCategoria[]
}

export async function listarDocumentos(): Promise<LinhaDocumento[]> {
  const supabase = await clienteServidor()
  const { data } = await supabase
    .from('documentos')
    .select(colunasDocumento)
    .order('publicado_em', { ascending: false })

  return (data ?? []) as LinhaDocumento[]
}

export async function obterDocumento(id: string): Promise<LinhaDocumento | null> {
  const supabase = await clienteServidor()
  const { data } = await supabase
    .from('documentos')
    .select(colunasDocumento)
    .eq('id', id)
    .maybeSingle()

  return (data as LinhaDocumento | null) ?? null
}

export async function listarNoticias(): Promise<LinhaNoticia[]> {
  const supabase = await clienteServidor()
  const { data } = await supabase
    .from('noticias')
    .select(colunasNoticia)
    .order('data', { ascending: false })

  return (data ?? []) as LinhaNoticia[]
}

export async function obterNoticia(id: string): Promise<LinhaNoticia | null> {
  const supabase = await clienteServidor()
  const { data } = await supabase
    .from('noticias')
    .select(colunasNoticia)
    .eq('id', id)
    .maybeSingle()

  return (data as LinhaNoticia | null) ?? null
}

export async function listarProjetos(): Promise<LinhaProjeto[]> {
  const supabase = await clienteServidor()
  const { data } = await supabase
    .from('projetos')
    .select(colunasProjeto)
    .order('ordem', { ascending: true })
    .order('criado_em', { ascending: true })

  return (data ?? []) as LinhaProjeto[]
}

export async function obterProjeto(id: string): Promise<LinhaProjeto | null> {
  const supabase = await clienteServidor()
  const { data } = await supabase
    .from('projetos')
    .select(colunasProjeto)
    .eq('id', id)
    .maybeSingle()

  return (data as LinhaProjeto | null) ?? null
}

/** Números da tela inicial do painel. */
export async function resumo() {
  const supabase = await clienteServidor()

  async function contar(tabela: string, apenasPublicados?: boolean) {
    const consulta = supabase
      .from(tabela)
      .select('id', { count: 'exact', head: true })

    const { count } = apenasPublicados
      ? await consulta.eq('publicado', true)
      : await consulta

    return count ?? 0
  }

  const [
    noticias,
    noticiasPublicadas,
    projetos,
    projetosPublicados,
    documentos,
    documentosPublicados,
  ] = await Promise.all([
    contar('noticias'),
    contar('noticias', true),
    contar('projetos'),
    contar('projetos', true),
    contar('documentos'),
    contar('documentos', true),
  ])

  return {
    noticias: { total: noticias, publicados: noticiasPublicadas },
    projetos: { total: projetos, publicados: projetosPublicados },
    documentos: { total: documentos, publicados: documentosPublicados },
  }
}

/**
 * A captura do painel Discricionárias e Legais que está gravada, ou `null`
 * se o cliente ainda não enviou nenhuma — e nesse caso o site publica a
 * versionada com o código (ver `content/painel-transferegov.ts`).
 */
export async function obterPainel(): Promise<LinhaPainel | null> {
  const supabase = await clienteServidor()
  const { data } = await supabase
    .from('painel_transparencia')
    .select(colunasPainel)
    .eq('id', 1)
    .maybeSingle()

  return (data as LinhaPainel | null) ?? null
}
