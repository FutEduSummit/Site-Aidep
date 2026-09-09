import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseConfigurado } from '@/lib/supabase/config'
import { sessaoAdmin } from '@/lib/supabase/servidor'
import {
  MolduraDeEntrada,
  classesDeLigacao,
} from '../componentes/moldura-de-entrada'
import { Aviso } from '../componentes/ui'
import { FormularioDeEntrada } from './formulario'

/* A tela de entrada nunca pode ser servida de cache: ela decide entre
   mostrar o formulário e mandar para o painel, e isso depende do cookie. */
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  if (await sessaoAdmin()) redirect('/admin')

  return (
    <MolduraDeEntrada
      etiqueta="Área restrita"
      titulo="Painel de conteúdo"
      descricao="Entre para publicar notícias, projetos e documentos de transparência no site da AIDEP."
      rodape={
        <p>
          Esqueceu a senha?{' '}
          <Link href="/admin/recuperar-senha" className={classesDeLigacao}>
            Receba um link por e-mail
          </Link>
          .
        </p>
      }
    >
      {supabaseConfigurado ? (
        <FormularioDeEntrada />
      ) : (
        <Aviso tom="erro">
          O painel ainda não está conectado ao banco. Preencha
          NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no
          arquivo <code>.env</code> e rode <code>npm run db:migrate</code>.
        </Aviso>
      )}
    </MolduraDeEntrada>
  )
}
