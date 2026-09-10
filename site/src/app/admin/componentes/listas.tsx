'use client'

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useId } from 'react'
import { AreaDeTexto, Botao, Campo, Entrada } from './ui'

/**
 * LISTA DE TEXTOS
 * ===============
 * Parágrafos da apresentação de um projeto, itens de público-alvo,
 * resultados, itens de uma lista dentro da notícia.
 *
 * Escrita em português. A ordem dos itens é a ordem que aparece no site —
 * por isso as setas.
 */
export function ListaDeTextos({
  rotulo,
  itens,
  onChange,
  placeholder,
  multilinha = false,
  rotuloDeAdicionar = 'Acrescentar item',
  dica,
  erro,
}: {
  rotulo: string
  itens: string[]
  onChange: (itens: string[]) => void
  placeholder?: string
  multilinha?: boolean
  rotuloDeAdicionar?: string
  dica?: string
  erro?: string
}) {
  const uid = useId()
  const Controle = multilinha ? AreaDeTexto : Entrada

  function trocar(indice: number, texto: string) {
    const proximos = [...itens]
    proximos[indice] = texto
    onChange(proximos)
  }

  function mover(indice: number, direcao: -1 | 1) {
    const destino = indice + direcao
    if (destino < 0 || destino >= itens.length) return

    const proximos = [...itens]
    ;[proximos[indice], proximos[destino]] = [proximos[destino], proximos[indice]]
    onChange(proximos)
  }

  return (
    <Campo rotulo={rotulo} dica={dica} erro={erro}>
      <div className="flex flex-col gap-3">
        {itens.length === 0 ? (
          <p className="text-small text-(--fg-subtle)">Nenhum item ainda.</p>
        ) : null}

        {itens.map((item, indice) => (
          <div key={indice} className="flex items-start gap-2">
            <span className="mt-3 w-6 shrink-0 text-micro font-semibold tabular-nums text-(--fg-subtle)">
              {String(indice + 1).padStart(2, '0')}
            </span>

            <Controle
              id={`${uid}-${indice}`}
              value={item}
              placeholder={placeholder}
              rows={multilinha ? 3 : undefined}
              aria-label={`${rotulo}, item ${indice + 1}`}
              onChange={(evento) => trocar(indice, evento.target.value)}
            />

            <div className="flex shrink-0 flex-col">
              <button
                type="button"
                onClick={() => mover(indice, -1)}
                disabled={indice === 0}
                aria-label="Mover para cima"
                className="flex size-6 items-center justify-center text-(--fg-subtle) transition-colors hover:text-(--fg) disabled:opacity-30"
              >
                <ArrowUp aria-hidden="true" className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => mover(indice, 1)}
                disabled={indice === itens.length - 1}
                aria-label="Mover para baixo"
                className="flex size-6 items-center justify-center text-(--fg-subtle) transition-colors hover:text-(--fg) disabled:opacity-30"
              >
                <ArrowDown aria-hidden="true" className="size-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onChange(itens.filter((_, i) => i !== indice))}
              aria-label={`Remover item ${indice + 1}`}
              className="mt-1.5 flex size-9 shrink-0 items-center justify-center text-(--fg-subtle) transition-colors hover:text-danger"
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </button>
          </div>
        ))}

        <Botao
          type="button"
          variante="contorno"
          className="self-start"
          onClick={() => onChange([...itens, ''])}
        >
          <Plus aria-hidden="true" className="size-4" />
          {rotuloDeAdicionar}
        </Botao>
      </div>
    </Campo>
  )
}

/**
 * Moldura de um item repetível mais complexo — um local, uma métrica, um
 * passo de metodologia. Dá numeração, remoção e reordenação sem que cada
 * editor tenha de reescrever isso.
 */
export function ItemRepetivel({
  indice,
  total,
  titulo,
  onRemover,
  onMover,
  children,
}: {
  indice: number
  total: number
  titulo: string
  onRemover: () => void
  onMover: (direcao: -1 | 1) => void
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border border-(--border) bg-paper-2 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-subtle)">
          {titulo} {String(indice + 1).padStart(2, '0')}
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMover(-1)}
            disabled={indice === 0}
            aria-label="Mover para cima"
            className="flex size-8 items-center justify-center text-(--fg-subtle) transition-colors hover:text-(--fg) disabled:opacity-30"
          >
            <ArrowUp aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onMover(1)}
            disabled={indice === total - 1}
            aria-label="Mover para baixo"
            className="flex size-8 items-center justify-center text-(--fg-subtle) transition-colors hover:text-(--fg) disabled:opacity-30"
          >
            <ArrowDown aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            onClick={onRemover}
            aria-label="Remover"
            className="flex size-8 items-center justify-center text-(--fg-subtle) transition-colors hover:text-danger"
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>

      {children}
    </div>
  )
}

/** Troca dois itens de lugar — usado por todo editor repetível. */
export function trocarPosicao<T>(itens: T[], indice: number, direcao: -1 | 1): T[] {
  const destino = indice + direcao
  if (destino < 0 || destino >= itens.length) return itens

  const proximos = [...itens]
  ;[proximos[indice], proximos[destino]] = [proximos[destino], proximos[indice]]
  return proximos
}
