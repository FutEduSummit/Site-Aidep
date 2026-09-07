/**
 * CRIA (OU ATUALIZA) UM ADMINISTRADOR DO PAINEL
 * =============================================
 *   node --env-file-if-exists=.env scripts/criar-admin.mjs <email> [senha] [nome]
 *
 * Sem senha, o script sorteia uma forte e imprime uma única vez.
 *
 * Faz as duas metades que o acesso exige, e que são fáceis de esquecer
 * quando se cria o usuário na mão pelo painel do Supabase:
 *
 *   1. a conta em `auth.users` (+ a linha em `auth.identities`, sem a qual
 *      o login por senha não funciona nas versões atuais do GoTrue);
 *   2. a liberação em `public.admins` — sem ela a pessoa entra e não
 *      consegue salvar nada, porque é o RLS que decide, não a interface.
 *
 * Rodar de novo com o mesmo e-mail troca a senha e mantém o conteúdo que a
 * pessoa já publicou.
 */
import { randomBytes } from 'node:crypto'
import { conectar } from './lib/conexao.mjs'

const [email, senhaInformada, ...restoDoNome] = process.argv.slice(2)

if (!email || !email.includes('@')) {
  console.error(
    'Uso: node --env-file-if-exists=.env scripts/criar-admin.mjs <email> [senha] [nome]',
  )
  process.exit(1)
}

/** Senha forte e digitável: sem caracteres que se confundem na leitura. */
function sortearSenha() {
  const alfabeto = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(20)
  return Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join('')
}

const senha = senhaInformada || sortearSenha()
const nome = restoDoNome.join(' ') || null
const sorteada = !senhaInformada

if (senha.length < 8) {
  console.error('A senha precisa de pelo menos 8 caracteres.')
  process.exit(1)
}

const cliente = await conectar()

try {
  await cliente.query('begin')

  /* O Supabase instala o pgcrypto no schema `extensions`; garantir o
     caminho evita "function crypt(...) does not exist". */
  await cliente.query('set local search_path = public, extensions')

  const { rows: existentes } = await cliente.query(
    'select id from auth.users where lower(email) = lower($1)',
    [email],
  )

  let usuarioId = existentes[0]?.id ?? null
  let criado = false

  if (usuarioId) {
    await cliente.query(
      `update auth.users
          set encrypted_password = crypt($2, gen_salt('bf')),
              email_confirmed_at = coalesce(email_confirmed_at, now()),
              updated_at = now()
        where id = $1`,
      [usuarioId, senha],
    )
  } else {
    /* Nada abaixo é decorativo: o serviço de autenticação do Supabase lê
       estas colunas como texto obrigatório. Deixá-las nulas — o padrão de
       quem insere o usuário por SQL — faz todo login responder
       "Database error querying schema", sem pista do motivo. */
    const { rows } = await cliente.query(
      `insert into auth.users (
         instance_id, id, aud, role, email, encrypted_password,
         email_confirmed_at, created_at, updated_at,
         raw_app_meta_data, raw_user_meta_data,
         confirmation_token, recovery_token,
         email_change, email_change_token_new, email_change_token_current,
         phone_change, phone_change_token, reauthentication_token
       ) values (
         '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
         'authenticated', 'authenticated', lower($1), crypt($2, gen_salt('bf')),
         now(), now(), now(),
         '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
         '', '', '', '', '', '', '', ''
       )
       returning id`,
      [email, senha],
    )

    usuarioId = rows[0].id
    criado = true

    await cliente.query(
      `insert into auth.identities (
         id, user_id, provider_id, identity_data, provider,
         last_sign_in_at, created_at, updated_at
       ) values (
         gen_random_uuid(), $1::uuid, ($1::uuid)::text,
         jsonb_build_object('sub', ($1::uuid)::text, 'email', lower($2), 'email_verified', true),
         'email', now(), now(), now()
       )`,
      [usuarioId, email],
    )
  }

  /* Também conserta contas criadas antes desta correção, ou pela mão de
     alguém direto no SQL do Supabase. */
  await cliente.query(
    `update auth.users
        set confirmation_token = coalesce(confirmation_token, ''),
            recovery_token = coalesce(recovery_token, ''),
            email_change = coalesce(email_change, ''),
            email_change_token_new = coalesce(email_change_token_new, ''),
            email_change_token_current = coalesce(email_change_token_current, ''),
            phone_change = coalesce(phone_change, ''),
            phone_change_token = coalesce(phone_change_token, ''),
            reauthentication_token = coalesce(reauthentication_token, '')
      where id = $1`,
    [usuarioId],
  )

  await cliente.query(
    `insert into public.admins (user_id, nome)
     values ($1, $2)
     on conflict (user_id) do update set nome = coalesce(excluded.nome, public.admins.nome)`,
    [usuarioId, nome],
  )

  await cliente.query('commit')

  console.log(`\n${criado ? 'Administrador criado' : 'Senha atualizada'}.\n`)
  console.log(`  Endereço  /admin/login`)
  console.log(`  E-mail    ${email.toLowerCase()}`)
  console.log(`  Senha     ${senha}`)
  if (nome) console.log(`  Nome      ${nome}`)

  if (sorteada) {
    console.log(
      '\nEsta senha não fica guardada em lugar nenhum: copie agora. Para trocar,\n' +
        'rode o mesmo comando informando a senha nova.',
    )
  }
} catch (erro) {
  await cliente.query('rollback').catch(() => {})
  console.error('\nNão foi possível criar o administrador.')
  console.error(erro?.message ?? erro)
  if (erro?.detail) console.error(erro.detail)
  process.exitCode = 1
} finally {
  await cliente.end().catch(() => {})
}
