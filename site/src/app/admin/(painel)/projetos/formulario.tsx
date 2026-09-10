'use client'

import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import type { Localized, MediaAsset } from '@/content/types'
import {
  projetoSchema,
  sugerirSlug,
  type ImagemEnviada,
  type ProjetoPayload,
} from '@/lib/admin/esquemas'
import type { LinhaProjeto } from '@/lib/cms/tipos'
import { salvarProjeto } from '../../acoes'
import { CamposTraduzidos, textoVazio } from '../../componentes/campos-traduzidos'
import { EnvioDeImagem, type CapaDoAcervo } from '../../componentes/envio'
import {
  ItemRepetivel,
  ListaDeTextos,
  trocarPosicao,
} from '../../componentes/listas'
import {
  Aviso,
  Botao,
  Campo,
  Cartao,
  Entrada,
  Interruptor,
} from '../../componentes/ui'
import { Galeria, type FotoDaGaleria } from './galeria'

/**
 * Um local de atuação, como o formulário o guarda.
 *
 * `uf` e `coords` não têm campo na tela: eles entram como vieram do
 * banco e saem iguais. É o que mantém no ar as sete regiões
 * administrativas do Distrito Federal, que não são municípios do IBGE e
 * por isso dependem da coordenada cadastrada à mão — sem esta passagem,
 * salvar o projeto aqui apagaria sete pontos do mapa da Página inicial.
 */
type Local = {
  cidade: string
  regiao: string
  local: string
  /** Quantos polos há nesta cidade. 0 e 1 valem o mesmo. */
  polos: number
  uf: string
  coords: { lat: number; lng: number } | null
}
type Metrica = { valor: number; prefixo: string; sufixo: string; rotulo: string }
type Passo = { titulo: string; texto: string }

