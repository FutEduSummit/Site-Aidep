'use client'

import { Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { importarProjetosDoSite } from '../acoes'
import { Aviso, Botao } from './ui'

export function BotaoDeImportacao() {
  const router = useRouter()
  const [estado, setEstado] = useState<'parado' | 'indo' | 'feito' | 'erro'>(
    'parado',
  )

  async function importar() {
    setEstado('indo')
    const resposta = await importarProjetosDoSite()

    if (resposta.ok) {
      setEstado('feito')
      router.refresh()
    } else {
      setEstado('erro')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Botao
        type="button"
        variante="contorno"
        carregando={estado === 'indo'}
        onClick={importar}
        className="self-start"
      >
        <Download aria-hidden="true" className="size-4" />
        Importar projetos do site
      </Botao>

      {estado === 'feito' ? (
        <Aviso tom="sucesso">
          Projetos importados. Eles agora aparecem em Projetos e podem ser
          editados por aqui.
        </Aviso>
      ) : null}

      {estado === 'erro' ? (
        <Aviso tom="erro">
          Não foi possível importar. Tente de novo em alguns instantes.
        </Aviso>
      ) : null}
    </div>
  )
}
