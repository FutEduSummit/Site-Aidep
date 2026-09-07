import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAnonKey, supabaseConfigurado, supabaseUrl } from './config'

/**
 * RENOVAÇÃO DA SESSÃO DO PAINEL
 * =============================
 * O token do Supabase expira em uma hora. Server Component não pode gravar
 * cookie, então quem renova é o proxy: a cada requisição de `/admin` ele
 * chama `getUser()`, e o cliente do Supabase, ao perceber o token vencido,
 * grava o novo par de cookies na resposta que sai daqui.
 *
 * Sem isto, o cliente é deslogado sozinho depois de uma hora — no meio de
 * uma notícia longa, sem aviso.
 */
export async function renovarSessao(request: NextRequest) {
  let resposta = NextResponse.next({ request })

  if (!supabaseConfigurado) return resposta

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (paraGravar) => {
        for (const { name, value } of paraGravar) {
          request.cookies.set(name, value)
        }

        resposta = NextResponse.next({ request })

        for (const { name, value, options } of paraGravar) {
          resposta.cookies.set(name, value, options)
        }
      },
    },
  })

  /* Não remover: é esta chamada que dispara a renovação do token. */
  await supabase.auth.getUser()

  return resposta
}
