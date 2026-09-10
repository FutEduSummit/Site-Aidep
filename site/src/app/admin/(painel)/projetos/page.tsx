import { ImageIcon, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { capaDoProjeto } from '@/lib/admin/capas'
import { listarProjetos } from '@/lib/admin/leitura'
import { apagarProjeto, publicarProjeto } from '../../acoes'
import { BotaoDeImportacao } from '../../componentes/botao-de-importacao'
import { BotaoDeRemocao } from '../../componentes/botao-de-remocao'
import { InterruptorDePublicacao } from '../../componentes/interruptor-de-publicacao'
import { Aviso, Botao, Cartao, TituloDaPagina } from '../../componentes/ui'

function textoPt(bruto: unknown): string {
  const fonte = (bruto ?? {}) as Record<string, unknown>
  return typeof fonte.pt === 'string' ? fonte.pt : ''
}

export default async function ProjetosPage() {
  const projetos = await listarProjetos()

  return (
    <>
      <TituloDaPagina
        titulo="Projetos"
        descricao="Os projetos da AIDEP, como aparecem na página de Projetos e na página inicial."
        acao={
          <Link href="/admin/projetos/novo">
            <Botao type="button">
              <Plus aria-hidden="true" className="size-4" />
              Cadastrar projeto
            </Botao>
          </Link>
        }
      />

      {projetos.length === 0 ? (
        <Cartao
          titulo="Ainda não há projetos no painel"
          descricao="Os três projetos do briefing (Coração Valente, Futsal na Escola e FutEdu Summit) estão no site, mas ainda vivem no código. Traga-os para cá e passe a editá-los por aqui."
        >
          <BotaoDeImportacao />
        </Cartao>
      ) : (
        <ul className="flex flex-col border-t border-(--border)">
          {projetos.map((projeto) => {
            /* A capa como o site a resolve: a enviada pelo painel ou a
               fotografia oficial do acervo (ver `lib/admin/capas.ts`). Os
               projetos do briefing sobem sem capa própria de propósito. */
            const capa = capaDoProjeto(projeto)

            return (
              <li
                key={projeto.id}
                className="flex flex-col gap-4 border-b border-(--border) py-4 sm:flex-row sm:items-center sm:gap-6"
              >
                <span
                  className="relative flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden border border-(--border) bg-paper-3"
                  title={capa?.doAcervo ? 'Fotografia do acervo' : undefined}
                >
                  {capa ? (
                    <Image
                      src={capa.src}
                      alt=""
                      fill
                      sizes="80px"
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
                    href={`/admin/projetos/${projeto.id}`}
                    className="text-body font-semibold tracking-[-0.01em] hover:underline"
                  >
                    {projeto.nome}
                  </Link>

                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-micro uppercase tracking-[0.12em] text-(--fg-subtle)">
                    <span className="text-brand-700">
                      {textoPt(projeto.categoria)}
                    </span>
                    <code className="normal-case tracking-normal">
                      /{projeto.slug}
                    </code>
                    <span>Ordem {projeto.ordem}</span>
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <InterruptorDePublicacao
                    id={projeto.id}
                    nome={projeto.nome}
                    publicado={projeto.publicado}
                    aoAlternar={publicarProjeto}
                  />
                  {projeto.publicado ? (
                    <a
                      href={`/pt/projetos/${projeto.slug}`}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <Botao type="button" variante="discreto">
                        Ver no site
                      </Botao>
                    </a>
                  ) : null}
                  <Link href={`/admin/projetos/${projeto.id}`}>
                    <Botao type="button" variante="contorno">
                      Editar
                    </Botao>
                  </Link>
                  <BotaoDeRemocao
                    id={projeto.id}
                    nome={projeto.nome}
                    aoRemover={apagarProjeto}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {projetos.length > 0 ? (
        <Aviso>
          Enquanto houver projeto cadastrado aqui, o site usa esta lista. Se
          todos forem apagados, ele volta a exibir os três projetos do briefing
          que estão no código.
        </Aviso>
      ) : null}
    </>
  )
}
