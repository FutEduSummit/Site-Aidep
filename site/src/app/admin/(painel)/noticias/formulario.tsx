'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import type { Localized } from '@/content/types'
import {
  noticiaSchema,
  sugerirSlug,
  type BlocoPayload,
  type ImagemEnviada,
  type NoticiaPayload,
} from '@/lib/admin/esquemas'
import type { LinhaNoticia, LinhaProjeto } from '@/lib/cms/tipos'
import { salvarNoticia } from '../../acoes'
import { CamposTraduzidos, textoVazio } from '../../componentes/campos-traduzidos'
import { EditorDeBlocos } from '../../componentes/editor-de-blocos'
import { EnvioDeImagem, type CapaDoAcervo } from '../../componentes/envio'
import {
  Aviso,
  Botao,
  Campo,
  Cartao,
  Entrada,
  Interruptor,
} from '../../componentes/ui'

type Props = {
  projetos: Pick<LinhaProjeto, 'slug' | 'nome'>[]
  inicial?: LinhaNoticia
  /**
   * A fotografia do acervo que o site já publica nesta notícia, quando ela
   * não tem capa enviada pelo painel. Só de leitura: existe para a moldura
   * mostrar o que está no ar em vez de um quadro vazio.
   */
  capaDoAcervo?: CapaDoAcervo | null
}

