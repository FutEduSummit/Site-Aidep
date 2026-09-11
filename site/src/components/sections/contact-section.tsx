'use client'

import { useTranslations } from 'next-intl'
import { ContactChannels } from '@/components/sections/contact-channels'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'
import type { Locale } from '@/i18n/routing'

/**
 * CONTATO — fim da página inicial.
 *
 * Não existe mais página de Contato: falar com a associação é o último
 * passo natural de quem chegou ao fim da Home, e não um destino separado
 * que exige uma navegação a mais. O id `contato` é o destino de todos os
 * links de contato do site.
 *
 * Não há formulário. Os canais são os próprios da associação — o e-mail,
 * o telefone, o endereço e o Instagram —, e cada um abre no aplicativo de
 * quem está lendo. Um formulário aqui só acrescentaria um intermediário
 * entre a pessoa e a caixa de entrada que ela já sabe usar.
 *
 * O bloco dos canais em si é `ContactChannels`: os mesmos quatro fecham
 * também "Seja parceiro" e a página de Doações.
 */
export function ContactSection({ locale }: { locale: Locale }) {
  const t = useTranslations('contact')

  return (
    <Section id="contato" surface="light" ariaLabelledby="home-contact-title">
      <Container className="flex flex-col gap-stack">
        <SectionHeader
          id="home-contact-title"
          eyebrow={t('hero.eyebrow')}
          title={t('hero.title')}
          description={t('hero.lead')}
        />

        <ContactChannels locale={locale} />
      </Container>
    </Section>
  )
}
