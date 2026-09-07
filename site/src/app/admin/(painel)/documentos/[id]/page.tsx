import { notFound } from 'next/navigation'
import {
  listarCategorias,
  listarProjetos,
  obterDocumento,
} from '@/lib/admin/leitura'
import { apagarDocumento } from '../../../acoes'
import { BotaoDeRemocao } from '../../../componentes/botao-de-remocao'
import { TituloDaPagina } from '../../../componentes/ui'
import { FormularioDeDocumento } from '../formulario'

type Props = { params: Promise<{ id: string }> }

function textoPt(bruto: unknown): string {
  const fonte = (bruto ?? {}) as Record<string, unknown>
  return typeof fonte.pt === 'string' ? fonte.pt : ''
}

export default async function EditarDocumentoPage({ params }: Props) {
  const { id } = await params

  const [documento, categorias, projetos] = await Promise.all([
    obterDocumento(id),
    listarCategorias(),
    listarProjetos(),
  ])

  if (!documento) notFound()

  const titulo = textoPt(documento.titulo) || 'Documento sem título'

  return (
    <>
      <TituloDaPagina
        titulo={titulo}
        descricao="Alterações entram no site assim que você salvar."
        acao={
          <BotaoDeRemocao
            id={documento.id}
            nome={titulo}
            aoRemover={apagarDocumento}
            redirecionarPara="/admin/documentos"
          />
        }
      />

      <FormularioDeDocumento
        categorias={categorias}
        projetos={projetos.map(({ slug, nome }) => ({ slug, nome }))}
        inicial={documento}
      />
    </>
  )
}
