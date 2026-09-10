'use server'

import { updateTag } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { projetosDoBriefing } from '@/content/projects'
import { site } from '@/content/site'
import type { Localized, NewsBlock } from '@/content/types'
import {
  camposComErro,
  categoriaSchema,
  documentoSchema,
  noticiaSchema,
  painelSchema,
  projetoSchema,
  type BlocoPayload,
  type Resultado,
  SENHA_MINIMA,
} from '@/lib/admin/esquemas'
import { supabaseConfigurado } from '@/lib/supabase/config'
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

/**
 * Liga ou desliga a publicação de uma linha, sem passar pelo formulário.
 *
 * É o que a chave das listas do painel usa (ver `InterruptorDePublicacao`).
 * Escreve uma coluna só de propósito: publicar não pode revalidar o
 * documento inteiro nem exigir que os outros campos passem no esquema —
 * conteúdo semeado direto no banco tem endereço de arquivo em /public, e
 * travar o botão de publicar por causa disso seria o pior dos mundos.
 */
async function definirPublicacao(
  tabela: 'documentos' | 'noticias' | 'projetos',
  id: string,
  publicado: boolean,
  acao: string,
): Promise<Resultado> {
  const supabase = await comSessao()
  if (!supabase) return naoAutorizado

  if (typeof id !== 'string' || !id) {
    return { ok: false, erro: 'Item não encontrado.' }
  }

  try {
    const { error } = await supabase
      .from(tabela)
      .update({ publicado: Boolean(publicado) })
      .eq('id', id)

    if (error) throw new Error(error.message)

    atualizarSite()
    return { ok: true, id }
  } catch (erro) {
    console.error(`[aidep] ${acao} falhou:`, erro)
    return {
      ok: false,
      erro: 'Não foi possível mudar a publicação. Tente de novo.',
    }
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
/* Esqueci a senha                                                    */
/* ------------------------------------------------------------------ */

/* Server Action é endereço público: as duas abaixo podem ser chamadas
   mesmo quando a tela esconde o formulário. Sem isto, `clienteServidor()`
   lançaria e o navegador receberia um erro cru. */
const semBanco = {
  ok: false as const,
  erro: 'O painel ainda não está conectado ao banco. Fale com quem cuida do site.',
}

/**
 * Origem desta requisição — `http://localhost:3000`, `https://aidep…`.
 *
 * Montada a partir dos cabeçalhos, e não de `NEXT_PUBLIC_SITE_URL`, para
 * que o link do e-mail volte para o mesmo endereço de onde foi pedido:
 * máquina de desenvolvimento, pré-visualização ou produção. Atrás de
 * proxy, o host verdadeiro vem em `x-forwarded-host`.
 */
async function origemDaRequisicao(): Promise<string> {
  const cabecalhos = await headers()
  const host = cabecalhos.get('x-forwarded-host') ?? cabecalhos.get('host')

  if (!host) return site.url

  /* O cabeçalho pode trazer a cadeia inteira ("https,http"): vale o primeiro. */
  const declarado = cabecalhos.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(host)

  return `${declarado || (local ? 'http' : 'https')}://${host}`
}

/**
 * Pede ao Supabase o e-mail com o link de nova senha.
 *
 * O link volta para `/admin/auth/confirmar`, que troca o código por uma
 * sessão curta e leva para `/admin/nova-senha`.
 *
 * Cada endereço de onde o painel é usado precisa constar em
 * **Authentication → URL Configuration → Redirect URLs** no Supabase. Fora
 * dessa lista o `redirectTo` é ignorado e a pessoa cai na Site URL do
 * projeto — o e-mail chega, o link não leva a lugar nenhum.
 *
 * A resposta é a mesma para e-mail cadastrado e não cadastrado, de
 * propósito: esta tela não é lugar de descobrir quem tem conta.
 */
export async function pedirNovaSenha(
  email: string,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const endereco = email.trim().toLowerCase()

  if (!supabaseConfigurado) return semBanco

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(endereco)) {
    return { ok: false, erro: 'Informe um e-mail válido.' }
  }

  const supabase = await clienteServidor()

  const { error } = await supabase.auth.resetPasswordForEmail(endereco, {
    redirectTo: `${await origemDaRequisicao()}/admin/auth/confirmar`,
  })

  if (error) {
    console.error('[aidep] pedirNovaSenha falhou:', error)

    /* Limite de envio é o único erro que vale contar: quem esbarrou nele
       precisa saber que é para esperar, não para tentar de novo. */
    if (error.status === 429) {
      return {
        ok: false,
        erro: 'Já enviamos um e-mail há pouco. Espere alguns minutos antes de pedir outro.',
      }
    }

    return {
      ok: false,
      erro: 'Não foi possível enviar o e-mail agora. Tente de novo em alguns instantes.',
    }
  }

  return { ok: true }
}

/**
 * Grava a senha nova.
 *
 * Exige a sessão que o link do e-mail acabou de abrir — ou a de quem já
 * está logado e quer trocar a própria senha. Quem não tem nenhuma das duas
 * recebe o aviso de link expirado, não uma tela que não salva.
 */
export async function definirNovaSenha(
  senha: string,
): Promise<
  | { ok: true; destino: '/admin' | '/admin/login' }
  | { ok: false; erro: string }
> {
  if (!supabaseConfigurado) return semBanco

  if (senha.length < SENHA_MINIMA) {
    return {
      ok: false,
      erro: `A senha precisa de pelo menos ${SENHA_MINIMA} caracteres.`,
    }
  }

  const supabase = await clienteServidor()
  const { data: conta } = await supabase.auth.getUser()

  if (!conta.user) {
    return {
      ok: false,
      erro: 'O link para trocar a senha expirou. Peça outro e-mail para continuar.',
    }
  }

  const { error } = await supabase.auth.updateUser({ password: senha })

  if (error) {
    console.error('[aidep] definirNovaSenha falhou:', error)

    if (error.code === 'same_password') {
      return { ok: false, erro: 'Esta já é a senha atual. Escolha outra.' }
    }

    /* O mínimo e as exigências de caractere são do projeto no Supabase:
       a mensagem dele é mais precisa do que qualquer texto nosso. */
    if (error.code === 'weak_password') {
      return {
        ok: false,
        erro: error.message || 'Senha fraca demais. Use uma combinação mais longa.',
      }
    }

    return {
      ok: false,
      erro: 'Não foi possível salvar a senha nova. Tente de novo em alguns instantes.',
    }
  }

  /* Conta válida ainda não é acesso: quem não está em `admins` trocou a
     senha, mas não tem o que fazer no painel — vai para a porta. */
  const { data: admin } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', conta.user.id)
    .maybeSingle()

  return { ok: true, destino: admin ? '/admin' : '/admin/login' }
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

/** A chave "No site / Rascunho" da lista de Transparência. */
export async function publicarDocumento(
  id: string,
  publicado: boolean,
): Promise<Resultado> {
  return definirPublicacao('documentos', id, publicado, 'publicarDocumento')
}

/* ------------------------------------------------------------------ */
/* Painel Discricionárias e Legais                                    */
/* ------------------------------------------------------------------ */

/**
 * Troca a captura do painel do Governo Federal que abre a página de
 * Transparência.
 *
 * Grava sempre com `id: 1`: a tabela aceita uma linha só (ver a migração
 * 0003), e é isso que faz "enviar de novo" ser trocar a tela no lugar de
 * empilhar capturas antigas que ninguém veria.
 *
 * A imagem anterior não é apagada do Storage de propósito. São arquivos de
 * poucos MB, e o risco de apagar errado — o cliente sobe a nova, se
 * arrepende e quer a de antes — é maior que o de guardar. Quem quiser
 * limpar faz pelo Supabase.
 */
export async function salvarPainel(dados: unknown): Promise<Resultado> {
  const supabase = await comSessao()
  if (!supabase) return naoAutorizado

  const analise = painelSchema.safeParse(dados)
  if (!analise.success) {
    return {
      ok: false,
      erro: 'Confira os campos destacados.',
      campos: camposComErro(analise.error),
    }
  }

  const payload = analise.data

  try {
    const { error } = await supabase.from('painel_transparencia').upsert(
      {
        id: 1,
        imagem_url: payload.imagem.url,
        imagem_path: payload.imagem.path || null,
        imagem_largura: payload.imagem.largura,
        imagem_altura: payload.imagem.altura,
        capturado_em: payload.capturadoEm,
        alt: texto(payload.alt),
      },
      { onConflict: 'id' },
    )

    if (error) throw new Error(error.message)

    atualizarSite()
    return { ok: true, id: 'painel' }
  } catch (erro) {
    return falha(erro, 'salvarPainel')
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

/** A chave "No site / Rascunho" da lista de Notícias. */
export async function publicarNoticia(
  id: string,
  publicado: boolean,
): Promise<Resultado> {
  return definirPublicacao('noticias', id, publicado, 'publicarNoticia')
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
      /* Um polo é o caso normal e não precisa ser dito. */
      polos: local.polos > 1 ? local.polos : undefined,
      /* Estes dois o formulário não edita — só devolve como recebeu. Ver
         `localSchema` em `lib/admin/esquemas.ts`. */
      uf: local.uf || undefined,
      coords: local.coords ?? undefined,
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

/** A chave "No site / Rascunho" da lista de Projetos. */
export async function publicarProjeto(
  id: string,
  publicado: boolean,
): Promise<Resultado> {
  return definirPublicacao('projetos', id, publicado, 'publicarProjeto')
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
