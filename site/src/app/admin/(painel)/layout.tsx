import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { sessaoAdmin } from '@/lib/supabase/servidor'
import { Navegacao } from '../componentes/navegacao'

/**
 * GUARDA DO PAINEL
 * ================
 * Tudo dentro de `(painel)` exige sessão válida E registro na tabela
 * `admins`. Quem não tem as duas coisas volta para a entrada.
 *
 * Esta checagem é conveniência de interface, não a barreira de segurança:
 * quem impede a gravação é o RLS do Supabase, que roda no banco e vale
 * mesmo que alguém chame a API por fora do site.
 */

/* Depende do cookie de sessão: nunca pode ser servido de cache. */
export const dynamic = 'force-dynamic'

export default async function PainelLayout({
  children,
}: {
  children: ReactNode
}) {
  const sessao = await sessaoAdmin()
  if (!sessao) redirect('/admin/login')

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <Navegacao nome={sessao.nome} email={sessao.email} />

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          {children}
        </div>
      </main>
    </div>
  )
}
