/**
 * APLICA AS MIGRAÇÕES NO SUPABASE
 * ===============================
 *   npm run db:migrate
 *
 * Roda, em ordem alfabética, todo arquivo `.sql` de `supabase/migrations/`
 * e registra o que já rodou em `public._migracoes` — então rodar de novo
 * não repete nada. Cada arquivo vai dentro de uma transação: ou aplica
 * inteiro, ou não aplica nada.
 *
 * CONEXÃO
 * -------
 * Projetos novos do Supabase só aceitam conexão direta por IPv6. Em rede
 * sem IPv6 — a maioria — o caminho é o pooler, que exige saber a região.
 * Como a região não aparece em lugar nenhum do `.env`, o script descobre
 * sozinho: tenta as regiões conhecidas até uma autenticar.
 *
 * Lê do `.env`:
 *   NEXT_PUBLIC_SUPABASE_URL  → o identificador do projeto
 *   SUPABASE_PASSWORD         → a senha do banco (Project Settings → Database)
 *   SUPABASE_DB_URL           → opcional; se existir, é usada e o resto é ignorado
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { conectar } from './lib/conexao.mjs'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pastaDeMigracoes = path.join(raiz, 'supabase', 'migrations')

async function principal() {
  const arquivos = (await readdir(pastaDeMigracoes))
    .filter((nome) => nome.endsWith('.sql'))
    .sort()

  if (arquivos.length === 0) {
    console.log('Nenhuma migração para aplicar.')
    return
  }

  const cliente = await conectar()

  try {
    await cliente.query(`
      create table if not exists public._migracoes (
        arquivo text primary key,
        aplicada_em timestamptz not null default now()
      );
    `)

    const { rows } = await cliente.query('select arquivo from public._migracoes')
    const jaAplicadas = new Set(rows.map((linha) => linha.arquivo))

    let aplicadas = 0

    for (const arquivo of arquivos) {
      if (jaAplicadas.has(arquivo)) {
        console.log(`· ${arquivo} — já aplicada`)
        continue
      }

      const sql = await readFile(path.join(pastaDeMigracoes, arquivo), 'utf8')
      process.stdout.write(`· ${arquivo} — aplicando… `)

      try {
        await cliente.query('begin')
        await cliente.query(sql)
        await cliente.query(
          'insert into public._migracoes (arquivo) values ($1)',
          [arquivo],
        )
        await cliente.query('commit')
        aplicadas += 1
        console.log('ok')
      } catch (erro) {
        await cliente.query('rollback').catch(() => {})
        console.log('FALHOU')
        throw erro
      }
    }

    console.log(
      aplicadas === 0
        ? '\nNada a fazer: o banco já está atualizado.'
        : `\n${aplicadas} migração(ões) aplicada(s).`,
    )
  } finally {
    await cliente.end().catch(() => {})
  }
}

principal().catch((erro) => {
  console.error('\n' + (erro?.message ?? erro))
  if (erro?.detail) console.error(erro.detail)
  if (erro?.hint) console.error('Dica do Postgres:', erro.hint)
  process.exitCode = 1
})
