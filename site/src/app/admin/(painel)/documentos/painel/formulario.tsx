'use client'

import { Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import type { Localized } from '@/content/types'
import type { ImagemEnviada, PainelPayload } from '@/lib/admin/esquemas'
import type { LinhaPainel } from '@/lib/cms/tipos'
import { salvarPainel } from '../../../acoes'
import {
  CamposTraduzidos,
  textoVazio,
} from '../../../componentes/campos-traduzidos'
import { EnvioDeImagem } from '../../../componentes/envio'
import { Aviso, Botao, Campo, Entrada } from '../../../componentes/ui'

type Props = {
  /** A captura gravada, ou `null` se a que está no ar é a do código. */
  inicial: LinhaPainel | null
  /** A captura entregue com o site, que fica no ar até o primeiro envio. */
  padrao: { src: string; largura: number; altura: number; capturadoEm: string }
}

type Estado = {
  imagem: ImagemEnviada | null
  capturadoEm: string
  alt: Localized
}

function comoTexto(bruto: unknown): Localized {
  const fonte = (bruto ?? {}) as Record<string, unknown>
  return {
    pt: typeof fonte.pt === 'string' ? fonte.pt : '',
    en: typeof fonte.en === 'string' ? fonte.en : '',
    es: typeof fonte.es === 'string' ? fonte.es : '',
  }
}

/**
 * TROCAR A TELA DO PAINEL
 * =======================
 * Dois campos, e os dois obrigatórios: a imagem e a data que está escrita
 * no cabeçalho do painel do governo.
 *
 * A data não é a de hoje por padrão. Ela é a que o painel do Transferegov
 * imprime em "Atualizado em ...", e é ela que o site anuncia na faixa
 * verde — preencher com a data do envio faria o site prometer números mais
 * novos do que os da tela.
 *
 * Enquanto nada foi enviado, a moldura mostra a captura que está no ar
 * (a entregue com o site), e não um quadro vazio: o cliente precisa ver o
 * que vai substituir.
 */
export function FormularioDoPainel({ inicial, padrao }: Props) {
  const router = useRouter()

  const [estado, setEstado] = useState<Estado>(() =>
    inicial
      ? {
          imagem: {
            url: inicial.imagem_url,
            path: inicial.imagem_path ?? '',
            largura: inicial.imagem_largura ?? padrao.largura,
            altura: inicial.imagem_altura ?? padrao.altura,
          },
          capturadoEm: inicial.capturado_em.slice(0, 10),
          alt: comoTexto(inicial.alt),
        }
      : { imagem: null, capturadoEm: '', alt: textoVazio() },
  )

  const [erros, setErros] = useState<Record<string, string>>({})
  const [aviso, setAviso] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)
  const [salvando, setSalvando] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setAviso(null)
    setSalvo(false)
    setErros({})

    if (!estado.imagem) {
      setErros({ imagem: 'Envie a imagem da tela do painel.' })
      return
    }

    const payload: PainelPayload = {
      imagem: estado.imagem,
      capturadoEm: estado.capturadoEm,
      alt: estado.alt,
    }

    setSalvando(true)
    const resposta = await salvarPainel(payload)
    setSalvando(false)

    if (!resposta.ok) {
      setAviso(resposta.erro)
      setErros(resposta.campos ?? {})
      return
    }

    setSalvo(true)
    router.refresh()
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-6">
      <EnvioDeImagem
        rotulo="Tela do painel"
        valor={estado.imagem}
        onChange={(imagem) => setEstado((atual) => ({ ...atual, imagem }))}
        pasta="painel"
        proporcao={`${padrao.largura} / ${padrao.altura}`}
        dica="Abra o painel Discricionárias e Legais no Transferegov, tire a captura da tela inteira e envie o arquivo aqui. PNG ou JPG."
        doAcervo={
          estado.imagem
            ? null
            : {
                src: padrao.src,
                largura: padrao.largura,
                altura: padrao.altura,
              }
        }
      />

      {erros.imagem ? <Aviso tom="erro">{erros.imagem}</Aviso> : null}

      <Campo
        htmlFor="painel-capturado-em"
        rotulo="Data escrita no painel"
        erro={erros.capturadoEm}
        dica="A data que aparece no alto do painel do governo, em “Atualizado em …”. É ela que o site mostra ao lado da tela — não a data de hoje."
      >
        <Entrada
          id="painel-capturado-em"
          type="date"
          value={estado.capturadoEm}
          aria-invalid={erros.capturadoEm ? true : undefined}
          onChange={(evento) =>
            setEstado((atual) => ({
              ...atual,
              capturadoEm: evento.target.value,
            }))
          }
        />
      </Campo>

      <CamposTraduzidos
        rotulo="Descrição da tela"
        valor={estado.alt}
        onChange={(alt) => setEstado((atual) => ({ ...atual, alt }))}
        multilinha
        linhas={3}
        opcional
        erro={erros['alt.pt']}
        dica="Para quem navega por leitor de tela e não vê a imagem. Diga em uma frase os números que aparecem — valor global, valor liberado, saldo em conta. Em branco, o site usa uma descrição genérica da tela."
      />

      {aviso ? <Aviso tom="erro">{aviso}</Aviso> : null}
      {salvo ? (
        <Aviso tom="sucesso">
          Pronto. A página de Transparência já está mostrando esta tela.
        </Aviso>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-(--border) pt-6">
        <Botao type="submit" carregando={salvando}>
          <Save aria-hidden="true" className="size-4" />
          Salvar a tela
        </Botao>

        <Botao
          type="button"
          variante="contorno"
          disabled={salvando}
          onClick={() => router.push('/admin/documentos')}
        >
          Voltar
        </Botao>
      </div>
    </form>
  )
}
