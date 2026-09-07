/**
 * CONEXÃO COM O SUPABASE
 * ======================
 * As duas chaves vivem no `.env` (ver `.env.example`). Enquanto elas não
 * estiverem preenchidas, `supabaseConfigurado` é `false` e o site inteiro
 * continua funcionando com o conteúdo estático de `src/content` — nenhuma
 * página quebra, nenhum build falha. É o que permite abrir o projeto num
 * ambiente novo sem credencial nenhuma.
 */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

/**
 * Chave publicável (`sb_publishable_…`). É pública de propósito: vai para o
 * navegador. Quem protege os dados é o RLS declarado na migração — leitura
 * do que está publicado para qualquer um, escrita só para quem está na
 * tabela `admins`.
 */
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  ''

export const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey)

/** Buckets criados pela migração. */
export const bucketDocumentos = 'documentos'
export const bucketImagens = 'imagens'

/** Host do Storage — usado no `remotePatterns` do next.config.ts. */
export function supabaseHost(): string | null {
  if (!supabaseUrl) return null
  try {
    return new URL(supabaseUrl).hostname
  } catch {
    return null
  }
}
