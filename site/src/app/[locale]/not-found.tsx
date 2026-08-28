import { getTranslations } from 'next-intl/server'
import { ButtonLink } from '@/components/ui/button'
import { Container, Section } from '@/components/ui/section'

export default async function LocaleNotFound() {
  const t = await getTranslations('notFound')

  return (
    <Section
      surface="dark"
      space="none"
      className="flex min-h-[80svh] items-center pt-18 lg:pt-22"
    >
      <Container className="flex flex-col gap-8 py-section">
        <p className="text-display-xl font-extrabold tracking-[-0.05em] text-(--accent)">
          {t('code')}
        </p>
        <h1 className="max-w-[18ch] text-h1 font-bold tracking-[-0.04em]">
          {t('title')}
        </h1>
        <p className="max-w-[52ch] text-lead text-(--fg-muted)">
          {t('description')}
        </p>
        <ButtonLink href="/" variant="accent" size="lg" className="self-start">
          {t('action')}
        </ButtonLink>
      </Container>
    </Section>
  )
}
