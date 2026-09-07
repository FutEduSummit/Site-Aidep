import 'server-only'

import { tabelaDeMunicipios } from '@/content/municipios'

/**
 * DE NOME DE CIDADE PARA COORDENADA
 * =================================
 * O cliente cadastra "Aracaju, SE" — não latitude e longitude. Quem
 * transforma um no outro é este arquivo, com os 5.571 municípios do IBGE
 * (`content/municipios.ts`, gerado por `npm run mapa:dados`).
 *
 * `server-only` de propósito: a tabela tem 184 kB e não pode ir para o
 * navegador. O mapa é montado no servidor e o que chega ao cliente é só o
 * punhado de pontos do projeto — ver `lib/mapa.ts`.
 *
 * O índice é montado uma vez por processo, na primeira busca.
 */

export type Municipio = {
  nome: string
  /** Sigla da unidade federativa — 'SE', 'DF', 'PR'… */
  uf: string
  lat: number
  lng: number
  capital: boolean
}

/** "São Paulo" e "sao  paulo" precisam bater: fora acento, caixa e ruído. */
export function normalizarNome(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`.]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

type Indice = {
  todos: Municipio[]
  /** 'aracaju|se' → município. Chave exata, quando a UF é conhecida. */
  porNomeEUf: Map<string, Municipio>
  /** 'aracaju' → todos os municípios com esse nome, em qualquer estado. */
  porNome: Map<string, Municipio[]>
}

let indice: Indice | null = null

function indexar(): Indice {
  if (indice) return indice

  const todos: Municipio[] = []
  const porNomeEUf = new Map<string, Municipio>()
  const porNome = new Map<string, Municipio[]>()

  for (const linha of tabelaDeMunicipios.split('\n')) {
    if (!linha) continue

    const [nome, uf, lat, lng, marca] = linha.split('|')
    const municipio: Municipio = {
      nome,
      uf,
      lat: Number(lat),
      lng: Number(lng),
      capital: marca === 'c',
    }

    todos.push(municipio)

    const chave = normalizarNome(nome)
    porNomeEUf.set(`${chave}|${uf.toLowerCase()}`, municipio)

    const homonimos = porNome.get(chave)
    if (homonimos) homonimos.push(municipio)
    else porNome.set(chave, [municipio])
  }

  indice = { todos, porNomeEUf, porNome }
  return indice
}

/**
 * O município cadastrado, ou `null` quando não há como saber qual é.
 *
 * Com a UF, a resposta é exata. Sem a UF, vale o nome único; havendo
 * homônimos em estados diferentes ("Palmas" existe em TO e no PR), fica a
 * capital — e se nenhuma for capital, devolve `null` em vez de escolher no
 * escuro e pôr o ponto na cidade errada.
 */
export function encontrarMunicipio(
  nome: string,
  uf?: string | null,
): Municipio | null {
  const { porNomeEUf, porNome } = indexar()
  const chave = normalizarNome(nome)
  if (!chave) return null

  if (uf) {
    const exato = porNomeEUf.get(`${chave}|${uf.trim().toLowerCase()}`)
    if (exato) return exato
  }

  const homonimos = porNome.get(chave)
  if (!homonimos || homonimos.length === 0) return null
  if (homonimos.length === 1) return homonimos[0]

  return homonimos.find((municipio) => municipio.capital) ?? null
}

/**
 * Busca por trecho do nome, para o campo de cidade do painel: quem digita
 * "arac" recebe Aracaju, Aracati, Araci… Prioriza quem começa com o termo
 * e as capitais, que é o que se procura na maioria das vezes.
 */
export function buscarMunicipios(termo: string, limite = 8): Municipio[] {
  const chave = normalizarNome(termo)
  if (chave.length < 2) return []

  const { todos } = indexar()
  const comeca: Municipio[] = []
  const contem: Municipio[] = []

  for (const municipio of todos) {
    const nome = normalizarNome(municipio.nome)
    if (nome.startsWith(chave)) comeca.push(municipio)
    else if (nome.includes(chave)) contem.push(municipio)
  }

  const porRelevancia = (a: Municipio, b: Municipio) =>
    Number(b.capital) - Number(a.capital) ||
    a.nome.localeCompare(b.nome, 'pt-BR')

  return [...comeca.sort(porRelevancia), ...contem.sort(porRelevancia)].slice(
    0,
    limite,
  )
}
