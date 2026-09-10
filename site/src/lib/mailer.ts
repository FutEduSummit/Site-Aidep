import ptMessages from '../../messages/pt.json'
import type { ContactValues, PartnerValues } from './forms'

/**
 * Envio dos formulários por e-mail, via API HTTP da Resend.
 *
 * Usamos a API direta em vez do SDK de propósito: é uma única chamada
 * `fetch`, não acrescenta dependência ao projeto e funciona em qualquer
 * runtime (Node ou Edge).
 *
 * Três variáveis controlam tudo — nenhuma delas está no código:
 *
 * - `RESEND_API_KEY`     chave da conta (https://resend.com/api-keys)
 * - `CONTACT_TO_EMAIL`   quem RECEBE as mensagens; aceita vários endereços
 *                        separados por vírgula
 * - `CONTACT_FROM_EMAIL` quem APARECE como remetente; precisa ser de um
 *                        domínio verificado na Resend
 *
 * Faltando qualquer uma, o envio por e-mail fica desligado e o site informa
 * isso com honestidade, sem simular sucesso. Trocar o e-mail de destino é
 * editar `CONTACT_TO_EMAIL` — não se mexe em código.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

type MailerConfig = {
  apiKey: string
  to: string[]
  from: string
}

/** Lê a configuração no momento do envio — nunca no carregamento do módulo. */
function readConfig(): MailerConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.CONTACT_FROM_EMAIL?.trim()
  const to = (process.env.CONTACT_TO_EMAIL ?? '')
    .split(',')
    .map((address) => address.trim())
    .filter(Boolean)

  if (!apiKey || !from || to.length === 0) return null

  return { apiKey, to, from }
}

export function mailerConfigured(): boolean {
  return readConfig() !== null
}

/** Rótulos reaproveitados do português do site, para o e-mail não repetir texto. */
const { interests, partnerTypes, fields, labels } = ptMessages.forms

type Row = { label: string; value: string }

function contactRows(data: ContactValues): Row[] {
  return [
    { label: fields.name, value: data.name },
    { label: fields.email, value: data.email },
    { label: fields.phone, value: data.phone || '—' },
    { label: fields.subject, value: data.subject },
    { label: fields.interest, value: interests[data.interest] },
    { label: fields.message, value: data.message },
  ]
}

function partnerRows(data: PartnerValues): Row[] {
  return [
    { label: fields.name, value: data.name },
    { label: fields.email, value: data.email },
    { label: fields.phone, value: data.phone || '—' },
    { label: fields.organization, value: data.organization },
    { label: fields.role, value: data.role || '—' },
    { label: labels.partnerType, value: partnerTypes[data.partnerType] },
    { label: labels.proposal, value: data.message },
  ]
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderText(title: string, rows: Row[], receivedAt: string): string {
  const body = rows.map((row) => `${row.label}:\n${row.value}`).join('\n\n')
  return `${title}\n\nRecebido em ${receivedAt}\n\n${body}\n`
}

function renderHtml(title: string, rows: Row[], receivedAt: string): string {
  const items = rows
    .map(
      (row) => `<tr>
        <th align="left" style="padding:12px 16px 4px;font:600 12px/1.4 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#6b6b6b;">${escapeHtml(row.label)}</th>
      </tr>
      <tr>
        <td style="padding:0 16px 16px;border-bottom:1px solid #e6e6e6;font:400 15px/1.6 system-ui,sans-serif;color:#141414;white-space:pre-wrap;">${escapeHtml(row.value)}</td>
      </tr>`,
    )
    .join('')

  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:24px;background:#f5f5f4;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e6e6e6;">
      <tr>
        <td style="padding:24px 16px 8px;font:700 20px/1.3 system-ui,sans-serif;color:#141414;">${escapeHtml(title)}</td>
      </tr>
      <tr>
        <td style="padding:0 16px 16px;font:400 13px/1.5 system-ui,sans-serif;color:#6b6b6b;">Recebido em ${escapeHtml(receivedAt)}</td>
      </tr>
      ${items}
    </table>
  </body>
</html>`
}

export type MailPayload =
  | { kind: 'contact'; data: ContactValues }
  | { kind: 'partnership'; data: PartnerValues }

/**
 * Envia a mensagem. `Reply-To` recebe o e-mail de quem escreveu, então
 * responder ao aviso responde direto à pessoa.
 */
export async function sendFormEmail(payload: MailPayload): Promise<boolean> {
  const config = readConfig()
  if (!config) return false

  const receivedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date())

  const { subject, title, rows } =
    payload.kind === 'contact'
      ? {
          subject: `[Site AIDEP] Contato — ${payload.data.subject}`,
          title: 'Novo contato pelo site',
          rows: contactRows(payload.data),
        }
      : {
          subject: `[Site AIDEP] Parceria — ${payload.data.organization}`,
          title: 'Nova proposta de parceria pelo site',
          rows: partnerRows(payload.data),
        }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.from,
        to: config.to,
        reply_to: payload.data.email,
        subject,
        text: renderText(title, rows, receivedAt),
        html: renderHtml(title, rows, receivedAt),
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      // Sem dados pessoais no log: só o motivo da recusa da API.
      console.error(
        `[mailer] Resend recusou o envio (${response.status}): ${await response.text()}`,
      )
      return false
    }

    return true
  } catch (error) {
    console.error('[mailer] falha de rede ao chamar a Resend:', error)
    return false
  }
}
