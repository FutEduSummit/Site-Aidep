import { Plus } from 'lucide-react'
import Link from 'next/link'
import { DocumentPreview } from '@/components/ui/document-preview'
import { listarCategorias, listarDocumentos } from '@/lib/admin/leitura'
import { coresDeCategoria } from '@/lib/documentos'
import { paraCategoria, paraDocumento } from '@/lib/cms/mapear'
import { cn, formatDate } from '@/lib/utils'
import { apagarDocumento, publicarDocumento } from '../../acoes'
import { BotaoDeRemocao } from '../../componentes/botao-de-remocao'
import { InterruptorDePublicacao } from '../../componentes/interruptor-de-publicacao'
import { Aviso, Botao, TituloDaPagina } from '../../componentes/ui'

function textoPt(bruto: unknown): string {
  const fonte = (bruto ?? {}) as Record<string, unknown>
  return typeof fonte.pt === 'string' ? fonte.pt : ''
}

export default async function DocumentosPage() {
  const [documentos, categoriasBrutas] = await Promise.all([
    listarDocumentos(),
    listarCategorias(),
  ])

  const categorias = categoriasBrutas.map(paraCategoria)

  return (
    <>
      <TituloDaPagina
        titulo="Transparência"
        descricao="Os documentos que aparecem na tabela da página de Transparência do site. A chave de cada linha publica ou volta para rascunho na hora."
        acao={
          <Link href="/admin/documentos/novo">
            <Botao type="button">
              <Plus aria-hidden="true" className="size-4" />
              Enviar documento
            </Botao>
          </Link>
        }
      />

      {documentos.length === 0 ? (
        <Aviso>
          Nenhum documento enviado ainda. Enquanto esta lista estiver vazia, a
          página de Transparência mostra os documentos de exemplo (ou o estado
          vazio institucional, se o conteúdo de exemplo estiver desligado).
        </Aviso>
      ) : (
        <ul className="flex flex-col border-t border-(--border)">
          {documentos.map((documento) => {
            const categoria = categorias.find(
              (item) => item.id === documento.categoria_id,
            )

            return (
              <li
                key={documento.id}
                className="flex flex-col gap-4 border-b border-(--border) py-4 sm:flex-row sm:items-center sm:gap-6"
              >
                {/* A mesma prévia da tabela do site: a miniatura guardada
                    quando existe e, quando não, a primeira página do PDF ou
                    a grade da planilha desenhadas aqui no navegador (ver
                    `DocumentPreview`). É o que faz o documento semeado
                    direto no banco aparecer com a cara dele, e não com o
                    ícone genérico. */}
                <DocumentPreview
                  doc={paraDocumento(documento)}
                  className="h-16 w-12"
                  sizes="48px"
                />

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Link
                    href={`/admin/documentos/${documento.id}`}
                    className="text-body font-semibold tracking-[-0.01em] hover:underline"
                  >
                    {textoPt(documento.titulo) || 'Sem título'}
                  </Link>

                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-micro uppercase tracking-[0.12em] text-(--fg-subtle)">
                    {categoria ? (
                      <span
                        className={cn(
                          'px-2 py-0.5 text-[0.6875rem] font-semibold normal-case tracking-[0.08em]',
                          coresDeCategoria[categoria.color],
                        )}
                      >
                        {categoria.label.pt}
                      </span>
                    ) : null}
                    <span>{documento.formato.toUpperCase()}</span>
                    <span>{documento.ano}</span>
                    <time dateTime={documento.publicado_em}>
                      {formatDate(documento.publicado_em, 'pt-BR')}
                    </time>
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <InterruptorDePublicacao
                    id={documento.id}
                    nome={textoPt(documento.titulo) || 'documento'}
                    publicado={documento.publicado}
                    aoAlternar={publicarDocumento}
                  />
                  <Link href={`/admin/documentos/${documento.id}`}>
                    <Botao type="button" variante="contorno">
                      Editar
                    </Botao>
                  </Link>
                  <BotaoDeRemocao
                    id={documento.id}
                    nome={textoPt(documento.titulo) || 'documento'}
                    aoRemover={apagarDocumento}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
