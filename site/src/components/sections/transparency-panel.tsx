import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { SectionHeader } from '@/components/ui/section-header'
import { Container, Section } from '@/components/ui/section'
import type { TransparencyPanelCapture } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { formatDate } from '@/lib/utils'

const localeTag: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
}

/**
 * PAINEL DISCRICIONÁRIAS E LEGAIS
 * ===============================
 * O bloco que abre a Transparência: a tela do painel público do Governo
 * Federal, como ela está no ar, antes da lista de documentos.
 *
 * A ordem é proposital. A pergunta de quem chega aqui — quanto a AIDEP
 * recebeu, de quem, e quanto ainda está em conta — está respondida no
 * painel do Transferegov, que é fonte oficial e não depende do que a
 * associação diz de si. A lista de documentos vem depois, para quem quer
 * o arquivo.
 *
 * É uma captura de tela, e não o PDF embutido: aparece de imediato, em
 * qualquer aparelho, sem leitor de PDF, sem páginas para virar e sem pedir
 * download a quem só quer conferir os números. O extrato em PDF e a
 * planilha linha a linha continuam na lista abaixo, com prévia e download.
 *
 * A imagem chega de `getPainelTransparencia()`: a que a associação enviou
 * pelo painel e, enquanto não houver nenhuma, a entregue com o site.
 *
 * A faixa verde diz de onde a tela veio e de quando ela é — a captura não
 * se atualiza sozinha, e omitir a data seria apresentar como atual um
 * número que pode ter mudado. A data é a impressa no cabeçalho do próprio
 * painel do governo, e é o cliente que a informa no envio.
 */
export async function TransparencyPanel({
  panel,
  locale,
}: {
  panel: TransparencyPanelCapture
  locale: Locale
}) {
  const t = await getTranslations({ locale, namespace: 'transparency.panel' })

  return (
    <Section surface="muted" ariaLabelledby="transparency-panel-title">
      <Container className="flex flex-col gap-stack">
        <SectionHeader
          id="transparency-panel-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />

        {/* A captura mora numa caixa, e não sangrada na seção: o painel do
            Governo Federal tem fundo branco e cabeçalho próprio, e sem a
            moldura em volta ele se confundiria com a página. O respiro
            interno é o que faz a tela parecer colada num quadro; os cantos
            de 5 px são o único arredondamento do site, e existem para
            separar o que é captura de fora do que é página. */}
        <figure className="flex flex-col overflow-hidden rounded-[5px] border border-(--border) bg-(--bg-raised)">
          <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 bg-brand-500 px-5 py-4 text-ink-950">
            <p className="text-body font-semibold tracking-[-0.01em]">
              {t('source')}
            </p>
            <p className="text-micro font-semibold uppercase tracking-[0.14em] text-ink-950/80">
              {t('capturedAt', {
                date: formatDate(panel.capturedAt, localeTag[locale]),
              })}
            </p>
          </figcaption>

          <div className="p-3 sm:p-4 lg:p-5">
            <Image
              src={panel.image.src}
              alt={panel.image.alt[locale]}
              width={panel.image.width}
              height={panel.image.height}
              /* A captura abre a página: entra na primeira leva de
                 imagens, sem esperar a rolagem. */
              priority
              sizes="(min-width: 1536px) 1400px, 100vw"
              className="h-auto w-full rounded-[5px] border border-(--border)"
            />
          </div>
        </figure>
      </Container>
    </Section>
  )
}
