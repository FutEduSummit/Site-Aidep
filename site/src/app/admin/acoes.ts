'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { projetosDoBriefing } from '@/content/projects'
import type { Localized, NewsBlock } from '@/content/types'
import {
  camposComErro,
  categoriaSchema,
  documentoSchema,
  noticiaSchema,
  projetoSchema,
  type BlocoPayload,
  type Resultado,
} from '@/lib/admin/esquemas'
import { clienteServidor, sessaoAdmin } from '@/lib/supabase/servidor'
import { TAG_CONTEUDO } from '@/lib/supabase/publico'

/**
 * AÇÕES DO PAINEL
 * ===============
 * Tudo o que grava passa por aqui. Em toda ação, nesta ordem:
 *
 *   1. confere a sessão contra a tabela `admins`;
 *   2. valida o que veio do navegador com o esquema (`lib/admin/esquemas`);
 *   3. grava no Supabase;
 *   4. invalida o cache para o site sair atualizado na hora.
 *
 * O passo 1 é redundante com o RLS do banco de propósito: o RLS é a
 * garantia, esta checagem é o que permite devolver uma mensagem clara em
 * vez de um erro cru do Postgres.
 *
 * IDIOMAS — o painel grava exatamente o que foi digitado, inclusive vazio.
 * Inglês e espanhol em branco não deixam buraco no site: `lib/idiomas.ts`
 * completa com o português na hora de exibir. Assim dá para saber, olhando
 * o banco, o que foi de fato traduzido e o que ainda não foi.
 */

const naoAutorizado: Resultado = {
  ok: false,
  erro: 'Sua sessão expirou. Entre de novo para continuar.',
}

async function comSessao() {
  const sessao = await sessaoAdmin()
  if (!sessao) return null
  return clienteServidor()
}

/**
 * Publicou, apagou ou editou: o site precisa refletir isso agora.
 *
 * `updateTag` em vez de `revalidateTag` de propósito. O segundo serve
 * conteúdo velho enquanto atualiza por baixo — ótimo para um catálogo,
 * péssimo aqui: o cliente publica, abre o site para conferir e vê a versão
 * anterior. `updateTag` expira na hora, e só pode ser chamado de dentro de
 * uma Server Action, que é o caso de todas as ações deste arquivo.
 */
function atualizarSite() {
  updateTag(TAG_CONTEUDO)
}

function falha(erro: unknown, acao: string): Resultado {
  console.error(`[aidep] ${acao} falhou:`, erro)
  const mensagem = erro instanceof Error ? erro.message : String(erro)

  if (mensagem.includes('duplicate key') && mensagem.includes('slug')) {
    return {
      ok: false,
      erro: 'Já existe um item com este endereço. Escolha outro.',
      campos: { slug: 'Este endereço já está em uso.' },
    }
  }

  return {
    ok: false,
    erro: 'Não foi possível salvar. Tente de novo em alguns instantes.',
  }
}

/* ------------------------------------------------------------------ */
/* Campos por idioma                                                  */
/* ------------------------------------------------------------------ */

/** Texto nos três idiomas, do jeito que foi digitado. */
function texto(bruto: Partial<Localized> | null | undefined): Localized {
  return {
    pt: bruto?.pt?.trim() ?? '',
    en: bruto?.en?.trim() ?? '',
    es: bruto?.es?.trim() ?? '',
  }
}

/** Igual, mas devolve `null` quando nem o português foi preenchido. */
function textoOpcional(
  bruto: Partial<Localized> | null | undefined,
): Localized | null {
  const valor = texto(bruto)
  return valor.pt ? valor : null
}

/** Lista de textos por idioma, sem os itens em branco. */
function lista(
  bruto: Partial<Localized<string[]>> | null | undefined,
): Localized<string[]> {
  const limpar = (itens: string[] | undefined) =>
    (itens ?? []).map((item) => item.trim()).filter(Boolean)

  return {
    pt: limpar(bruto?.pt),
    en: limpar(bruto?.en),
    es: limpar(bruto?.es),
  }
}

function listaOpcional(
  bruto: Partial<Localized<string[]>> | null | undefined,
): Localized<string[]> | null {
  const valor = lista(bruto)
  return valor.pt.length > 0 ? valor : null
}

/* ------------------------------------------------------------------ */
/* Entrada e saída                                                    */
/* ------------------------------------------------------------------ */

