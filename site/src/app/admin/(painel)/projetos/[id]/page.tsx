import { notFound } from 'next/navigation'
import { capaDoProjeto, galeriaDoAcervo } from '@/lib/admin/capas'
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

  /* O que a página do projeto publica hoje sem nada enviado pelo painel: a
     capa oficial e o álbum do acervo (ver `lib/admin/capas.ts`). Quem
     decide se aparecem é o formulário — só entram onde o painel não tem
     nada no lugar. */
  const capa = capaDoProjeto(projeto)
  const galeria = galeriaDoAcervo(projeto.slug)

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

      <FormularioDeProjeto
        inicial={projeto}
        capaDoAcervo={capa?.doAcervo ? capa : null}
        galeriaDoAcervo={galeria}
      />
    </>
  )
}
