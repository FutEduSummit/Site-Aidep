import { listarCategorias } from '@/lib/admin/leitura'
import { TituloDaPagina } from '../../../componentes/ui'
import { GestorDeCategorias } from './gestor'

export default async function CategoriasPage() {
  const categorias = await listarCategorias()

  return (
    <>
      <TituloDaPagina
        titulo="Categorias de documento"
        descricao="Os selos coloridos da coluna Categoria, na tabela de Transparência. Apagar uma categoria não apaga os documentos: eles continuam publicados, apenas sem selo."
      />

      <GestorDeCategorias categorias={categorias} />
    </>
  )
}
