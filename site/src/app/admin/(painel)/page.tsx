import { ArrowRight, FileText, FolderKanban, Newspaper } from 'lucide-react'
import Link from 'next/link'
import { resumo } from '@/lib/admin/leitura'
import { BotaoDeImportacao } from '../componentes/botao-de-importacao'
import { Cartao, TituloDaPagina } from '../componentes/ui'

export default async function PainelInicio() {
  const numeros = await resumo()

  const secoes = [
    {
      href: '/admin/noticias',
      titulo: 'Notícias',
      Icone: Newspaper,
      dados: numeros.noticias,
      acao: 'Escrever notícia',
      criar: '/admin/noticias/nova',
    },
    {
      href: '/admin/projetos',
      titulo: 'Projetos',
      Icone: FolderKanban,
      dados: numeros.projetos,
      acao: 'Cadastrar projeto',
      criar: '/admin/projetos/novo',
    },
    {
      href: '/admin/documentos',
      titulo: 'Transparência',
      Icone: FileText,
      dados: numeros.documentos,
      acao: 'Enviar documento',
      criar: '/admin/documentos/novo',
    },
  ]

  return (
    <>
      <TituloDaPagina
        titulo="Painel de conteúdo"
        descricao="Tudo o que for publicado aqui entra no site imediatamente."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {secoes.map(({ href, titulo, Icone, dados, acao, criar }) => (
          <div
            key={href}
            className="flex flex-col gap-5 border border-(--border) bg-(--bg) p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-micro font-semibold uppercase tracking-[0.14em] text-(--fg-subtle)">
                {titulo}
              </h2>
              <Icone aria-hidden="true" className="size-4 text-(--fg-subtle)" />
            </div>

            <p className="flex items-baseline gap-2">
              <span className="text-h1 font-extrabold tracking-[-0.045em] tabular-nums">
                {dados.publicados}
              </span>
              <span className="text-small text-(--fg-subtle)">
                {dados.publicados === 1 ? 'no ar' : 'no ar'}
                {dados.total > dados.publicados
                  ? ` · ${dados.total - dados.publicados} em rascunho`
                  : ''}
              </span>
            </p>

            <div className="mt-auto flex flex-col gap-2 border-t border-(--border) pt-4">
              <Link
                href={criar}
                className="inline-flex items-center gap-2 text-small font-semibold text-brand-700 transition-colors hover:text-brand-900"
              >
                {acao}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href={href}
                className="text-micro uppercase tracking-[0.12em] text-(--fg-subtle) transition-colors hover:text-(--fg)"
              >
                Ver todos
              </Link>
            </div>
          </div>
        ))}
      </div>

      {numeros.projetos.total === 0 ? (
        <Cartao
          titulo="Trazer os projetos que já estão no site"
          descricao="Os três projetos do briefing — Coração Valente, Futsal na Escola e FutEdu Summit — ainda vivem no código do site. Traga-os para cá para poder editá-los por aqui."
        >
          <BotaoDeImportacao />
        </Cartao>
      ) : null}
    </>
  )
}
