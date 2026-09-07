import { notFound } from 'next/navigation'
import { obterProjeto } from '@/lib/admin/leitura'
import { apagarProjeto } from '../../../acoes'
import { BotaoDeRemocao } from '../../../componentes/botao-de-remocao'
import { TituloDaPagina } from '../../../componentes/ui'
import { FormularioDeProjeto } from '../formulario'

type Props = { params: Promise<{ id: string }> }

export default async function EditarProjetoPage({ params }: Props) {
  const { id } = await params
  const projeto = await obterProjeto(id)

  if (!projeto) notFound()

  return (
    <>
      <TituloDaPagina
        titulo={projeto.nome}
        descricao="Alterações entram no site assim que você salvar."
        acao={
          <BotaoDeRemocao
            id={projeto.id}
            nome={projeto.nome}
            aoRemover={apagarProjeto}
            redirecionarPara="/admin/projetos"
          />
        }
      />

      <FormularioDeProjeto inicial={projeto} />
    </>
  )
}
