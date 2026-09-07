'use client'

import { createBrowserClient } from '@supabase/ssr'
import { supabaseAnonKey, supabaseConfigurado, supabaseUrl } from './config'

let instancia: ReturnType<typeof createBrowserClient> | null = null

/**
 * CLIENTE DO NAVEGADOR
 * ====================
 * Só o painel usa: login, logout e envio de arquivo direto para o Storage
 * (o arquivo vai do computador do cliente para o Supabase sem passar pelo
 * servidor do site — é o que permite subir PDF grande sem esbarrar no
 * limite de corpo das Server Actions).
 *
 * Uma instância por aba: `createBrowserClient` guarda a sessão e o
 * agendador de renovação de token, e duplicá-los causa logout aleatório.
 */
export function clienteNavegador() {
  if (!supabaseConfigurado) {
    throw new Error(
      'Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no .env',
    )
  }
  instancia ??= createBrowserClient(supabaseUrl, supabaseAnonKey)
  return instancia
}
