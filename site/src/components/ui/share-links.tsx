'use client'

import { Check, Link2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

/** Compartilhamento: usa a API nativa quando existe e copia o link como alternativa. */
export function ShareLinks({ title }: { title: string }) {
  const t = useTranslations('actions')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2400)
    return () => clearTimeout(timer)
  }, [copied])

  async function share() {
    const url = window.location.href
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        /* Cancelado pelo usuário — segue para a cópia do link. */
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-micro font-semibold uppercase tracking-[0.16em] text-(--fg-subtle)">
        {t('share')}
      </span>
      <button
        type="button"
        onClick={share}
        className="inline-flex min-h-11 items-center gap-3 border border-(--border-strong) px-5 text-[0.75rem] font-semibold uppercase tracking-[0.1em] transition-colors duration-200 ease-brand hover:border-(--fg)"
      >
        {copied ? (
          <Check aria-hidden="true" className="size-4" strokeWidth={2} />
        ) : (
          <Link2 aria-hidden="true" className="size-4" strokeWidth={2} />
        )}
        {copied ? t('linkCopied') : t('copyLink')}
      </button>
    </div>
  )
}