export async function entrar(
  email: string,
  senha: string,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const supabase = await clienteServidor()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: senha,
  })

  if (error || !data.user) {
    return { ok: false, erro: 'E-mail ou senha incorretos.' }
  }

  /* Conta válida ainda não é acesso: só quem está em `admins` publica. */
  const { data: admin } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (!admin) {
    await supabase.auth.signOut()
    return {
      ok: false,
      erro: 'Esta conta não tem permissão para editar o site.',
    }
  }

  return { ok: true }
}

export async function sair() {
  const supabase = await clienteServidor()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

/* ------------------------------------------------------------------ */
/* Categorias de documento                                            */
/* ------------------------------------------------------------------ */

export async function salvarCategoria(dados: unknown): Promise<Resultado> {
  const supabase = await comSessao()
  if (!supabase) return naoAutorizado

  const analise = categoriaSchema.safeParse(dados)
  if (!analise.success) {
    return {
      ok: false,
      erro: 'Confira os campos destacados.',
      campos: camposComErro(analise.error),
    }
  }

  const payload = analise.data

  try {
    const { error } = await supabase.from('documento_categorias').upsert(
      {
        id: payload.id,
        rotulo: texto(payload.rotulo),
        cor: payload.cor,
        ordem: payload.ordem,
      },
      { onConflict: 'id' },
    )

    if (error) throw new Error(error.message)

    atualizarSite()
    return { ok: true, id: payload.id }
  } catch (erro) {
    return falha(erro, 'salvarCategoria')
  }
}

export async function apagarCategoria(id: string): Promise<Resultado> {
  const supabase = await comSessao()
  if (!supabase) return naoAutorizado

  try {
    const { error } = await supabase
      .from('documento_categorias')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)

    /* Os documentos da categoria não são apagados junto: a coluna vira
       nula (ON DELETE SET NULL) e eles seguem publicados, sem selo. */
    atualizarSite()
    return { ok: true, id }
  } catch (erro) {
    return falha(erro, 'apagarCategoria')
  }
}

/* ------------------------------------------------------------------ */
/* Documentos                                                         */
/* ------------------------------------------------------------------ */

export async function salvarDocumento(dados: unknown): Promise<Resultado> {
  const supabase = await comSessao()
  if (!supabase) return naoAutorizado

  const analise = documentoSchema.safeParse(dados)
  if (!analise.success) {
    return {
      ok: false,
      erro: 'Confira os campos destacados.',
      campos: camposComErro(analise.error),
    }
  }

  const payload = analise.data

  const linha = {
    titulo: texto(payload.titulo),
    conteudo: texto(payload.conteudo),
    categoria_id: payload.categoriaId,
    ano: payload.ano,
    publicado_em: payload.publicadoEm,
    arquivo_url: payload.arquivoUrl,
    arquivo_path: payload.arquivoPath || null,
    arquivo_nome: payload.arquivoNome || null,
    formato: payload.formato,
    tamanho_bytes: payload.tamanhoBytes,
    miniatura_url: payload.miniatura?.url ?? null,
    miniatura_path: payload.miniatura?.path || null,
    projeto_slug: payload.projetoSlug || null,
    publicado: payload.publicado,
  }

  try {
    const { data, error } = payload.id
      ? await supabase
          .from('documentos')
          .update(linha)
          .eq('id', payload.id)
          .select('id')
          .single()
      : await supabase.from('documentos').insert(linha).select('id').single()

    if (error) throw new Error(error.message)

    atualizarSite()
    return { ok: true, id: data.id as string }
  } catch (erro) {
    return falha(erro, 'salvarDocumento')
  }
}

export async function apagarDocumento(id: string): Promise<Resultado> {
  const supabase = await comSessao()
  if (!supabase) return naoAutorizado

  try {
    /* O arquivo sai do Storage junto com a linha — senão o bucket vira um
       depósito de PDFs órfãos que ninguém sabe mais de onde vieram. */
    const { data: atual } = await supabase
      .from('documentos')
      .select('arquivo_path, miniatura_path')
      .eq('id', id)
      .maybeSingle()

    const { error } = await supabase.from('documentos').delete().eq('id', id)
    if (error) throw new Error(error.message)

    if (atual?.arquivo_path) {
      await supabase.storage.from('documentos').remove([atual.arquivo_path])
    }
    if (atual?.miniatura_path) {
      await supabase.storage.from('imagens').remove([atual.miniatura_path])
    }

    atualizarSite()
    return { ok: true, id }
  } catch (erro) {
    return falha(erro, 'apagarDocumento')
  }
}

