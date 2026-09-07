import { FileText, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { listarCategorias, listarDocumentos } from '@/lib/admin/leitura'
import { coresDeCategoria } from '@/lib/documentos'
import { paraCategoria } from '@/lib/cms/mapear'
import { cn, formatDate } from '@/lib/utils'
import { apagarDocumento } from '../../acoes'
import { BotaoDeRemocao } from '../../componentes/botao-de-remocao'
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
        descricao="Os documentos que aparecem na tabela da página de Transparência do site."
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
                <span className="relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden border border-(--border) bg-paper-3">
                  {documento.miniatura_url ? (
                    <Image
                      src={documento.miniatura_url}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover object-top"
                    />
                  ) : (
                    <FileText
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="size-4 text-(--fg-subtle)"
                    />
                  )}
                </span>

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
                    {!documento.publicado ? (
                      <span className="font-semibold text-danger">Rascunho</span>
                    ) : null}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
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
