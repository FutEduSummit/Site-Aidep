'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import type { Localized } from '@/content/types'
import { documentoSchema, type DocumentoPayload } from '@/lib/admin/esquemas'
import type { LinhaCategoria, LinhaDocumento, LinhaProjeto } from '@/lib/cms/tipos'
import { salvarDocumento } from '../../acoes'
import { CamposTraduzidos, textoVazio } from '../../componentes/campos-traduzidos'
import { EnvioDeDocumento, type DocumentoEnviado } from '../../componentes/envio'
import {
  Aviso,
  Botao,
  Campo,
  Cartao,
  Entrada,
  Interruptor,
  Selecao,
} from '../../componentes/ui'

type Props = {
  categorias: LinhaCategoria[]
  projetos: Pick<LinhaProjeto, 'slug' | 'nome'>[]
  inicial?: LinhaDocumento
}

type Estado = {
  titulo: Localized
  conteudo: Localized
  categoriaId: string
  ano: number
  publicadoEm: string
  arquivo: DocumentoEnviado
  projetoSlug: string
  publicado: boolean
}

function comoTexto(bruto: unknown): Localized {
  const fonte = (bruto ?? {}) as Record<string, unknown>
  return {
    pt: typeof fonte.pt === 'string' ? fonte.pt : '',
    en: typeof fonte.en === 'string' ? fonte.en : '',
    es: typeof fonte.es === 'string' ? fonte.es : '',
  }
}

const hoje = () => new Date().toISOString().slice(0, 10)

function estadoInicial(
  inicial: LinhaDocumento | undefined,
  categorias: LinhaCategoria[],
): Estado {
  if (!inicial) {
    return {
      titulo: textoVazio(),
      conteudo: textoVazio(),
      categoriaId: categorias[0]?.id ?? '',
      ano: new Date().getFullYear(),
      publicadoEm: hoje(),
      arquivo: {
        arquivoUrl: '',
        arquivoPath: '',
        arquivoNome: '',
        formato: 'pdf',
        tamanhoBytes: null,
        miniatura: null,
      },
      projetoSlug: '',
      publicado: true,
    }
  }

  return {
    titulo: comoTexto(inicial.titulo),
    conteudo: comoTexto(inicial.conteudo),
    categoriaId: inicial.categoria_id ?? categorias[0]?.id ?? '',
    ano: inicial.ano,
    publicadoEm: inicial.publicado_em.slice(0, 10),
    arquivo: {
      arquivoUrl: inicial.arquivo_url,
      arquivoPath: inicial.arquivo_path ?? '',
      arquivoNome: inicial.arquivo_nome ?? '',
      formato: inicial.formato as DocumentoEnviado['formato'],
      tamanhoBytes: inicial.tamanho_bytes,
      miniatura: inicial.miniatura_url
        ? {
            url: inicial.miniatura_url,
            path: inicial.miniatura_path ?? '',
            largura: 420,
            altura: 594,
          }
        : null,
    },
    projetoSlug: inicial.projeto_slug ?? '',
    publicado: inicial.publicado,
  }
}

