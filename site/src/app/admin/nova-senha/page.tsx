import { redirect } from 'next/navigation'
import { supabaseConfigurado } from '@/lib/supabase/config'
import { clienteServidor } from '@/lib/supabase/servidor'
import { MolduraDeEntrada } from '../componentes/moldura-de-entrada'
import { FormularioDeNovaSenha } from './formulario'

/**
 * ESCOLHER A SENHA NOVA
 * =====================
 * Chega-se aqui pelo link do e-mail, já com a sessão que
 * `/admin/auth/confirmar` abriu. Sem sessão não há o que fazer nesta tela:
 * volta para o pedido, que explica por que o link não valeu.
 *
 * A guarda é `getUser()` e não `sessaoAdmin()` de propósito: quem está
 * recuperando a senha pode não constar em `admins` — trocar a própria
 * senha é direito de qualquer conta. Quem decide para onde ir depois é a
 * ação, que confere a tabela antes de mandar para o painel.
 *
 * Também serve a quem já está logado e quer trocar a senha.
 */

/* Depende do cookie de sessão: nunca pode ser servido de cache. */
export const dynamic = 'force-dynamic'

export default async function NovaSenhaPage() {
  if (!supabaseConfigurado) redirect('/admin/login')

  const supabase = await clienteServidor()
  const { data } = await supabase.auth.getUser()

  if (!data.user) redirect('/admin/recuperar-senha?erro=link')

  return (
    <MolduraDeEntrada
      etiqueta="Área restrita"
      titulo="Criar senha nova"
      descricao="Escolha a senha que passará a valer para entrar no painel. A anterior deixa de funcionar."
      rodape={
        <p>
          Guarde a senha em lugar seguro. Ninguém — nem quem cuida do site —
          consegue consultá-la depois: só gerar outra.
        </p>
      }
    >
      <FormularioDeNovaSenha email={data.user.email ?? ''} />
    </MolduraDeEntrada>
  )
}
