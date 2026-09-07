import { listarProjetos } from '@/lib/admin/leitura'
import { TituloDaPagina } from '../../../componentes/ui'
import { FormularioDeNoticia } from '../formulario'

export default async function NovaNoticiaPage() {
  const projetos = await listarProjetos()

  return (
    <>
      <TituloDaPagina
        titulo="Escrever notícia"
        descricao="Escreva em português. Inglês e espanhol são opcionais — sem eles, o site exibe o texto em português nos três idiomas."
      />

      <FormularioDeNoticia
        projetos={projetos.map(({ slug, nome }) => ({ slug, nome }))}
      />
    </>
  )
}
