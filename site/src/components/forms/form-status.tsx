'use client'

import { Check, CircleAlert, Mail, TriangleAlert } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ButtonExternal } from '@/components/ui/button'
import { site } from '@/content/site'
import type { SubmitStatus } from '@/lib/forms'
import { cn } from '@/lib/utils'

type FormStatusProps = {
  status: SubmitStatus
  /** Assunto e corpo já preenchidos para o envio manual por e-mail. */
  mailto?: { subject: string; body: string }
  onReset?: () => void
}

const tones: Record<string, string> = {
  success: 'border-success bg-success-soft text-ink-900',
  error: 'border-danger bg-danger-soft text-ink-900',
  invalid: 'border-danger bg-danger-soft text-ink-900',
  unconfigured: 'border-(--border-strong) bg-(--bg-raised) text-(--fg)',
}

export function FormStatus({ status, mailto, onReset }: FormStatusProps) {
  const t = useTranslations('forms.submit')
  const tErrors = useTranslations('forms.errors')

  if (status === 'idle') return null

  const content = {
    success: { title: t('successTitle'), description: t('successDescription'), Icon: Check },
    error: { title: t('errorTitle'), description: t('errorDescription'), Icon: CircleAlert },
    invalid: { title: t('errorTitle'), description: tErrors('summary'), Icon: TriangleAlert },
    unconfigured: {
      title: t('unconfiguredTitle'),
      description: t('unconfiguredDescription'),
      Icon: TriangleAlert,
    },
  }[status]

  const { Icon } = content
  const mailHref = mailto
    ? `mailto:${site.contact.email}?subject=${encodeURIComponent(mailto.subject)}&body=${encodeURIComponent(mailto.body)}`
    : `mailto:${site.contact.email}`

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col gap-4 border p-6',
        tones[status] ?? tones.unconfigured,
      )}
    >
      <p className="flex items-center gap-3 text-h4 font-semibold tracking-[-0.02em]">
        <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={2} />
        {content.title}
      </p>

      <p className="max-w-[62ch] text-small opacity-90">{content.description}</p>

      {(status === 'unconfigured' || status === 'error') && mailto ? (
        <ButtonExternal
          href={mailHref}
          variant="primary"
          icon="none"
          className="self-start"
        >
          <Mail aria-hidden="true" className="size-4" />
          {t('mailtoAction')}
        </ButtonExternal>
      ) : null}

      {status === 'success' && onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="link-underline self-start text-[0.8125rem] font-semibold uppercase tracking-[0.1em]"
        >
          {t('newMessage')}
        </button>
      ) : null}
    </div>
  )
}
