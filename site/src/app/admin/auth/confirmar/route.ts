import { NextResponse, type NextRequest } from 'next/server'
import { supabaseConfigurado } from '@/lib/supabase/config'
import { clienteServidor } from '@/lib/supabase/servidor'

/**
 * VOLTA DO LINK DO E-MAIL
 * =======================
 * O link de "esqueci a senha" sai do Supabase, passa por `/auth/v1/verify`
 * e desemboca aqui. Este é o único ponto do painel capaz de transformar o
 * que vem na URL em sessão: Server Component não grava cookie, e a tela de
 * nova senha precisa da sessão já pronta.
 *
 * Duas formas de link, porque o modelo de e-mail do Supabase pode estar em
 * qualquer uma das duas:
 *
 *   `?code=…`               o padrão (`{{ .ConfirmationURL }}`). Só funciona
 *                           no mesmo navegador que pediu o e-mail — a outra
 *                           metade do par PKCE ficou aqui, num cookie.
 *   `?token_hash=…&type=…`  quando o modelo usa `{{ .TokenHash }}`. Não
 *                           depende de cookie, então o link abre em
 *                           qualquer aparelho.
 *
 * Deu certo: segue para `/admin/nova-senha`, com a sessão no cookie.
 * Deu errado — link velho, já usado, ou aberto em outro navegador: volta
 * para o pedido, que explica o que aconteceu. Nunca para uma tela de senha
 * que não teria como salvar.
 */

/** Os tipos de link que terminam em "escolha uma senha". */
const tiposAceitos = new Set(['recovery', 'invite'])

export async function GET(request: NextRequest) {
  const parametros = request.nextUrl.searchParams

  /** Redireciona preservando o host real — o `nextUrl` já o resolveu. */
  function levarPara(caminho: string, erro?: string) {
    const destino = request.nextUrl.clone()
    destino.pathname = caminho
    destino.search = erro ? `?erro=${erro}` : ''
    return NextResponse.redirect(destino)
  }

  const semLink = () => levarPara('/admin/recuperar-senha', 'link')

  if (!supabaseConfigurado) return levarPara('/admin/login')

  /* O próprio Supabase avisa por aqui quando o link já venceu. */
  if (parametros.get('error') || parametros.get('error_code')) return semLink()

  const codigo = parametros.get('code')
  const tokenHash = parametros.get('token_hash')
  const tipo = parametros.get('type')

  const supabase = await clienteServidor()

  const { error } = codigo
    ? await supabase.auth.exchangeCodeForSession(codigo)
    : tokenHash && tipo && tiposAceitos.has(tipo)
      ? await supabase.auth.verifyOtp({
          type: tipo as 'recovery' | 'invite',
          token_hash: tokenHash,
        })
      : { error: new Error('Link sem código de confirmação.') }

  if (error) {
    console.error('[aidep] confirmação do link de senha falhou:', error)
    return semLink()
  }

  return levarPara('/admin/nova-senha')
}
