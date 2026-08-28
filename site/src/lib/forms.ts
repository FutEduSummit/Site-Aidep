import { z } from 'zod'

export const interestValues = [
  'partnership',
  'donation',
  'projects',
  'press',
  'other',
] as const

export const partnerTypeValues = [
  'company',
  'public',
  'school',
  'club',
  'other',
] as const

export type InterestValue = (typeof interestValues)[number]
export type PartnerTypeValue = (typeof partnerTypeValues)[number]

export type FormMessages = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  interest: string
  organization: string
  partnerType: string
  consent: string
}

/** Mensagens neutras usadas na revalidação do servidor. */
export const serverMessages: FormMessages = {
  name: 'invalid_name',
  email: 'invalid_email',
  phone: 'invalid_phone',
  subject: 'invalid_subject',
  message: 'invalid_message',
  interest: 'invalid_interest',
  organization: 'invalid_organization',
  partnerType: 'invalid_partner_type',
  consent: 'invalid_consent',
}

const phoneField = (m: FormMessages) =>
  z
    .string()
    .trim()
    .max(24, { message: m.phone })
    .optional()
    .or(z.literal(''))

export function buildContactSchema(m: FormMessages) {
  return z.object({
    name: z.string().trim().min(3, { message: m.name }).max(120),
    email: z.email({ message: m.email }).max(160),
    phone: phoneField(m),
    subject: z.string().trim().min(3, { message: m.subject }).max(160),
    interest: z.enum(interestValues, { message: m.interest }),
    message: z.string().trim().min(20, { message: m.message }).max(4000),
    consent: z.literal(true, { message: m.consent }),
  })
}

export function buildPartnerSchema(m: FormMessages) {
  return z.object({
    name: z.string().trim().min(3, { message: m.name }).max(120),
    email: z.email({ message: m.email }).max(160),
    phone: phoneField(m),
    organization: z.string().trim().min(2, { message: m.organization }).max(160),
    role: z.string().trim().max(120).optional().or(z.literal('')),
    partnerType: z.enum(partnerTypeValues, { message: m.partnerType }),
    message: z.string().trim().min(20, { message: m.message }).max(4000),
    consent: z.literal(true, { message: m.consent }),
  })
}

export const contactServerSchema = buildContactSchema(serverMessages)
export const partnerServerSchema = buildPartnerSchema(serverMessages)

export type ContactValues = z.infer<typeof contactServerSchema>
export type PartnerValues = z.infer<typeof partnerServerSchema>

/**
 * Estados possíveis do envio.
 * `unconfigured` é fundamental: sem endpoint configurado o site NÃO exibe
 * sucesso — ele informa que a mensagem não foi transmitida e oferece o
 * e-mail institucional como caminho imediato.
 */
export type SubmitStatus = 'idle' | 'success' | 'error' | 'unconfigured' | 'invalid'

export type SubmitResult = {
  status: Exclude<SubmitStatus, 'idle'>
}
