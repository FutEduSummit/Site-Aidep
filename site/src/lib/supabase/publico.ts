import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { supabaseAnonKey, supabaseConfigurado, supabaseUrl } from './config'

/**
 * CLIENTE DE LEITURA PÚBLICA
 * ==========================
 * Usado pelas páginas do site (Home, Projetos, Notícias, Transparência).
 *
 * Não lê cookie de propósito: tocar em `cookies()` obrigaria toda página a
 * renderizar sob demanda. Sem cookie, as páginas continuam podendo ser
 * geradas estaticamente.
 *
 * Devolve `null` quando o Supabase não está configurado; quem chama cai no
 * conteúdo estático de `src/content`.
 */

/** Etiqueta que cobre todo o conteúdo — usada para revalidar tudo de uma vez. */
export const TAG_CONTEUDO = 'aidep-conteudo'

/** Etiqueta de uma tabela — `aidep-noticias`, `aidep-documentos`… */
export function tagDaTabela(tabela: string) {
  return `aidep-${tabela}`
}

/**
 * Qual tabela esta requisição está lendo. O PostgREST põe o nome no
 * caminho (`/rest/v1/noticias?select=…`), então dá para etiquetar cada
 * resposta sem que a camada de consulta precise repetir o nome.
 */
function tagsDaRequisicao(url: string): string[] {
  const encontrado = /\/rest\/v1\/([a-zA-Z0-9_]+)/.exec(url)
  return encontrado
    ? [TAG_CONTEUDO, tagDaTabela(encontrado[1])]
    : [TAG_CONTEUDO]
}

/**
 * Cinco minutos é só a rede de segurança: quando o cliente publica algo no
 * painel, a Server Action chama `revalidateTag` e a página sai atualizada
 * na hora. O tempo cobre alteração feita direto no Supabase, por fora do
 * painel — aí a atualização aparece na próxima revalidação.
 */
const SEGUNDOS_ATE_REVALIDAR = 300

export function clientePublico() {
  if (!supabaseConfigurado) return null

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (entrada: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof entrada === 'string'
            ? entrada
            : entrada instanceof URL
              ? entrada.href
              : entrada.url

        return fetch(entrada, {
          ...init,
          next: {
            revalidate: SEGUNDOS_ATE_REVALIDAR,
            tags: tagsDaRequisicao(url),
          },
        })
      },
    },
  })
}
