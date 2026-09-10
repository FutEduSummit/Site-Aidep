'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Resultado } from '@/lib/admin/esquemas'
import { cn } from '@/lib/utils'
import { TrilhoDaChave } from './ui'

/**
 * LIGAR E DESLIGAR DO SITE, NA PRÓPRIA LISTA
 * ==========================================
 * Publicar e voltar para rascunho é a decisão mais frequente do painel, e
 * era a única que exigia abrir o item, rolar até o fim do formulário e
 * salvar. Aqui ela é um clique, na linha onde o cliente já está olhando.
 *
 * O rótulo ao lado diz o estado em palavra — "No site" ou "Rascunho" —
 * porque cor e posição do botão sozinhas não respondem "isto está no ar?"
 * a quem chega na página pela primeira vez.
 *
 * A troca aparece na hora e volta atrás se o servidor recusar: numa lista
 * de trinta linhas, esperar a resposta para ver a chave mexer faz o clique
 * parecer perdido. Depois do `refresh`, o "Ver no site" e o resto da linha
 * chegam coerentes com o novo estado.
 */
export function InterruptorDePublicacao({
  id,
  nome,
  publicado,
  aoAlternar,
}: {
  id: string
  /** Aparece no rótulo assistivo: "No site: Prestação de contas". */
  nome: string
  publicado: boolean
  aoAlternar: (id: string, publicado: boolean) => Promise<Resultado>
}) {
  const router = useRouter()
  const [ligado, setLigado] = useState(publicado)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function alternar() {
    if (salvando) return

    const proximo = !ligado

    setErro(null)
    setLigado(proximo)
    setSalvando(true)

    const resposta = await aoAlternar(id, proximo)

    if (!resposta.ok) {
      setLigado(!proximo)
      setErro(resposta.erro)
      setSalvando(false)
      return
    }

    setSalvando(false)
    router.refresh()
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={ligado}
          /* Nome fixo, e não "Publicar"/"Tirar do site" alternando: o
             estado quem diz é o `aria-checked`, e nome de controle que
             muda a cada clique confunde a navegação por leitor de tela. */
          aria-label={`No site: ${nome}`}
          disabled={salvando}
          onClick={alternar}
          className="flex cursor-pointer items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus)"
        >
          <TrilhoDaChave ligado={ligado} esmaecido={salvando} />
        </button>

        <span
          className={cn(
            'text-micro font-semibold uppercase tracking-[0.12em]',
            ligado ? 'text-brand-700' : 'text-(--fg-subtle)',
          )}
        >
          {ligado ? 'No site' : 'Rascunho'}
        </span>
      </span>

      {erro ? <span className="text-micro text-danger">{erro}</span> : null}
    </span>
  )
}
