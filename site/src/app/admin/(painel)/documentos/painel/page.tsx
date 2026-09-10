import { ExternalLink } from 'lucide-react'
import { obterPainel } from '@/lib/admin/leitura'
import { Aviso, Cartao, TituloDaPagina } from '../../../componentes/ui'
import { FormularioDoPainel } from './formulario'

/**
 * A captura entregue com o site, que fica no ar até o primeiro envio pelo
 * painel. Repetida aqui, e não importada de
 * `content/painel-transferegov.ts`, porque de lá só sai o resultado já
 * resolvido (banco ou padrão) — e esta tela precisa mostrar justamente o
 * padrão, para o cliente ver o que vai substituir.
 */
const CAPTURA_ENTREGUE = {
  src: '/images/transparencia/painel-discricionarias-legais.png',
  largura: 3183,
  altura: 2900,
  capturadoEm: '2026-09-09',
}

const PAINEL_DO_GOVERNO =
  'https://discricionariaselegais.transferegov.sistema.gov.br/'

export default async function PainelDaTransparenciaPage() {
  const gravado = await obterPainel()

  return (
    <>
      <TituloDaPagina
        titulo="Painel Discricionárias e Legais"
        descricao="A tela que abre a página de Transparência do site, antes da lista de documentos. É a vista pública do Transferegov com os repasses federais da AIDEP — e ela envelhece a cada liberação, então vale trocar a captura sempre que os valores mudarem."
      />

      <Cartao
        titulo="A tela que está no ar"
        descricao={
          gravado
            ? 'Esta é a captura enviada por aqui. Enviar outra troca a tela do site na hora.'
            : 'Nenhuma captura foi enviada ainda: o site está publicando a que veio junto com ele. O primeiro envio por aqui passa a mandar.'
        }
      >
        <FormularioDoPainel inicial={gravado} padrao={CAPTURA_ENTREGUE} />
      </Cartao>

      <Aviso>
        Para tirar a captura: abra{' '}
        <a
          href={PAINEL_DO_GOVERNO}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 font-semibold text-brand-700 underline decoration-1 underline-offset-2 transition-colors hover:text-brand-900"
        >
          o painel Discricionárias e Legais
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
        , filtre pela AIDEP como beneficiária e capture a tela inteira da aba
        Início. O extrato em PDF e a planilha continuam sendo enviados na lista
        de documentos, como qualquer outro arquivo.
      </Aviso>
    </>
  )
}
