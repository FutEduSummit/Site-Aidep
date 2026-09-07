'use client'

import { Heading2, List, Plus, Quote, Type } from 'lucide-react'
import type { BlocoPayload } from '@/lib/admin/esquemas'
import { AreaDeTexto, Campo, Entrada } from './ui'
import { ItemRepetivel, ListaDeTextos, trocarPosicao } from './listas'

/**
 * CORPO DA NOTÍCIA
 * ================
 * O texto da notícia não é HTML solto: é uma sequência de blocos com tipo
 * declarado — parágrafo, subtítulo, lista e citação. É o mesmo formato que
 * a página de leitura já sabe renderizar (`NewsBlock`), e é o que garante
 * que a tipografia do site continue valendo para conteúdo que o cliente
 * escreve sozinho, sem colar formatação de outro lugar.
 *
 * O texto é escrito em português. O site exibe os mesmos blocos nas
 * versões em inglês e espanhol da notícia.
 */

const tipos = [
  { tipo: 'paragraph' as const, rotulo: 'Parágrafo', Icone: Type },
  { tipo: 'heading' as const, rotulo: 'Subtítulo', Icone: Heading2 },
  { tipo: 'list' as const, rotulo: 'Lista', Icone: List },
  { tipo: 'quote' as const, rotulo: 'Citação', Icone: Quote },
]

const rotuloDoTipo: Record<BlocoPayload['type'], string> = {
  paragraph: 'Parágrafo',
  heading: 'Subtítulo',
  list: 'Lista',
  quote: 'Citação',
}

function blocoNovo(tipo: BlocoPayload['type']): BlocoPayload {
  if (tipo === 'list') return { type: 'list', items: [''] }
  if (tipo === 'quote') return { type: 'quote', text: '', cite: '' }
  return { type: tipo, text: '' }
}

export function EditorDeBlocos({
  blocos,
  onChange,
  erro,
}: {
  blocos: BlocoPayload[]
  onChange: (blocos: BlocoPayload[]) => void
  erro?: string
}) {
  function trocar(indice: number, bloco: BlocoPayload) {
    const proximos = [...blocos]
    proximos[indice] = bloco
    onChange(proximos)
  }

  return (
    <Campo
      rotulo="Texto da notícia"
      erro={erro}
      dica="Monte o texto em blocos. A tipografia do site é aplicada automaticamente a cada tipo."
    >
      <div className="flex flex-col gap-4">
        {blocos.length === 0 ? (
          <p className="text-small text-(--fg-subtle)">
            Nenhum bloco ainda. Comece por um parágrafo.
          </p>
        ) : null}

        {blocos.map((bloco, indice) => (
          <ItemRepetivel
            key={indice}
            indice={indice}
            total={blocos.length}
            titulo={rotuloDoTipo[bloco.type]}
            onRemover={() => onChange(blocos.filter((_, i) => i !== indice))}
            onMover={(direcao) => onChange(trocarPosicao(blocos, indice, direcao))}
          >
            {bloco.type === 'list' ? (
              <ListaDeTextos
                rotulo="Itens da lista"
                itens={bloco.items}
                rotuloDeAdicionar="Acrescentar item da lista"
                onChange={(items) => trocar(indice, { type: 'list', items })}
              />
            ) : bloco.type === 'heading' ? (
              <Campo rotulo="Subtítulo">
                <Entrada
                  value={bloco.text}
                  placeholder="Ex.: O que esperar da programação"
                  onChange={(evento) =>
                    trocar(indice, { type: 'heading', text: evento.target.value })
                  }
                />
              </Campo>
            ) : bloco.type === 'quote' ? (
              <div className="flex flex-col gap-4">
                <Campo rotulo="Citação">
                  <AreaDeTexto
                    rows={3}
                    value={bloco.text}
                    onChange={(evento) =>
                      trocar(indice, {
                        type: 'quote',
                        text: evento.target.value,
                        cite: bloco.cite,
                      })
                    }
                  />
                </Campo>
                <Campo
                  rotulo="Quem disse"
                  opcional
                  dica="Nome e cargo de quem falou, ou a área responsável."
                >
                  <Entrada
                    value={bloco.cite ?? ''}
                    onChange={(evento) =>
                      trocar(indice, {
                        type: 'quote',
                        text: bloco.text,
                        cite: evento.target.value,
                      })
                    }
                  />
                </Campo>
              </div>
            ) : (
              <Campo rotulo="Parágrafo">
                <AreaDeTexto
                  rows={5}
                  value={bloco.text}
                  onChange={(evento) =>
                    trocar(indice, {
                      type: 'paragraph',
                      text: evento.target.value,
                    })
                  }
                />
              </Campo>
            )}
          </ItemRepetivel>
        ))}

        <div className="flex flex-wrap items-center gap-2 border-t border-(--border) pt-4">
          <span className="inline-flex items-center gap-1.5 text-micro font-semibold uppercase tracking-[0.12em] text-(--fg-subtle)">
            <Plus aria-hidden="true" className="size-3.5" />
            Acrescentar
          </span>

          {tipos.map(({ tipo, rotulo, Icone }) => (
            <button
              key={tipo}
              type="button"
              onClick={() => onChange([...blocos, blocoNovo(tipo)])}
              className="inline-flex min-h-9 items-center gap-2 border border-(--border-strong) px-3 text-[0.75rem] font-semibold transition-colors duration-150 hover:border-(--fg) hover:bg-(--overlay)"
            >
              <Icone aria-hidden="true" className="size-3.5" />
              {rotulo}
            </button>
          ))}
        </div>
      </div>
    </Campo>
  )
}