/* ------------------------------------------------------------------ */
/* Notícias                                                           */
/* ------------------------------------------------------------------ */

/** Descarta bloco em branco em vez de publicar um parágrafo vazio. */
function blocos(brutos: BlocoPayload[]): NewsBlock[] {
  const limpos: NewsBlock[] = []

  for (const bloco of brutos) {
    if (bloco.type === 'list') {
      const items = bloco.items.map((item) => item.trim()).filter(Boolean)
      if (items.length > 0) limpos.push({ type: 'list', items })
      continue
    }

    const text = bloco.text.trim()
    if (!text) continue

    limpos.push(
      bloco.type === 'quote'
        ? { type: 'quote', text, cite: bloco.cite?.trim() || undefined }
        : { type: bloco.type, text },
    )
  }

  return limpos
}

export async function salvarNoticia(dados: unknown): Promise<Resultado> {
  const supabase = await comSessao()
  if (!supabase) return naoAutorizado

  const analise = noticiaSchema.safeParse(dados)
  if (!analise.success) {
    return {
      ok: false,
      erro: 'Confira os campos destacados.',
      campos: camposComErro(analise.error),
    }
  }

  const payload = analise.data

  const linha = {
    slug: payload.slug,
    titulo: texto(payload.titulo),
    resumo: texto(payload.resumo),
    categoria: texto(payload.categoria),
    corpo: {
      pt: blocos(payload.corpo.pt),
      en: blocos(payload.corpo.en),
      es: blocos(payload.corpo.es),
    },
    data: payload.data,
    autor: payload.autor || null,
    capa_url: payload.capa?.url ?? null,
    capa_path: payload.capa?.path || null,
    capa_largura: payload.capa?.largura ?? null,
    capa_altura: payload.capa?.altura ?? null,
    /* Sem descrição escrita, o título serve de texto alternativo — melhor
       do que `alt` vazio para quem usa leitor de tela. */
    capa_alt: textoOpcional(payload.capaAlt) ?? texto(payload.titulo),
    projetos_relacionados: payload.projetosRelacionados,
    publicado: payload.publicado,
  }

  try {
    const { data, error } = payload.id
      ? await supabase
          .from('noticias')
          .update(linha)
          .eq('id', payload.id)
          .select('id')
          .single()
      : await supabase.from('noticias').insert(linha).select('id').single()

    if (error) throw new Error(error.message)

    atualizarSite()
    return { ok: true, id: data.id as string, slug: payload.slug }
  } catch (erro) {
    return falha(erro, 'salvarNoticia')
  }
}

export async function apagarNoticia(id: string): Promise<Resultado> {
  const supabase = await comSessao()
  if (!supabase) return naoAutorizado

  try {
    const { data: atual } = await supabase
      .from('noticias')
      .select('capa_path')
      .eq('id', id)
      .maybeSingle()

    const { error } = await supabase.from('noticias').delete().eq('id', id)
    if (error) throw new Error(error.message)

    if (atual?.capa_path) {
      await supabase.storage.from('imagens').remove([atual.capa_path])
    }

    atualizarSite()
    return { ok: true, id }
  } catch (erro) {
    return falha(erro, 'apagarNoticia')
  }
}

/* ------------------------------------------------------------------ */
/* Projetos                                                           */
/* ------------------------------------------------------------------ */

