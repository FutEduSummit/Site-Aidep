import type {
  CategoryColor,
  DocumentCategoryEntry,
  InstitutionalDocument,
} from '@/content/types'

/**
 * APOIO À TABELA DE TRANSPARÊNCIA
 * ===============================
 * Regras pequenas que a tabela, o visualizador e o painel compartilham.
 * Ficam aqui para que a coluna "Download" do site e o botão do painel
 * nunca discordem sobre qual endereço baixa o arquivo.
 */

/** Cores do selo de categoria. Legibilidade conferida sobre fundo claro. */
export const coresDeCategoria: Record<CategoryColor, string> = {
  verde: 'bg-brand-100 text-brand-900',
  azul: 'bg-[#dbeafe] text-[#1e3a8a]',
  ambar: 'bg-[#fef3c7] text-[#78350f]',
  roxo: 'bg-[#ede9fe] text-[#4c1d95]',
  cinza: 'bg-paper-3 text-ink-800',
  vermelho: 'bg-danger-soft text-[#7f1d1d]',
}

/**
 * O Storage do Supabase entrega o arquivo para leitura no navegador por
 * padrão, e força o download quando a URL traz `?download=`. É o que
 * separa o botão "Visualizar" do botão "Baixar" apontando para o mesmo
 * arquivo. Arquivo servido de `/public` não tem esse parâmetro — nesse
 * caso vale o atributo `download` do link.
 */
export function urlDeDownload(doc: InstitutionalDocument): string {
  if (!doc.file.includes('/storage/v1/object/public/')) return doc.file

  const separador = doc.file.includes('?') ? '&' : '?'
  const nome = doc.fileName ? encodeURIComponent(doc.fileName) : ''
  return `${doc.file}${separador}download=${nome}`
}

export function categoriaDe(
  categorias: DocumentCategoryEntry[],
  id: string,
): DocumentCategoryEntry | undefined {
  return categorias.find((categoria) => categoria.id === id)
}
