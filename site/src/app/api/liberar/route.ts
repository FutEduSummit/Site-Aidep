import { NextResponse } from 'next/server'
import {
  gateCookie,
  gateEnabled,
  gatePassword,
  gatePath,
  gateToken,
  safeDestination,
} from '@/lib/gate'

/** Trinta dias — o visitante não precisa digitar a senha a cada acesso. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

/**
 * Valida a senha da pré-visualização.
 *
 * É um formulário HTML comum (POST + redirect 303), sem JavaScript: se o
 * script falhar, o portão continua funcionando. Fica sob `/api`, que o
 * proxy ignora, então este endereço nunca é bloqueado pelo próprio portão.
 */
export async function POST(request: Request) {
  const destinoBase = new URL(request.url)

  if (!gateEnabled) {
    return NextResponse.redirect(new URL('/', destinoBase), 303)
  }

  const form = await request.formData()
  const senha = String(form.get('senha') ?? '')
  const destino = safeDestination(String(form.get('destino') ?? '/'))

  if (senha !== gatePassword) {
    const volta = new URL(gatePath, destinoBase)
    volta.searchParams.set('erro', '1')
    if (destino !== '/') volta.searchParams.set('destino', destino)
    return NextResponse.redirect(volta, 303)
  }

  /* Protocolo real da visita: atrás de proxy/CDN, quem sabe é o cabeçalho. */
  const proto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const httpsReal = proto ? proto === 'https' : destinoBase.protocol === 'https:'

  const response = NextResponse.redirect(new URL(destino, destinoBase), 303)

  response.cookies.set({
    name: gateCookie,
    value: gateToken,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    /* Secure só quando a visita é https — assim o cookie também funciona
       em teste local por http. */
    secure: httpsReal,
  })

  return response
}
