import { supabaseConfigurado } from '@/lib/supabase/config'
import { MolduraDeEntrada } from '../componentes/moldura-de-entrada'
import { Aviso } from '../componentes/ui'
import { FormularioDeRecuperacao } from './formulario'

/**
 * ESQUECI A SENHA — PEDIDO
 * ========================
 * Fora de `(painel)`: quem chega aqui não tem sessão, é justamente o
 * problema. O caminho todo é
 *
 *   esta tela → e-mail do Supabase → /admin/auth/confirmar → /admin/nova-senha
 */

/* Lê `?erro=` da URL: nada aqui pode ser servido de cache. */
export const dynamic = 'force-dynamic'

export default async function RecuperarSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>
}) {
  const { erro } = await searchParams

  return (
    <MolduraDeEntrada
      etiqueta="Área restrita"
      titulo="Recuperar a senha"
      descricao="Informe o e-mail cadastrado. Enviamos um link para você criar uma senha nova."
      rodape={
        <p>
          Sem acesso a esse e-mail? Quem cuida do site pode gerar uma senha no
          terminal com{' '}
          <code className="text-micro tracking-normal text-(--fg-muted)">
            npm run admin:criar
          </code>
          .
        </p>
      }
    >
      {supabaseConfigurado ? (
        <FormularioDeRecuperacao linkInvalido={erro === 'link'} />
      ) : (
        <Aviso tom="erro">
          O painel ainda não está conectado ao banco, então não há como enviar
          e-mail. Preencha NEXT_PUBLIC_SUPABASE_URL e
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no arquivo <code>.env</code>.
        </Aviso>
      )}
    </MolduraDeEntrada>
  )
}
