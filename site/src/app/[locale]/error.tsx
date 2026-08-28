'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Container, Section } from '@/components/ui/section'

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('error')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Section
      surface="dark"
      space="none"
      className="flex min-h-[70svh] items-center pt-18 lg:pt-22"
    >
      <Container className="flex flex-col gap-8 py-section">
        <span className="modulo" />
        <h1 className="max-w-[18ch] text-h1 font-bold tracking-[-0.04em]">
          {t('title')}
        </h1>
        <p className="max-w-[52ch] text-lead text-(--fg-muted)">
          {t('description')}
        </p>
        <Button
          type="button"
          onClick={reset}
          variant="accent"
          size="lg"
          className="self-start"
        >
          {t('action')}
        </Button>
      </Container>
    </Section>
  )
}