type Estado = {
  slug: string
  nome: string
  categoria: Localized
  resumo: Localized
  objetivo: Localized
  descricao: string[]
  publico: string[]
  locais: Local[]
  metricas: Metrica[]
  metodologia: Passo[]
  resultados: string[]
  galeria: FotoDaGaleria[]
  capa: ImagemEnviada | null
  capaAlt: Localized
  ordem: number
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

function listaPt(bruto: unknown): string[] {
  const fonte = (bruto ?? {}) as Record<string, unknown>
  return Array.isArray(fonte.pt) ? fonte.pt.map(String) : []
}

function estadoInicial(inicial: LinhaProjeto | undefined): Estado {
  if (!inicial) {
    return {
      slug: '',
      nome: '',
      categoria: textoVazio(),
      resumo: textoVazio(),
      objetivo: textoVazio(),
      descricao: [''],
      publico: [],
      locais: [],
      metricas: [],
      metodologia: [],
      resultados: [],
      galeria: [],
      capa: null,
      capaAlt: textoVazio(),
      ordem: 0,
      publicado: true,
    }
  }

  const locaisBrutos = Array.isArray(inicial.locais) ? inicial.locais : []
  const metricasBrutas = Array.isArray(inicial.metricas) ? inicial.metricas : []
  const galeriaBruta = Array.isArray(inicial.galeria) ? inicial.galeria : []

  const metodologiaBruta = (inicial.metodologia ?? {}) as Record<string, unknown>
  const passosPt = Array.isArray(metodologiaBruta.pt) ? metodologiaBruta.pt : []

  return {
    slug: inicial.slug,
    nome: inicial.nome,
    categoria: comoTexto(inicial.categoria),
    resumo: comoTexto(inicial.resumo),
    objetivo: comoTexto(inicial.objetivo),
    descricao: listaPt(inicial.descricao),
    publico: listaPt(inicial.publico),
    locais: locaisBrutos.map((item) => {
      const local = (item ?? {}) as Record<string, unknown>
      const coords = (local.coords ?? null) as { lat?: unknown; lng?: unknown } | null
      const temCoordenada =
        coords &&
        Number.isFinite(Number(coords.lat)) &&
        Number.isFinite(Number(coords.lng))

      return {
        cidade: comoTexto(local.city).pt,
        regiao: typeof local.region === 'string' ? local.region : '',
        local: typeof local.venue === 'string' ? local.venue : '',
        polos: Number(local.polos) > 1 ? Math.round(Number(local.polos)) : 1,
        uf: typeof local.uf === 'string' ? local.uf : '',
        coords: temCoordenada
          ? { lat: Number(coords.lat), lng: Number(coords.lng) }
          : null,
      }
    }),
    metricas: metricasBrutas.map((item) => {
      const metrica = (item ?? {}) as Record<string, unknown>
      return {
        valor: Number(metrica.value) || 0,
        prefixo: typeof metrica.prefix === 'string' ? metrica.prefix : '',
        sufixo: comoTexto(metrica.suffix).pt,
        rotulo: comoTexto(metrica.label).pt,
      }
    }),
    metodologia: passosPt.map((item) => {
      const passo = (item ?? {}) as Record<string, unknown>
      return {
        titulo: typeof passo.title === 'string' ? passo.title : '',
        texto: typeof passo.text === 'string' ? passo.text : '',
      }
    }),
    resultados: listaPt(inicial.resultados),
    galeria: galeriaBruta.map((item) => {
      const foto = (item ?? {}) as Record<string, unknown>
      return {
        url: typeof foto.src === 'string' ? foto.src : '',
        path: '',
        largura: Number(foto.width) || 1600,
        altura: Number(foto.height) || 900,
        alt: comoTexto(foto.alt),
      }
    }),
    capa: inicial.capa_url
      ? {
          url: inicial.capa_url,
          path: inicial.capa_path ?? '',
          largura: inicial.capa_largura ?? 1600,
          altura: inicial.capa_altura ?? 900,
        }
      : null,
    capaAlt: comoTexto(inicial.capa_alt),
    ordem: inicial.ordem,
    publicado: inicial.publicado,
  }
}

/**
 * Locais, números e passos da metodologia são escritos só em português: são
 * rótulos curtos, e um campo por idioma em cada linha repetida deixaria o
 * formulário impraticável. O site exibe o português nos três idiomas.
 */
const soPt = (valor: string): Localized => ({ pt: valor, en: '', es: '' })

type Props = {
  inicial?: LinhaProjeto
  /**
   * O que o site publica hoje neste projeto quando o painel não tem nada
   * enviado: a capa oficial do acervo e o álbum registrado pelo slug (ver
   * `lib/admin/capas.ts`). Só de leitura, para o formulário mostrar o que
   * está no ar em vez de moldura vazia e "nenhuma foto".
   */
  capaDoAcervo?: CapaDoAcervo | null
  galeriaDoAcervo?: MediaAsset[]
}

export function FormularioDeProjeto({
  inicial,
  capaDoAcervo = null,
  galeriaDoAcervo = [],
}: Props) {
  const router = useRouter()
  const [estado, setEstado] = useState<Estado>(() => estadoInicial(inicial))
  const [slugAutomatico, setSlugAutomatico] = useState(!inicial)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [aviso, setAviso] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  function definir<C extends keyof Estado>(campo: C, valor: Estado[C]) {
    setEstado((atual) => ({ ...atual, [campo]: valor }))
  }

  function definirNome(nome: string) {
    setEstado((atual) => ({
      ...atual,
      nome,
      slug: slugAutomatico ? sugerirSlug(nome) : atual.slug,
    }))
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setAviso(null)
    setErros({})

    const payload: ProjetoPayload = {
      id: inicial?.id,
      slug: estado.slug,
      nome: estado.nome,
      categoria: estado.categoria,
      resumo: estado.resumo,
      descricao: { pt: estado.descricao.filter(Boolean), en: [], es: [] },
      objetivo: estado.objetivo,
      publico: { pt: estado.publico.filter(Boolean), en: [], es: [] },
      locais: estado.locais
        .filter((local) => local.cidade.trim())
        .map((local) => ({
          cidade: soPt(local.cidade),
          regiao: local.regiao,
          local: local.local,
          polos: local.polos,
          uf: local.uf,
          coords: local.coords,
        })),
      metricas: estado.metricas
        .filter((metrica) => metrica.rotulo.trim())
        .map((metrica) => ({
          id: '',
          valor: metrica.valor,
          prefixo: metrica.prefixo,
          sufixo: soPt(metrica.sufixo),
          rotulo: soPt(metrica.rotulo),
        })),
      metodologia: estado.metodologia
        .filter((passo) => passo.titulo.trim() && passo.texto.trim())
        .map((passo) => ({
          titulo: soPt(passo.titulo),
          texto: soPt(passo.texto),
        })),
      resultados: { pt: estado.resultados.filter(Boolean), en: [], es: [] },
      galeria: estado.galeria,
      capa: estado.capa,
      capaAlt: estado.capaAlt,
      ordem: estado.ordem,
      publicado: estado.publicado,
    }

    const analise = projetoSchema.safeParse(payload)
    if (!analise.success) {
      const mapa: Record<string, string> = {}
      for (const problema of analise.error.issues) {
        const caminho = problema.path.join('.')
        if (!mapa[caminho]) mapa[caminho] = problema.message
      }
      setErros(mapa)
      setAviso('Confira os campos destacados.')
      return
    }

    setSalvando(true)
    const resposta = await salvarProjeto(analise.data)

    if (!resposta.ok) {
      setErros(resposta.campos ?? {})
      setAviso(resposta.erro)
      setSalvando(false)
      return
    }

    router.push('/admin/projetos')
    router.refresh()
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-6">
      <Cartao titulo="Identificação">
        <Campo
          htmlFor="nome"
          rotulo="Nome do projeto"
          erro={erros.nome}
          dica="Nome próprio. Não é traduzido em nenhum idioma."
        >
          <Entrada
            id="nome"
            value={estado.nome}
            placeholder="Ex.: Projeto Social Coração Valente"
            onChange={(evento) => definirNome(evento.target.value)}
          />
        </Campo>

        <Campo
          htmlFor="slug"
          rotulo="Endereço do projeto"
          erro={erros.slug}
          dica={`Vai aparecer assim: aidepoficial.com/pt/projetos/${estado.slug || 'endereco-do-projeto'}`}
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
          rotulo="Categoria"
          valor={estado.categoria}
          erro={erros['categoria.pt']}
          placeholder="Ex.: Projeto social"
          onChange={(valor) => definir('categoria', valor)}
        />

        <CamposTraduzidos
          rotulo="Resumo"
          valor={estado.resumo}
          multilinha
          linhas={3}
          erro={erros['resumo.pt']}
          dica="Uma frase. Aparece no cartão do projeto e logo abaixo do título na página."
          onChange={(valor) => definir('resumo', valor)}
        />
      </Cartao>

      <Cartao titulo="Apresentação">
        <ListaDeTextos
          rotulo="Parágrafos"
          itens={estado.descricao}
          multilinha
          rotuloDeAdicionar="Acrescentar parágrafo"
          erro={erros['descricao.pt']}
          onChange={(descricao) => definir('descricao', descricao)}
        />

        <CamposTraduzidos
          rotulo="Objetivo"
          valor={estado.objetivo}
          multilinha
          linhas={3}
          opcional
          dica="Sem preenchimento, o bloco de objetivo não aparece na página."
          onChange={(valor) => definir('objetivo', valor)}
        />

        <ListaDeTextos
          rotulo="Público atendido"
          itens={estado.publico}
          placeholder="Ex.: Crianças"
          rotuloDeAdicionar="Acrescentar público"
          onChange={(publico) => definir('publico', publico)}
        />
      </Cartao>

      <Cartao
        titulo="Onde acontece"
        descricao="Cidades e locais de atuação. Sem nenhum, o bloco não aparece."
      >
        <div className="flex flex-col gap-4">
          {estado.locais.map((local, indice) => (
            <ItemRepetivel
              key={indice}
              indice={indice}
              total={estado.locais.length}
              titulo="Local"
              onRemover={() =>
                definir(
                  'locais',
                  estado.locais.filter((_, i) => i !== indice),
                )
              }
              onMover={(direcao) =>
                definir('locais', trocarPosicao(estado.locais, indice, direcao))
              }
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <Campo rotulo="Cidade">
                  <Entrada
                    value={local.cidade}
                    placeholder="Ex.: Aracaju"
                    onChange={(evento) => {
                      const locais = [...estado.locais]
                      locais[indice] = { ...local, cidade: evento.target.value }
                      definir('locais', locais)
                    }}
                  />
                </Campo>
                <Campo rotulo="UF ou região" opcional>
                  <Entrada
                    value={local.regiao}
                    placeholder="Ex.: SE"
                    onChange={(evento) => {
                      const locais = [...estado.locais]
                      locais[indice] = { ...local, regiao: evento.target.value }
                      definir('locais', locais)
                    }}
                  />
                </Campo>
                <Campo rotulo="Equipamento" opcional>
                  <Entrada
                    value={local.local}
                    placeholder="Ex.: Arena da Baixada"
                    onChange={(evento) => {
                      const locais = [...estado.locais]
                      locais[indice] = { ...local, local: evento.target.value }
                      definir('locais', locais)
                    }}
                  />
                </Campo>
                {/* Uma cidade pode ter mais de um polo — Aracaju tem
                    cinco. O mapa da Página inicial mostra um ponto por
                    cidade e diz o número na ficha; repetir a cidade cinco
                    vezes só empilharia cinco marcadores no mesmo pixel. */}
                <Campo rotulo="Polos na cidade" opcional>
                  <Entrada
                    type="number"
                    min={1}
                    max={999}
                    value={local.polos}
                    onChange={(evento) => {
                      const locais = [...estado.locais]
                      locais[indice] = {
                        ...local,
                        polos: Math.max(1, Number(evento.target.value) || 1),
                      }
                      definir('locais', locais)
                    }}
                  />
                </Campo>
              </div>
            </ItemRepetivel>
          ))}

          <Botao
            type="button"
            variante="contorno"
            className="self-start"
            onClick={() =>
              definir('locais', [
                ...estado.locais,
                { cidade: '', regiao: '', local: '', polos: 1, uf: '', coords: null },
              ])
            }
          >
            <Plus aria-hidden="true" className="size-4" />
            Acrescentar local
          </Botao>
        </div>
      </Cartao>

      <Cartao
        titulo="Números do projeto"
        descricao="Aparecem no cartão do projeto e na faixa de números da página. Os dois primeiros também vão para o topo."
      >
        <div className="flex flex-col gap-4">
          {estado.metricas.map((metrica, indice) => (
            <ItemRepetivel
              key={indice}
              indice={indice}
              total={estado.metricas.length}
              titulo="Número"
              onRemover={() =>
                definir(
                  'metricas',
                  estado.metricas.filter((_, i) => i !== indice),
                )
              }
              onMover={(direcao) =>
                definir(
                  'metricas',
                  trocarPosicao(estado.metricas, indice, direcao),
                )
              }
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <Campo rotulo="Número">
                  <Entrada
                    type="number"
                    min={0}
                    value={metrica.valor}
                    onChange={(evento) => {
                      const metricas = [...estado.metricas]
                      metricas[indice] = {
                        ...metrica,
                        valor: Number(evento.target.value) || 0,
                      }
                      definir('metricas', metricas)
                    }}
                  />
                </Campo>
                <Campo rotulo="Antes" opcional>
                  <Entrada
                    value={metrica.prefixo}
                    placeholder="Ex.: +"
                    onChange={(evento) => {
                      const metricas = [...estado.metricas]
                      metricas[indice] = {
                        ...metrica,
                        prefixo: evento.target.value,
                      }
                      definir('metricas', metricas)
                    }}
                  />
                </Campo>
                <Campo rotulo="Depois" opcional>
                  <Entrada
                    value={metrica.sufixo}
                    placeholder="Ex.: mil"
                    onChange={(evento) => {
                      const metricas = [...estado.metricas]
                      metricas[indice] = {
                        ...metrica,
                        sufixo: evento.target.value,
                      }
                      definir('metricas', metricas)
                    }}
                  />
                </Campo>
                <Campo rotulo="Legenda">
                  <Entrada
                    value={metrica.rotulo}
                    placeholder="Ex.: crianças atendidas"
                    onChange={(evento) => {
                      const metricas = [...estado.metricas]
                      metricas[indice] = {
                        ...metrica,
                        rotulo: evento.target.value,
                      }
                      definir('metricas', metricas)
                    }}
                  />
                </Campo>
              </div>
            </ItemRepetivel>
          ))}

          <Botao
            type="button"
            variante="contorno"
            className="self-start"
            onClick={() =>
              definir('metricas', [
                ...estado.metricas,
                { valor: 0, prefixo: '', sufixo: '', rotulo: '' },
              ])
            }
          >
            <Plus aria-hidden="true" className="size-4" />
            Acrescentar número
          </Botao>
        </div>
      </Cartao>

      <Cartao
        titulo="Metodologia"
        descricao="Os passos de como o projeto funciona. Sem nenhum passo, a seção não aparece na página."
      >
        <div className="flex flex-col gap-4">
          {estado.metodologia.map((passo, indice) => (
            <ItemRepetivel
              key={indice}
              indice={indice}
              total={estado.metodologia.length}
              titulo="Passo"
              onRemover={() =>
                definir(
                  'metodologia',
                  estado.metodologia.filter((_, i) => i !== indice),
                )
              }
              onMover={(direcao) =>
                definir(
                  'metodologia',
                  trocarPosicao(estado.metodologia, indice, direcao),
                )
              }
            >
              <div className="flex flex-col gap-4">
                <Campo rotulo="Título do passo">
                  <Entrada
                    value={passo.titulo}
                    onChange={(evento) => {
                      const passos = [...estado.metodologia]
                      passos[indice] = { ...passo, titulo: evento.target.value }
                      definir('metodologia', passos)
                    }}
                  />
                </Campo>
                <Campo rotulo="Descrição">
                  <Entrada
                    value={passo.texto}
                    onChange={(evento) => {
                      const passos = [...estado.metodologia]
                      passos[indice] = { ...passo, texto: evento.target.value }
                      definir('metodologia', passos)
                    }}
                  />
                </Campo>
              </div>
            </ItemRepetivel>
          ))}

          <Botao
            type="button"
            variante="contorno"
            className="self-start"
            onClick={() =>
              definir('metodologia', [
                ...estado.metodologia,
                { titulo: '', texto: '' },
              ])
            }
          >
            <Plus aria-hidden="true" className="size-4" />
            Acrescentar passo
          </Botao>
        </div>
      </Cartao>

      <Cartao titulo="Resultados">
        <ListaDeTextos
          rotulo="Resultados alcançados"
          itens={estado.resultados}
          multilinha
          rotuloDeAdicionar="Acrescentar resultado"
          dica="Sem nenhum, a seção de resultados não aparece na página."
          onChange={(resultados) => definir('resultados', resultados)}
        />
      </Cartao>

      <Cartao titulo="Imagens">
        <EnvioDeImagem
          rotulo="Capa do projeto"
          valor={estado.capa}
          pasta="projetos"
          proporcao="4 / 3"
          doAcervo={capaDoAcervo}
          onChange={(capa) => definir('capa', capa)}
        />

        {estado.capa ? (
          <CamposTraduzidos
            rotulo="Descrição da capa"
            valor={estado.capaAlt}
            opcional
            dica="Sem preenchimento, usamos o nome do projeto."
            onChange={(valor) => definir('capaAlt', valor)}
          />
        ) : null}

        <Galeria
          fotos={estado.galeria}
          doAcervo={galeriaDoAcervo}
          onChange={(galeria) => definir('galeria', galeria)}
        />
      </Cartao>

      <Cartao titulo="Publicação">
        <Campo
          htmlFor="ordem"
          rotulo="Ordem na listagem"
          dica="Menor número aparece primeiro na página de Projetos e na página inicial."
        >
          <Entrada
            id="ordem"
            type="number"
            min={0}
            max={999}
            className="max-w-32"
            value={estado.ordem}
            onChange={(evento) =>
              definir('ordem', Number(evento.target.value) || 0)
            }
          />
        </Campo>

        <Interruptor
          id="publicado"
          aparencia="chave"
          rotulo={estado.publicado ? 'No site' : 'Rascunho'}
          descricao={
            estado.publicado
              ? 'Ligada, a chave publica o projeto no site.'
              : 'Desligada, o projeto sai da página de Projetos e da página inicial.'
          }
          checked={estado.publicado}
          onChange={(valor) => definir('publicado', valor)}
        />

      </Cartao>

      {aviso ? <Aviso tom="erro">{aviso}</Aviso> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Botao type="submit" carregando={salvando}>
          {inicial ? 'Salvar alterações' : 'Cadastrar projeto'}
        </Botao>
        <Botao
          type="button"
          variante="discreto"
          disabled={salvando}
          onClick={() => router.push('/admin/projetos')}
        >
          Cancelar
        </Botao>
      </div>
    </form>
  )
}
