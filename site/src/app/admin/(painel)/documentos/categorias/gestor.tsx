'use client'

import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { CategoryColor, Localized } from '@/content/types'
import { cores, sugerirSlug, type CategoriaPayload } from '@/lib/admin/esquemas'
import type { LinhaCategoria } from '@/lib/cms/tipos'
import { coresDeCategoria } from '@/lib/documentos'
import { cn } from '@/lib/utils'
import { apagarCategoria, salvarCategoria } from '../../../acoes'
import { BotaoDeRemocao } from '../../../componentes/botao-de-remocao'
import {
  CamposTraduzidos,
  textoVazio,
} from '../../../componentes/campos-traduzidos'
import {
  Aviso,
  Botao,
  Campo,
  Cartao,
  Entrada,
  Selecao,
} from '../../../componentes/ui'

const nomeDaCor: Record<CategoryColor, string> = {
  verde: 'Verde',
  azul: 'Azul',
  ambar: 'Âmbar',
  roxo: 'Roxo',
  cinza: 'Cinza',
  vermelho: 'Vermelho',
}

function comoTexto(bruto: unknown): Localized {
  const fonte = (bruto ?? {}) as Record<string, unknown>
  return {
    pt: typeof fonte.pt === 'string' ? fonte.pt : '',
    en: typeof fonte.en === 'string' ? fonte.en : '',
    es: typeof fonte.es === 'string' ? fonte.es : '',
  }
}

type Rascunho = {
  id: string
  rotulo: Localized
  cor: CategoryColor
  ordem: number
  /** Categoria que já existe: o identificador não pode mais mudar. */
  existente: boolean
}

function vazia(ordem: number): Rascunho {
  return {
    id: '',
    rotulo: textoVazio(),
    cor: 'cinza',
    ordem,
    existente: false,
  }
}

function Editor({
  rascunho,
  onSalvo,
  onCancelar,
}: {
  rascunho: Rascunho
  onSalvo: () => void
  onCancelar?: () => void
}) {
  const [estado, setEstado] = useState(rascunho)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [aviso, setAviso] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function salvar() {
    setAviso(null)
    setErros({})
    setSalvando(true)

    /* O identificador é o que liga a categoria aos documentos: para uma
       categoria nova ele nasce do rótulo, e para uma existente é imutável. */
    const id = estado.existente ? estado.id : sugerirSlug(estado.rotulo.pt)

    if (!id) {
      setErros({ 'rotulo.pt': 'Escreva o nome da categoria.' })
      setSalvando(false)
      return
    }

    const payload: CategoriaPayload = {
      id,
      rotulo: estado.rotulo,
      cor: estado.cor,
      ordem: estado.ordem,
    }

    const resposta = await salvarCategoria(payload)
    setSalvando(false)

    if (!resposta.ok) {
      setErros(resposta.campos ?? {})
      setAviso(resposta.erro)
      return
    }

    onSalvo()
  }

  return (
    <div className="flex flex-col gap-5">
      <CamposTraduzidos
        rotulo="Nome da categoria"
        valor={estado.rotulo}
        erro={erros['rotulo.pt']}
        placeholder="Ex.: Painel"
        onChange={(rotulo) => setEstado({ ...estado, rotulo })}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Campo htmlFor={`cor-${estado.id || 'nova'}`} rotulo="Cor do selo">
          <Selecao
            id={`cor-${estado.id || 'nova'}`}
            value={estado.cor}
            onChange={(evento) =>
              setEstado({ ...estado, cor: evento.target.value as CategoryColor })
            }
          >
            {cores.map((cor) => (
              <option key={cor} value={cor}>
                {nomeDaCor[cor]}
              </option>
            ))}
          </Selecao>
        </Campo>

        <Campo
          htmlFor={`ordem-${estado.id || 'nova'}`}
          rotulo="Ordem"
          dica="Define a posição no filtro da página."
        >
          <Entrada
            id={`ordem-${estado.id || 'nova'}`}
            type="number"
            min={0}
            max={999}
            value={estado.ordem}
            onChange={(evento) =>
              setEstado({ ...estado, ordem: Number(evento.target.value) || 0 })
            }
          />
        </Campo>

        <Campo rotulo="Prévia do selo">
          <span className="flex min-h-11 items-center">
            <span
              className={cn(
                'inline-flex items-center px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.1em]',
                coresDeCategoria[estado.cor],
              )}
            >
              {estado.rotulo.pt || 'Categoria'}
            </span>
          </span>
        </Campo>
      </div>

      {aviso ? <Aviso tom="erro">{aviso}</Aviso> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Botao type="button" carregando={salvando} onClick={salvar}>
          {estado.existente ? 'Salvar' : 'Criar categoria'}
        </Botao>
        {onCancelar ? (
          <Botao
            type="button"
            variante="discreto"
            disabled={salvando}
            onClick={onCancelar}
          >
            Cancelar
          </Botao>
        ) : null}
      </div>
    </div>
  )
}

export function GestorDeCategorias({
  categorias,
}: {
  categorias: LinhaCategoria[]
}) {
  const router = useRouter()
  const [editando, setEditando] = useState<string | null>(null)
  const [criando, setCriando] = useState(false)

  function atualizar() {
    setEditando(null)
    setCriando(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {categorias.map((categoria) => {
          const rotulo = comoTexto(categoria.rotulo)
          const cor = (cores as readonly string[]).includes(categoria.cor)
            ? (categoria.cor as CategoryColor)
            : 'cinza'

          return (
            <li key={categoria.id}>
              <div className="flex flex-col gap-4 border border-(--border) bg-(--bg) p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'inline-flex items-center px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.1em]',
                        coresDeCategoria[cor],
                      )}
                    >
                      {rotulo.pt || categoria.id}
                    </span>
                    <code className="text-micro text-(--fg-subtle)">
                      {categoria.id}
                    </code>
                  </div>

                  <div className="flex items-center gap-2">
                    <Botao
                      type="button"
                      variante="contorno"
                      onClick={() =>
                        setEditando(editando === categoria.id ? null : categoria.id)
                      }
                    >
                      {editando === categoria.id ? 'Fechar' : 'Editar'}
                    </Botao>
                    <BotaoDeRemocao
                      id={categoria.id}
                      nome={rotulo.pt || categoria.id}
                      aoRemover={apagarCategoria}
                    />
                  </div>
                </div>

                {editando === categoria.id ? (
                  <div className="border-t border-(--border) pt-4">
                    <Editor
                      rascunho={{
                        id: categoria.id,
                        rotulo,
                        cor,
                        ordem: categoria.ordem,
                        existente: true,
                      }}
                      onSalvo={atualizar}
                      onCancelar={() => setEditando(null)}
                    />
                  </div>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>

      {criando ? (
        <Cartao titulo="Nova categoria">
          <Editor
            rascunho={vazia(categorias.length + 1)}
            onSalvo={atualizar}
            onCancelar={() => setCriando(false)}
          />
        </Cartao>
      ) : (
        <Botao
          type="button"
          variante="contorno"
          className="self-start"
          onClick={() => setCriando(true)}
        >
          <Plus aria-hidden="true" className="size-4" />
          Nova categoria
        </Botao>
      )}
    </div>
  )
}
