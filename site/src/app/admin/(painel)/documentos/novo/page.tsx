import Link from 'next/link'
import { listarCategorias, listarProjetos } from '@/lib/admin/leitura'
import { Aviso, TituloDaPagina } from '../../../componentes/ui'
import { FormularioDeDocumento } from '../formulario'

export default async function NovoDocumentoPage() {
  const [categorias, projetos] = await Promise.all([
    listarCategorias(),
    listarProjetos(),
  ])

  return (
    <>
      <TituloDaPagina
        titulo="Enviar documento"
        descricao="Escolha o arquivo e o painel cuida do resto: envia, gera a miniatura da primeira página e publica na tabela de Transparência."
      />

      {categorias.length === 0 ? (
        <Aviso tom="erro">
          Cadastre pelo menos uma categoria antes de enviar documentos:{' '}
          <Link href="/admin/documentos/categorias" className="underline">
            criar categoria
          </Link>
          .
        </Aviso>
      ) : (
        <FormularioDeDocumento
          categorias={categorias}
          projetos={projetos.map(({ slug, nome }) => ({ slug, nome }))}
        />
      )}
    </>
  )
}
