import { notFound } from 'next/navigation'
import { capaDaNoticia } from '@/lib/admin/capas'
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

  /* A capa que o site publica hoje. Se ela vem do acervo — e não do
     Storage —, o formulário a mostra na moldura em vez de sugerir que a
     notícia está sem fotografia (ver `lib/admin/capas.ts`). */
  const capa = capaDaNoticia(noticia)

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
        capaDoAcervo={capa?.doAcervo ? capa : null}
      />
    </>
  )
}
