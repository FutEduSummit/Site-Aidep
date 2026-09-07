import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAnonKey, supabaseConfigurado, supabaseUrl } from './config'

/**
 * CLIENTE DO PAINEL (com sessão)
 * ==============================
 * Lê e grava o cookie de sessão do Supabase. Serve apenas às rotas de
 * `/admin` e às Server Actions — nunca às páginas públicas, que usam
 * `clientePublico()` justamente para não depender de cookie.
 */
export async function clienteServidor() {
  if (!supabaseConfigurado) {
    throw new Error(
      'Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no .env',
    )
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (paraGravar) => {
        try {
          for (const { name, value, options } of paraGravar) {
            cookieStore.set(name, value, options)
          }
        } catch {
          /* Server Component não pode gravar cookie — quem renova a sessão
             é o proxy (`src/proxy.ts`), que roda antes da renderização. */
        }
      },
    },
  })
}

export type Sessao = {
  userId: string
  email: string
  nome: string | null
}

/**
 * Quem está logado E consta na tabela `admins`.
 *
 * Ter conta no Supabase não basta: a checagem contra `admins` é a mesma
 * que o RLS faz no banco, repetida aqui só para a interface poder mandar
 * o visitante de volta ao login em vez de mostrar telas que não salvam.
 */
export async function sessaoAdmin(): Promise<Sessao | null> {
  if (!supabaseConfigurado) return null

  const supabase = await clienteServidor()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null

  const { data: admin } = await supabase
    .from('admins')
    .select('nome')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (!admin) return null

  return {
    userId: data.user.id,
    email: data.user.email ?? '',
    nome: admin.nome ?? null,
  }
}
