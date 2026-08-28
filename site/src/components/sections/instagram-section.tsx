'use client'

import Image from 'next/image'
import { AtSign } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { MaskedWords } from '@/components/motion/animated-text'
import { GrowLine } from '@/components/motion/grow-line'
import { Reveal } from '@/components/motion/reveal'
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger'
import { ButtonExternal } from '@/components/ui/button'
import { Container, Section } from '@/components/ui/section'
import { instagramPosts } from '@/content/media'
import { site } from '@/content/site'
import type { Locale } from '@/i18n/routing'

/**
 * Instagram.
 * Não há integração com a API do Instagram — nada é simulado. Os posts
 * exibidos vêm de `content/media.ts`; sem posts cadastrados, a seção
 * mantém apenas a chamada para o perfil oficial.
 */
export function InstagramSection({ locale }: { locale: Locale }) {
  const t = useTranslations('home.instagram')
  const tActions = useTranslations('actions')

  return (
    <Section surface="dark" ariaLabelledby="home-instagram-title">
      <Container className="flex flex-col gap-stack">
        <GrowLine />

        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal duration={0.5}>
              <p className="eyebrow mb-8">{t('eyebrow')}</p>
            </Reveal>
            <MaskedWords
              id="home-instagram-title"
              text={t('title')}
              className="max-w-[18ch] text-h2 font-bold tracking-[-0.03em]"
            />
            <Reveal delay={0.1} distance={24}>
              <p className="mt-8 max-w-[46ch] text-lead text-(--fg-muted)">
                {t('description')}
              </p>
            </Reveal>
          </div>

          <div className="flex flex-col items-start gap-6 lg:col-span-4 lg:col-start-9 lg:items-end">
            <Reveal distance={24}>
              <p className="flex items-center gap-3 text-h4 font-semibold tracking-[-0.02em]">
                <AtSign aria-hidden="true" className="size-5 text-(--accent)" />
                {t('handle')}
              </p>
            </Reveal>
            <Reveal distance={24} delay={0.08}>
              <ButtonExternal
                href={site.social.instagram.url}
                variant="accent"
                aria-label={`${tActions('openInstagram')} — ${site.social.instagram.handle}`}
              >
                {tActions('openInstagram')}
              </ButtonExternal>
            </Reveal>
          </div>
        </div>

        {instagramPosts.length > 0 ? (
          <StaggerContainer
            as="ul"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {instagramPosts.map((post) => (
              <StaggerItem key={post.id} as="li">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group/post relative block aspect-square overflow-hidden"
                >
                  <Image
                    src={post.image.src}
                    alt={post.image.alt[locale]}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
                    className="object-cover transition-transform duration-700 ease-brand fine:motion-safe:group-hover/post:scale-105"
                  />
                </a>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : null}
      </Container>
    </Section>
  )
}
