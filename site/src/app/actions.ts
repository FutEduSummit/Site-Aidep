'use server'

import {
  contactServerSchema,
  partnerServerSchema,
  type SubmitResult,
} from '@/lib/forms'
import { mailerConfigured, sendFormEmail, type MailPayload } from '@/lib/mailer'

/**
 * Envio dos formulários.
 *
 * Os dados são revalidados no servidor — a validação do cliente nunca é
 * a única. Existem dois canais possíveis, e nenhum deles está no código:
 *
 * 1. E-mail (Resend) — canal principal. Ligado por `RESEND_API_KEY`,
 *    `CONTACT_TO_EMAIL` e `CONTACT_FROM_EMAIL`. O e-mail que recebe as
 *    mensagens é `CONTACT_TO_EMAIL`, e trocá-lo é editar essa variável.
 * 2. Webhook (`CONTACT_WEBHOOK_URL`) — opcional, para integrar um CRM ou
 *    uma planilha em paralelo ao e-mail.
 *
 * Sem nenhum canal configurado a ação devolve `unconfigured`: nada é
 * transmitido e a interface diz isso com clareza, em vez de simular um
 * envio bem-sucedido. Com os dois, um canal fora do ar não derruba o outro
 * — basta um entregar para a pessoa receber a confirmação.
 */
async function forwardToWebhook(
  kind: MailPayload['kind'],
  data: unknown,
): Promise<boolean> {
  const endpoint = process.env.CONTACT_WEBHOOK_URL
  if (!endpoint) return false

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, data, receivedAt: new Date().toISOString() }),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error(`[forms] webhook recusou o envio (${response.status})`)
      return false
    }

    return true
  } catch (error) {
    console.error('[forms] falha de rede ao chamar o webhook:', error)
    return false
  }
}

async function forward(payload: MailPayload): Promise<SubmitResult> {
  const hasWebhook = Boolean(process.env.CONTACT_WEBHOOK_URL)

  if (!mailerConfigured() && !hasWebhook) return { status: 'unconfigured' }

  const results = await Promise.all([
    mailerConfigured() ? sendFormEmail(payload) : Promise.resolve(false),
    hasWebhook
      ? forwardToWebhook(payload.kind, payload.data)
      : Promise.resolve(false),
  ])

  return results.some(Boolean) ? { status: 'success' } : { status: 'error' }
}

export async function submitContact(payload: unknown): Promise<SubmitResult> {
  const parsed = contactServerSchema.safeParse(payload)
  if (!parsed.success) return { status: 'invalid' }
  return forward({ kind: 'contact', data: parsed.data })
}

export async function submitPartnership(payload: unknown): Promise<SubmitResult> {
  const parsed = partnerServerSchema.safeParse(payload)
  if (!parsed.success) return { status: 'invalid' }
  return forward({ kind: 'partnership', data: parsed.data })
}
