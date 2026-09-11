import { WhatsappIcon } from '@/components/ui/whatsapp-icon'
import { site } from '@/content/site'

/**
 * BOTÃO FLUTUANTE DO WHATSAPP
 * ===========================
 * Fica no canto inferior direito, sobre a página, em todas as rotas do
 * site. É o atalho para o canal que a associação de fato atende — o mesmo
 * número publicado no telefone dos canais de contato.
 *
 * Três decisões que valem explicar:
 *
 * - **O verde é o do WhatsApp, não o da marca.** Os dois são verdes e
 *   parecidos, e é justamente por isso: no verde da AIDEP o botão viraria
 *   mais um elemento da página, quando o que se reconhece de relance é a
 *   cor do aplicativo junto do símbolo dele.
 * - **O afastamento respeita a área segura.** `env(safe-area-inset-*)`
 *   mantém o botão acima da barra de gestos do iPhone — o layout já
 *   declara `viewportFit: 'cover'`, então sem isso ele encostaria nela.
 * - **Não aparece sem número.** Com `whatsapp: null` em `content/site.ts`
 *   o botão simplesmente não é renderizado, como todo canal da associação
 *   que ainda não foi confirmado.
 *
 * O foco visível vem do `:focus-visible` global; a conversa abre em aba
 * nova para quem está lendo não perder a página.
 */
export function WhatsappButton({ label }: { label: string }) {
  const numero = site.contact.whatsapp

  if (!numero) return null

  return (
    <a
      href={`https://wa.me/${numero}`}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className={[
        'fixed z-50 inline-flex size-14 items-center justify-center rounded-full',
        'bottom-[max(1.25rem,env(safe-area-inset-bottom))]',
        'right-[max(1.25rem,env(safe-area-inset-right))]',
        'bg-[#25d366] text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)]',
        'transition-transform duration-200 ease-brand hover:scale-105',
        'motion-reduce:transition-none motion-reduce:hover:scale-100',
      ].join(' ')}
    >
      <WhatsappIcon className="size-7" />
    </a>
  )
}
