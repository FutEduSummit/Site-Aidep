import { notFound } from 'next/navigation'
import { listarProjetos, obterNoticia } from '@/lib/admin/leitura'
import { apagarNoticia } from '../../../acoes'
import { BotaoDeRemocao } from '../../../componentes/botao-de-remocao'
import { TituloDaPagina } from '../../../componentes/ui'
import { FormularioDeNoticia } from '../formulario'

type Props = { params: Promise<{ id: string }> }

function textoPt(bruto: unknown): string {
  const fonte = (bruto ?? {}) as Record<string, unknown>
  return typeof fonte.pt === 'string' ? fonte.pt : ''
}

export default async function EditarNoticiaPage({ params }: Props) {
  const { id } = await params

  const [noticia, projetos] = await Promise.all([
    obterNoticia(id),
    listarProjetos(),
  ])

  if (!noticia) notFound()

  const titulo = textoPt(noticia.titulo) || 'Notícia sem título'

  return (
    <>
      <TituloDaPagina
        titulo={titulo}
        descricao={
          noticia.publicado
            ? 'Está no ar. As alterações aparecem no site assim que você salvar.'
            : 'Está como rascunho. Ligue "Publicar no site" para colocá-la no ar.'
        }
        acao={
          <BotaoDeRemocao
            id={noticia.id}
            nome={titulo}
            aoRemover={apagarNoticia}
            redirecionarPara="/admin/noticias"
          />
        }
      />

      <FormularioDeNoticia
        projetos={projetos.map(({ slug, nome }) => ({ slug, nome }))}
        inicial={noticia}
      />
    </>
  )
}
