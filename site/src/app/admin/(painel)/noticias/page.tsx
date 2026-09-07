import { ImageIcon, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { listarNoticias } from '@/lib/admin/leitura'
import { formatDate } from '@/lib/utils'
import { apagarNoticia } from '../../acoes'
import { BotaoDeRemocao } from '../../componentes/botao-de-remocao'
import { Aviso, Botao, TituloDaPagina } from '../../componentes/ui'

function textoPt(bruto: unknown): string {
  const fonte = (bruto ?? {}) as Record<string, unknown>
  return typeof fonte.pt === 'string' ? fonte.pt : ''
}

export default async function NoticiasPage() {
  const noticias = await listarNoticias()

  return (
    <>
      <TituloDaPagina
        titulo="Notícias"
        descricao="O que sai na página de Notícias do site e na seção da página inicial."
        acao={
          <Link href="/admin/noticias/nova">
            <Botao type="button">
              <Plus aria-hidden="true" className="size-4" />
              Escrever notícia
            </Botao>
          </Link>
        }
      />

      {noticias.length === 0 ? (
        <Aviso>
          Nenhuma notícia escrita ainda. Enquanto esta lista estiver vazia, o
          site exibe as notícias de exemplo (ou o estado vazio institucional, se
          o conteúdo de exemplo estiver desligado).
        </Aviso>
      ) : (
        <ul className="flex flex-col border-t border-(--border)">
          {noticias.map((noticia) => (
            <li
              key={noticia.id}
              className="flex flex-col gap-4 border-b border-(--border) py-4 sm:flex-row sm:items-center sm:gap-6"
            >
              <span className="relative flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden border border-(--border) bg-paper-3">
                {noticia.capa_url ? (
                  <Image
                    src={noticia.capa_url}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <ImageIcon
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="size-4 text-(--fg-subtle)"
                  />
                )}
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Link
                  href={`/admin/noticias/${noticia.id}`}
                  className="text-body font-semibold tracking-[-0.01em] hover:underline"
                >
                  {textoPt(noticia.titulo) || 'Sem título'}
                </Link>

                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-micro uppercase tracking-[0.12em] text-(--fg-subtle)">
                  <span className="text-brand-700">
                    {textoPt(noticia.categoria)}
                  </span>
                  <time dateTime={noticia.data}>
                    {formatDate(noticia.data, 'pt-BR')}
                  </time>
                  <code className="normal-case tracking-normal">
                    /{noticia.slug}
                  </code>
                  {!noticia.publicado ? (
                    <span className="font-semibold text-danger">Rascunho</span>
                  ) : null}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {noticia.publicado ? (
                  <a
                    href={`/pt/noticias/${noticia.slug}`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <Botao type="button" variante="discreto">
                      Ver no site
                    </Botao>
                  </a>
                ) : null}
                <Link href={`/admin/noticias/${noticia.id}`}>
                  <Botao type="button" variante="contorno">
                    Editar
                  </Botao>
                </Link>
                <BotaoDeRemocao
                  id={noticia.id}
                  nome={textoPt(noticia.titulo) || 'notícia'}
                  aoRemover={apagarNoticia}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