export function FormularioDeDocumento({ categorias, projetos, inicial }: Props) {
  const router = useRouter()
  const [estado, setEstado] = useState<Estado>(() =>
    estadoInicial(inicial, categorias),
  )
  const [erros, setErros] = useState<Record<string, string>>({})
  const [aviso, setAviso] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  function definir<C extends keyof Estado>(campo: C, valor: Estado[C]) {
    setEstado((atual) => ({ ...atual, [campo]: valor }))
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setAviso(null)
    setErros({})

    const payload: DocumentoPayload = {
      id: inicial?.id,
      titulo: estado.titulo,
      conteudo: estado.conteudo,
      categoriaId: estado.categoriaId,
      ano: estado.ano,
      publicadoEm: estado.publicadoEm,
      arquivoUrl: estado.arquivo.arquivoUrl,
      arquivoPath: estado.arquivo.arquivoPath,
      arquivoNome: estado.arquivo.arquivoNome,
      formato: estado.arquivo.formato,
      tamanhoBytes: estado.arquivo.tamanhoBytes,
      miniatura: estado.arquivo.miniatura,
      projetoSlug: estado.projetoSlug,
      publicado: estado.publicado,
    }

    /* Valida antes de sair do navegador: erro de campo aparece no campo, e
       não como uma mensagem genérica depois da viagem até o servidor. */
    const analise = documentoSchema.safeParse(payload)
    if (!analise.success) {
      const mapa: Record<string, string> = {}
      for (const problema of analise.error.issues) {
        const caminho = problema.path.join('.')
        if (!mapa[caminho]) mapa[caminho] = problema.message
      }
      if (!payload.arquivoUrl) {
        mapa.arquivoUrl = 'Envie o arquivo do documento.'
      }
      setErros(mapa)
      setAviso('Confira os campos destacados.')
      return
    }

    setSalvando(true)
    const resposta = await salvarDocumento(analise.data)

    if (!resposta.ok) {
      setErros(resposta.campos ?? {})
      setAviso(resposta.erro)
      setSalvando(false)
      return
    }

    router.push('/admin/documentos')
    router.refresh()
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-6">
      <Cartao titulo="O documento">
        <EnvioDeDocumento
          valor={estado.arquivo}
          ano={estado.ano}
          erro={erros.arquivoUrl}
          onChange={(arquivo) => definir('arquivo', arquivo)}
        />

        <CamposTraduzidos
          rotulo="Título"
          valor={estado.titulo}
          erro={erros['titulo.pt']}
          placeholder="Ex.: Termo de Fomento nº 997182"
          onChange={(valor) => definir('titulo', valor)}
        />

        <CamposTraduzidos
          rotulo="Conteúdo"
          valor={estado.conteudo}
          multilinha
          linhas={3}
          opcional
          dica="A frase que aparece na coluna Conteúdo da tabela. Ex.: “Termo de Fomento: Ministério da Cultura”."
          onChange={(valor) => definir('conteudo', valor)}
        />
      </Cartao>

      <Cartao titulo="Classificação">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Campo htmlFor="categoria" rotulo="Categoria" erro={erros.categoriaId}>
            <Selecao
              id="categoria"
              value={estado.categoriaId}
              onChange={(evento) => definir('categoriaId', evento.target.value)}
            >
              {categorias.length === 0 ? (
                <option value="">Nenhuma categoria cadastrada</option>
              ) : null}
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {comoTexto(categoria.rotulo).pt || categoria.id}
                </option>
              ))}
            </Selecao>
          </Campo>

          <Campo
            htmlFor="ano"
            rotulo="Ano de referência"
            erro={erros.ano}
            dica="O ano a que o documento se refere, que pode ser diferente do ano de publicação."
          >
            <Entrada
              id="ano"
              type="number"
              min={1990}
              max={2200}
              value={estado.ano}
              onChange={(evento) =>
                definir('ano', Number(evento.target.value) || 0)
              }
            />
          </Campo>

          <Campo
            htmlFor="publicado-em"
            rotulo="Data de publicação"
            erro={erros.publicadoEm}
          >
            <Entrada
              id="publicado-em"
              type="date"
              value={estado.publicadoEm}
              onChange={(evento) => definir('publicadoEm', evento.target.value)}
            />
          </Campo>
        </div>

        <Campo
          htmlFor="projeto"
          rotulo="Projeto relacionado"
          opcional
          dica="Use quando o documento for a prestação de contas ou o termo de um projeto específico."
        >
          <Selecao
            id="projeto"
            value={estado.projetoSlug}
            onChange={(evento) => definir('projetoSlug', evento.target.value)}
          >
            <option value="">Nenhum</option>
            {projetos.map((projeto) => (
              <option key={projeto.slug} value={projeto.slug}>
                {projeto.nome}
              </option>
            ))}
          </Selecao>
        </Campo>
      </Cartao>

      <Cartao titulo="Publicação">
        <Interruptor
          id="publicado"
          aparencia="chave"
          rotulo={estado.publicado ? 'No site' : 'Rascunho'}
          descricao={
            estado.publicado
              ? 'Ligada, a chave publica o documento na tabela de Transparência.'
              : 'Desligada, o documento fica guardado no painel e não aparece na página de Transparência.'
          }
          checked={estado.publicado}
          onChange={(valor) => definir('publicado', valor)}
        />

      </Cartao>

      {aviso ? <Aviso tom="erro">{aviso}</Aviso> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Botao type="submit" carregando={salvando}>
          {inicial ? 'Salvar alterações' : 'Publicar documento'}
        </Botao>
        <Botao
          type="button"
          variante="discreto"
          disabled={salvando}
          onClick={() => router.push('/admin/documentos')}
        >
          Cancelar
        </Botao>
      </div>
    </form>
  )
}
