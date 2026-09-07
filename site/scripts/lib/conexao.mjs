/**
 * CONEXÃO COM O BANCO DO SUPABASE
 * ===============================
 * Usada pelos scripts de terminal (`migrar.mjs`, `criar-admin.mjs`,
 * `conferir-banco.mjs`). O site nunca passa por aqui — ele fala com o
 * Supabase pela API REST, com a chave publicável e o RLS.
 *
 * Projetos novos do Supabase só aceitam conexão direta por IPv6. Em rede
 * sem IPv6 — a maioria — o caminho é o pooler, que exige saber a região.
 * Como a região não aparece no `.env`, o script descobre sozinho: tenta as
 * conhecidas até uma autenticar.
 *
 * Lê do ambiente:
 *   SUPABASE_DB_URL           opcional; se existir, é usada e o resto é ignorado
 *   NEXT_PUBLIC_SUPABASE_URL  o identificador do projeto
 *   SUPABASE_PASSWORD         senha do banco (Project Settings → Database)
 */
import pg from 'pg'

const REGIOES = [
  'sa-east-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'eu-central-1',
  'eu-west-2',
  'ap-southeast-1',
  'ap-southeast-2',
]

function referenciaDoProjeto(url) {
  if (!url) return null
  try {
    return new URL(url).hostname.split('.')[0]
  } catch {
    return null
  }
}

function enderecosPossiveis() {
  const direta = process.env.SUPABASE_DB_URL
  if (direta) return [{ rotulo: 'SUPABASE_DB_URL', url: direta }]

  const ref = referenciaDoProjeto(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const senha = process.env.SUPABASE_PASSWORD

  if (!ref || !senha) {
    throw new Error(
      'Faltam credenciais. Defina SUPABASE_DB_URL, ou NEXT_PUBLIC_SUPABASE_URL + SUPABASE_PASSWORD no .env.',
    )
  }

  const usuario = encodeURIComponent(`postgres.${ref}`)
  const chave = encodeURIComponent(senha)

  const enderecos = [
    {
      rotulo: 'conexão direta',
      url: `postgresql://postgres:${chave}@db.${ref}.supabase.co:5432/postgres`,
    },
  ]

  /* Porta 5432 é o modo sessão do pooler — o único que aceita DDL. */
  for (const regiao of REGIOES) {
    for (const prefixo of ['aws-0', 'aws-1']) {
      enderecos.push({
        rotulo: `pooler ${prefixo}-${regiao}`,
        url: `postgresql://${usuario}:${chave}@${prefixo}-${regiao}.pooler.supabase.com:5432/postgres`,
      })
    }
  }

  return enderecos
}

/** Erro que não adianta tentar em outra região — a senha é a mesma em todas. */
function senhaRecusada(erro) {
  return erro.code === '28P01' || /password authentication/i.test(erro.message)
}

export async function conectar({ silencioso = false } = {}) {
  let ultimoErro = null

  for (const endereco of enderecosPossiveis()) {
    const cliente = new pg.Client({
      connectionString: endereco.url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 12000,
      application_name: 'aidep-scripts',
    })

    try {
      await cliente.connect()
      if (!silencioso) console.log(`Conectado por ${endereco.rotulo}.`)
      return cliente
    } catch (erro) {
      await cliente.end().catch(() => {})
      ultimoErro = erro

      if (senhaRecusada(erro)) {
        throw new Error(
          'Senha do banco recusada. Confira SUPABASE_PASSWORD (Project Settings → Database → Database password).',
        )
      }
    }
  }

  throw new Error(
    `Não foi possível conectar ao banco. Último erro: ${ultimoErro?.message ?? 'desconhecido'}`,
  )
}