export async function salvarProjeto(dados: unknown): Promise<Resultado> {
  const supabase = await comSessao()
  if (!supabase) return naoAutorizado

  const analise = projetoSchema.safeParse(dados)
  if (!analise.success) {
    return {
      ok: false,
      erro: 'Confira os campos destacados.',
      campos: camposComErro(analise.error),
    }
  }

  const payload = analise.data
  const nome = payload.nome.trim()

  const locais = payload.locais
    .filter((local) => local.cidade.pt.trim())
    .map((local) => ({
      city: texto(local.cidade),
      region: local.regiao || undefined,
      venue: local.local || undefined,
    }))

  const metricas = payload.metricas
    .filter((metrica) => metrica.rotulo.pt.trim())
    .map((metrica, indice) => ({
      id: metrica.id || `m${indice}`,
      value: metrica.valor,
      prefix: metrica.prefixo || undefined,
      suffix: textoOpcional(metrica.sufixo) ?? undefined,
      label: texto(metrica.rotulo),
    }))

  /* A metodologia é uma lista de passos por idioma. Passo sem título ou
     sem texto em português não entra — a seção pede os dois. */
  const passos = payload.metodologia.filter(
    (passo) => passo.titulo.pt.trim() && passo.texto.pt.trim(),
  )

  const metodologia =
    passos.length > 0
      ? {
          pt: passos.map((passo) => ({
            title: passo.titulo.pt,
            text: passo.texto.pt,
          })),
          en: passos.map((passo) => ({
            title: passo.titulo.en || passo.titulo.pt,
            text: passo.texto.en || passo.texto.pt,
          })),
          es: passos.map((passo) => ({
            title: passo.titulo.es || passo.titulo.pt,
            text: passo.texto.es || passo.texto.pt,
          })),
        }
      : null

  const galeria = payload.galeria.map((foto) => ({
    src: foto.url,
    width: foto.largura,
    height: foto.altura,
    alt: textoOpcional(foto.alt) ?? { pt: nome, en: nome, es: nome },
  }))

  const linha = {
    slug: payload.slug,
    nome,
    categoria: texto(payload.categoria),
    resumo: texto(payload.resumo),
    descricao: lista(payload.descricao),
    objetivo: textoOpcional(payload.objetivo),
    publico: lista(payload.publico),
    locais,
    metricas,
    metodologia,
    resultados: listaOpcional(payload.resultados),
    galeria,
    capa_url: payload.capa?.url ?? null,
    capa_path: payload.capa?.path || null,
    capa_largura: payload.capa?.largura ?? null,
    capa_altura: payload.capa?.altura ?? null,
    capa_alt: textoOpcional(payload.capaAlt) ?? {
      pt: nome,
      en: nome,
      es: nome,
    },
    ordem: payload.ordem,
    publicado: payload.publicado,
  }

  try {
    const { data, error } = payload.id
      ? await supabase
          .from('projetos')
          .update(linha)
          .eq('id', payload.id)
          .select('id')
          .single()
      : await supabase.from('projetos').insert(linha).select('id').single()

    if (error) throw new Error(error.message)

    atualizarSite()
    return { ok: true, id: data.id as string, slug: payload.slug }
  } catch (erro) {
    return falha(erro, 'salvarProjeto')
  }
}

export async function apagarProjeto(id: string): Promise<Resultado> {
  const supabase = await comSessao()
  if (!supabase) return naoAutorizado

  try {
    const { data: atual } = await supabase
      .from('projetos')
      .select('capa_path')
      .eq('id', id)
      .maybeSingle()

    const { error } = await supabase.from('projetos').delete().eq('id', id)
    if (error) throw new Error(error.message)

    if (atual?.capa_path) {
      await supabase.storage.from('imagens').remove([atual.capa_path])
    }

    atualizarSite()
    return { ok: true, id }
  } catch (erro) {
    return falha(erro, 'apagarProjeto')
  }
}

/* ------------------------------------------------------------------ */
/* Importação inicial                                                 */
/* ------------------------------------------------------------------ */

/**
 * Copia para o painel os três projetos que hoje vivem no código
 * (`content/projects.ts`, vindos do briefing oficial).
 *
 * A partir daí o cliente edita cada um por lá. Rodar de novo é seguro: o
 * `upsert` por slug atualiza o que existir em vez de duplicar — mas
 * sobrescreve o que tiver sido editado no painel, então o botão avisa.
 *
 * Estes já vêm nos três idiomas, direto do briefing.
 */
export async function importarProjetosDoSite(): Promise<Resultado> {
  const supabase = await comSessao()
  if (!supabase) return naoAutorizado

  const linhas = projetosDoBriefing.map((projeto, indice) => ({
    slug: projeto.slug,
    nome: projeto.name,
    categoria: projeto.category,
    resumo: projeto.summary,
    descricao: projeto.description,
    objetivo: projeto.objective,
    publico: projeto.audience,
    locais: projeto.locations,
    metricas: projeto.metrics,
    metodologia: projeto.methodology,
    resultados: projeto.results,
    galeria: projeto.gallery,
    parceiros: projeto.partnerIds,
    ordem: indice,
    publicado: true,
  }))

  try {
    const { error } = await supabase
      .from('projetos')
      .upsert(linhas, { onConflict: 'slug' })

    if (error) throw new Error(error.message)

    atualizarSite()
    return { ok: true, id: 'importacao' }
  } catch (erro) {
    return falha(erro, 'importarProjetosDoSite')
  }
}
