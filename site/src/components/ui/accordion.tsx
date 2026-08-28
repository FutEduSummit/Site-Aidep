import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AccordionItem = {
  question: string
  answer: string
}

/**
 * Acordeão construído sobre `<details>`/`<summary>`.
 * Acessível por teclado por natureza, funciona sem JavaScript e respeita
 * movimento reduzido sem código extra.
 */
export function Accordion({
  items,
  className,
}: {
  items: AccordionItem[]
  className?: string
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      {items.map((item, index) => (
        <details
          key={`${item.question}-${index}`}
          className="group/faq border-t border-(--border) last:border-b"
          name="faq"
        >
          <summary
            data-focus-custom
            className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-h4 font-semibold tracking-[-0.02em] transition-colors duration-200 ease-brand hover:text-(--accent-text) focus-visible:text-(--accent-text) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus) [&::-webkit-details-marker]:hidden"
          >
            <span className="max-w-[46ch]">{item.question}</span>
            <span className="mt-1 flex size-8 shrink-0 items-center justify-center border border-(--border-strong) transition-transform duration-300 ease-brand group-open/faq:rotate-45">
              <Plus aria-hidden="true" strokeWidth={2} className="size-4" />
            </span>
          </summary>
          <div className="max-w-[68ch] pb-8 pr-12 text-body text-(--fg-muted)">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  )
}
