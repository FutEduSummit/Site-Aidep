'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Resultado } from '@/lib/admin/esquemas'
import { Botao } from './ui'

/**
 * REMOÇÃO COM CONFIRMAÇÃO NO PRÓPRIO BOTÃO
 * ========================================
 * O primeiro clique troca o rótulo para "Confirmar"; o segundo apaga. Sem
 * janela de confirmação do navegador, que é fácil de despachar no
 * automático — e sem apagar de primeira, que é o erro caro aqui.
 */
export function BotaoDeRemocao({
  id,
  nome,
  aoRemover,
  redirecionarPara,
}: {
  id: string
  nome: string
  aoRemover: (id: string) => Promise<Resultado>
  redirecionarPara?: string
}) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState(false)
  const [removendo, setRemovendo] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function remover() {
    if (!confirmando) {
      setConfirmando(true)
      return
    }

    setRemovendo(true)
    const resposta = await aoRemover(id)

    if (!resposta.ok) {
      setErro(resposta.erro)
      setRemovendo(false)
      setConfirmando(false)
      return
    }

    if (redirecionarPara) router.push(redirecionarPara)
    router.refresh()
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Botao
        type="button"
        variante={confirmando ? 'perigo' : 'discreto'}
        carregando={removendo}
        onClick={remover}
        onBlur={() => setConfirmando(false)}
        aria-label={
          confirmando ? `Confirmar remoção de ${nome}` : `Remover ${nome}`
        }
      >
        <Trash2 aria-hidden="true" className="size-4" />
        {confirmando ? 'Confirmar' : 'Remover'}
      </Botao>

      {erro ? <span className="text-micro text-danger">{erro}</span> : null}
    </span>
  )
}
