/**
 * CONFERE O ESTADO DO BANCO
 * =========================
 *   node --env-file-if-exists=.env scripts/conferir-banco.mjs
 *
 * Só lê. Mostra o que a migração criou — tabelas, políticas de acesso,
 * buckets e categorias — e serve para saber se o painel está pronto para
 * uso antes de entregar o acesso ao cliente.
 */
import { conectar } from './lib/conexao.mjs'

const cliente = await conectar()

async function tabela(titulo, sql, parametros = []) {
  const { rows } = await cliente.query(sql, parametros)
  console.log(`\n=== ${titulo} ===`)
  if (rows.length === 0) {
    console.log('(nada)')
    return
  }
  console.table(rows)
}

try {
  await tabela(
    'Tabelas',
    `select c.relname as tabela,
            c.relrowsecurity as rls,
            (select count(*) from pg_policies p
              where p.schemaname = 'public' and p.tablename = c.relname) as politicas
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r'
        and c.relname in ('admins','documento_categorias','documentos','noticias','projetos')
      order by c.relname`,
  )

  await tabela(
    'Buckets',
    `select id, public, created_at::date as criado from storage.buckets order by id`,
  )

  await tabela(
    'Políticas do Storage',
    `select policyname, cmd from pg_policies
      where schemaname = 'storage' and tablename = 'objects'
      order by policyname`,
  )

  await tabela(
    'Categorias de documento',
    `select id, rotulo->>'pt' as rotulo, cor, ordem
       from public.documento_categorias order by ordem`,
  )

  await tabela(
    'Conteúdo publicado',
    `select 'noticias' as tabela, count(*) filter (where publicado) as no_ar, count(*) as total from public.noticias
     union all
     select 'projetos', count(*) filter (where publicado), count(*) from public.projetos
     union all
     select 'documentos', count(*) filter (where publicado), count(*) from public.documentos`,
  )

  const { rows: admins } = await cliente.query(
    `select a.nome, u.email
       from public.admins a
       join auth.users u on u.id = a.user_id
      order by a.criado_em`,
  )

  console.log('\n=== Administradores ===')
  if (admins.length === 0) {
    console.log(
      'Nenhum ainda. Crie o usuário em Authentication → Users e rode:\n' +
        "  insert into public.admins (user_id, nome)\n" +
        "  select id, 'Nome' from auth.users where email = 'email@dele';",
    )
  } else {
    console.table(admins)
  }
} finally {
  await cliente.end().catch(() => {})
}