type Estado = {
  slug: string
  titulo: Localized
  resumo: Localized
  categoria: Localized
  data: string
  autor: string
  capa: ImagemEnviada | null
  capaAlt: Localized
  corpo: BlocoPayload[]
  projetosRelacionados: string[]
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

function blocosDe(bruto: unknown): BlocoPayload[] {
  const fonte = (bruto ?? {}) as Record<string, unknown>
  const pt = fonte.pt
  return Array.isArray(pt) ? (pt as BlocoPayload[]) : []
}

function estadoInicial(inicial: LinhaNoticia | undefined): Estado {
  if (!inicial) {
    return {
      slug: '',
      titulo: textoVazio(),
      resumo: textoVazio(),
      categoria: textoVazio(),
      data: new Date().toISOString().slice(0, 10),
      autor: '',
      capa: null,
      capaAlt: textoVazio(),
      corpo: [{ type: 'paragraph', text: '' }],
      projetosRelacionados: [],
      publicado: false,
    }
  }

  return {
    slug: inicial.slug,
    titulo: comoTexto(inicial.titulo),
    resumo: comoTexto(inicial.resumo),
    categoria: comoTexto(inicial.categoria),
    data: inicial.data.slice(0, 10),
    autor: inicial.autor ?? '',
    capa: inicial.capa_url
      ? {
          url: inicial.capa_url,
          path: inicial.capa_path ?? '',
          largura: inicial.capa_largura ?? 1600,
          altura: inicial.capa_altura ?? 900,
        }
      : null,
    capaAlt: comoTexto(inicial.capa_alt),
    corpo: blocosDe(inicial.corpo),
    projetosRelacionados: inicial.projetos_relacionados ?? [],
    publicado: inicial.publicado,
  }
}

export function FormularioDeNoticia({
  projetos,
  inicial,
  capaDoAcervo = null,
}: Props) {
  const router = useRouter()
  const [estado, setEstado] = useState<Estado>(() => estadoInicial(inicial))
  /* O endereço só acompanha o título enquanto a notícia é nova e ninguém
     mexeu nele — mudar o endereço de uma notícia publicada quebra o link
     que já foi compartilhado. */
  const [slugAutomatico, setSlugAutomatico] = useState(!inicial)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [aviso, setAviso] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  function definir<C extends keyof Estado>(campo: C, valor: Estado[C]) {
    setEstado((atual) => ({ ...atual, [campo]: valor }))
  }

  function definirTitulo(titulo: Localized) {
    setEstado((atual) => ({
      ...atual,
      titulo,
      slug: slugAutomatico ? sugerirSlug(titulo.pt) : atual.slug,
    }))
  }

  function alternarProjeto(slug: string) {
    setEstado((atual) => ({
      ...atual,
      projetosRelacionados: atual.projetosRelacionados.includes(slug)
        ? atual.projetosRelacionados.filter((item) => item !== slug)
        : [...atual.projetosRelacionados, slug],
    }))
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setAviso(null)
    setErros({})

    const payload: NoticiaPayload = {
      id: inicial?.id,
      slug: estado.slug,
      titulo: estado.titulo,
      resumo: estado.resumo,
      categoria: estado.categoria,
      corpo: { pt: estado.corpo, en: [], es: [] },
      data: estado.data,
      autor: estado.autor,
      capa: estado.capa,
      capaAlt: estado.capaAlt,
      projetosRelacionados: estado.projetosRelacionados,
      publicado: estado.publicado,
    }

    const analise = noticiaSchema.safeParse(payload)
    if (!analise.success) {
      const mapa: Record<string, string> = {}
      for (const problema of analise.error.issues) {
        const caminho = problema.path.join('.')
        if (!mapa[caminho]) mapa[caminho] = problema.message
        if (caminho.startsWith('corpo.')) {
          mapa.corpo = 'Há blocos vazios. Preencha ou remova antes de salvar.'
        }
      }
      setErros(mapa)
      setAviso('Confira os campos destacados.')
      return
    }

    setSalvando(true)
    const resposta = await salvarNoticia(analise.data)

    if (!resposta.ok) {
      setErros(resposta.campos ?? {})
      setAviso(resposta.erro)
      setSalvando(false)
      return
    }

    router.push('/admin/noticias')
    router.refresh()
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-6">
      <Cartao titulo="Abertura">
        <CamposTraduzidos
          rotulo="Título"
          valor={estado.titulo}
          erro={erros['titulo.pt']}
          onChange={definirTitulo}
        />

        <Campo
          htmlFor="slug"
          rotulo="Endereço da notícia"
          erro={erros.slug}
          dica={`Vai aparecer assim: aidepoficial.com/pt/noticias/${estado.slug || 'endereco-da-noticia'}`}
        >
          <Entrada
            id="slug"
            value={estado.slug}
            onChange={(evento) => {
              setSlugAutomatico(false)
              definir('slug', evento.target.value)
            }}
          />
        </Campo>

        <CamposTraduzidos
          rotulo="Resumo"
          valor={estado.resumo}
          multilinha
          linhas={3}
          erro={erros['resumo.pt']}
          dica="Aparece na lista de notícias e logo abaixo do título na página de leitura."
          onChange={(valor) => definir('resumo', valor)}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Campo htmlFor="data" rotulo="Data" erro={erros.data}>
            <Entrada
              id="data"
              type="date"
              value={estado.data}
              onChange={(evento) => definir('data', evento.target.value)}
            />
          </Campo>

          <Campo htmlFor="autor" rotulo="Autor" opcional>
            <Entrada
              id="autor"
              value={estado.autor}
              placeholder="Ex.: Comunicação AIDEP"
              onChange={(evento) => definir('autor', evento.target.value)}
            />
          </Campo>
        </div>

        <CamposTraduzidos
          rotulo="Editoria"
          valor={estado.categoria}
          erro={erros['categoria.pt']}
          placeholder="Ex.: Institucional"
          dica="A palavra que aparece acima do título, em verde."
          onChange={(valor) => definir('categoria', valor)}
        />
      </Cartao>

      <Cartao titulo="Imagem de capa">
        <EnvioDeImagem
          rotulo="Capa"
          valor={estado.capa}
          pasta="noticias"
          doAcervo={capaDoAcervo}
          onChange={(capa) => definir('capa', capa)}
        />

        {estado.capa ? (
          <CamposTraduzidos
            rotulo="Descrição da imagem"
            valor={estado.capaAlt}
            opcional
            dica="Lida por leitores de tela e exibida se a imagem não carregar. Sem preenchimento, usamos o título da notícia."
            onChange={(valor) => definir('capaAlt', valor)}
          />
        ) : null}
      </Cartao>

      <Cartao titulo="Texto">
        <EditorDeBlocos
          blocos={estado.corpo}
          erro={erros.corpo}
          onChange={(corpo) => definir('corpo', corpo)}
        />
      </Cartao>

      {projetos.length > 0 ? (
        <Cartao
          titulo="Projetos relacionados"
          descricao="A notícia aparece na página de cada projeto marcado, e os marcados viram links no fim da leitura."
        >
          <ul className="flex flex-col gap-3">
            {projetos.map((projeto) => (
              <li key={projeto.slug}>
                <Interruptor
                  id={`projeto-${projeto.slug}`}
                  rotulo={projeto.nome}
                  checked={estado.projetosRelacionados.includes(projeto.slug)}
                  onChange={() => alternarProjeto(projeto.slug)}
                />
              </li>
            ))}
          </ul>
        </Cartao>
      ) : null}

      <Cartao titulo="Publicação">
        <Interruptor
          id="publicado"
          aparencia="chave"
          rotulo={estado.publicado ? 'No site' : 'Rascunho'}
          descricao={
            estado.publicado
              ? 'Ligada, a chave publica a notícia no site.'
              : 'Desligada, a notícia fica salva como rascunho e não aparece para o público.'
          }
          checked={estado.publicado}
          onChange={(valor) => definir('publicado', valor)}
        />

      </Cartao>

      {aviso ? <Aviso tom="erro">{aviso}</Aviso> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Botao type="submit" carregando={salvando}>
          {inicial ? 'Salvar alterações' : 'Salvar notícia'}
        </Botao>
        <Botao
          type="button"
          variante="discreto"
          disabled={salvando}
          onClick={() => router.push('/admin/noticias')}
        >
          Cancelar
        </Botao>
      </div>
    </form>
  )
}
