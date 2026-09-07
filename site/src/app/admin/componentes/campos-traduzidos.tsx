'use client'

import { ChevronDown, Languages } from 'lucide-react'
import { useId, useState } from 'react'
import type { Localized } from '@/content/types'
import { cn } from '@/lib/utils'
import { AreaDeTexto, Campo, Entrada } from './ui'

type Props = {
  rotulo: string
  valor: Localized
  onChange: (valor: Localized) => void
  multilinha?: boolean
  linhas?: number
  erro?: string
  dica?: string
  opcional?: boolean
  placeholder?: string
}

/**
 * CAMPO NOS TRÊS IDIOMAS
 * ======================
 * O português é o que importa preencher. Inglês e espanhol ficam atrás de
 * um "Ver traduções" fechado, para quem quiser escrever a versão de cada
 * idioma — nada é traduzido automaticamente.
 *
 * Deixar em branco não abre buraco no site: `lib/idiomas.ts` completa com o
 * português na hora de exibir. Um visitante inglês vê o texto em português
 * em vez de um espaço vazio, e a associação traduz quando puder.
 */
export function CamposTraduzidos({
  rotulo,
  valor,
  onChange,
  multilinha = false,
  linhas = 4,
  erro,
  dica,
  opcional,
  placeholder,
}: Props) {
  const uid = useId()
  const preenchidas = Boolean(valor.en.trim() || valor.es.trim())
  /* Já traduzido abre visível: quem traduziu vai querer conferir. */
  const [aberto, setAberto] = useState(preenchidas)

  const Controle = multilinha ? AreaDeTexto : Entrada

  function definir(idioma: keyof Localized, texto: string) {
    onChange({ ...valor, [idioma]: texto })
  }

  return (
    <div className="flex flex-col gap-2">
      <Campo
        htmlFor={`${uid}-pt`}
        rotulo={rotulo}
        erro={erro}
        dica={dica}
        opcional={opcional}
      >
        <Controle
          id={`${uid}-pt`}
          value={valor.pt}
          placeholder={placeholder}
          rows={multilinha ? linhas : undefined}
          aria-invalid={erro ? true : undefined}
          onChange={(evento) => definir('pt', evento.target.value)}
        />
      </Campo>

      <div className="border-l-2 border-(--border) pl-3">
        <button
          type="button"
          onClick={() => setAberto(!aberto)}
          aria-expanded={aberto}
          className="inline-flex min-h-9 items-center gap-2 text-micro font-semibold uppercase tracking-[0.12em] text-(--fg-subtle) transition-colors duration-150 hover:text-(--fg)"
        >
          <Languages aria-hidden="true" className="size-3.5" />
          {aberto ? 'Ocultar traduções' : 'Traduções'}
          <span className="font-normal normal-case tracking-normal">
            {preenchidas ? (
              <span className="text-brand-700">· preenchidas</span>
            ) : (
              '· opcional'
            )}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-3.5 transition-transform duration-150',
              aberto && 'rotate-180',
            )}
          />
        </button>

        {aberto ? (
          <div className="mt-3 flex flex-col gap-4 pb-1">
            <p className="text-micro leading-relaxed tracking-normal text-(--fg-subtle)">
              Em branco, o site mostra o texto em português também nestes
              idiomas.
            </p>

            <Campo htmlFor={`${uid}-en`} rotulo="Inglês" opcional>
              <Controle
                id={`${uid}-en`}
                value={valor.en}
                rows={multilinha ? linhas : undefined}
                onChange={(evento) => definir('en', evento.target.value)}
              />
            </Campo>

            <Campo htmlFor={`${uid}-es`} rotulo="Espanhol" opcional>
              <Controle
                id={`${uid}-es`}
                value={valor.es}
                rows={multilinha ? linhas : undefined}
                onChange={(evento) => definir('es', evento.target.value)}
              />
            </Campo>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** Objeto vazio nos três idiomas — ponto de partida de todo campo novo. */
export function textoVazio(pt = ''): Localized {
  return { pt, en: '', es: '' }
}
