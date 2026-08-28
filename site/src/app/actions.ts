'use server'

import { contactServerSchema, partnerServerSchema, type SubmitResult } from '@/lib/forms'

/**
 * Envio dos formulários.
 *
 * Os dados são revalidados no servidor — a validação do cliente nunca é
 * a única. Enquanto `CONTACT_WEBHOOK_URL` não estiver configurada, a ação
 * devolve `unconfigured`: nada é transmitido e a interface diz isso com
 * clareza, em vez de simular um envio bem-sucedido.
 */
async function forward(kind: 'contact' | 'partnership', data: unknown): Promise<SubmitResult> {
  const endpoint = process.env.CONTACT_WEBHOOK_URL

  if (!endpoint) return { status: 'unconfigured' }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, data, receivedAt: new Date().toISOString() }),
      cache: 'no-store',
    })

    return response.ok ? { status: 'success' } : { status: 'error' }
  } catch {
    return { status: 'error' }
  }
}

export async function submitContact(payload: unknown): Promise<SubmitResult> {
  const parsed = contactServerSchema.safeParse(payload)
  if (!parsed.success) return { status: 'invalid' }
  return forward('contact', parsed.data)
}

export async function submitPartnership(payload: unknown): Promise<SubmitResult> {
  const parsed = partnerServerSchema.safeParse(payload)
  if (!parsed.success) return { status: 'invalid' }
  return forward('partnership', parsed.data)
}
