-- ============================================================================
-- AIDEP — PLATAFORMA DE CONTEÚDO
-- ============================================================================
-- Cria tudo o que o painel do cliente precisa: tabelas de notícias, projetos,
-- documentos de transparência e categorias de documento, os dois buckets de
-- arquivo e as regras de acesso.
--
-- COMO APLICAR (uma única vez):
--   1. Supabase → SQL Editor → New query
--   2. cole este arquivo inteiro e rode
--   3. crie o usuário do cliente em Authentication → Users → Add user
--   4. libere esse usuário como administrador:
--        insert into public.admins (user_id, nome)
--        select id, 'Nome do cliente' from auth.users where email = 'email@dele';
--
-- Rodar de novo é seguro: tudo é idempotente.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Quem pode escrever
-- ---------------------------------------------------------------------------
-- Ter conta no Supabase não basta: só quem estiver nesta tabela publica
-- conteúdo. Assim, mesmo que o cadastro público fique ligado por engano,
-- ninguém de fora consegue alterar o site.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  nome       text,
  criado_em  timestamptz not null default now()
);

-- SECURITY DEFINER de propósito: a função lê `admins` por fora do RLS, o que
-- evita a recursão infinita de uma política de `admins` consultar `admins`.
create or replace function public.e_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $funcao$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$funcao$;

revoke all on function public.e_admin() from public;
grant execute on function public.e_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Carimbo de atualização
-- ---------------------------------------------------------------------------
create or replace function public.marcar_atualizacao()
returns trigger
language plpgsql
as $gatilho$
begin
  new.atualizado_em := now();
  return new;
end;
$gatilho$;

-- ---------------------------------------------------------------------------
-- Categorias de documento — o cliente cria as dele no painel
-- ---------------------------------------------------------------------------
create table if not exists public.documento_categorias (
  id         text primary key,
  rotulo     jsonb not null default '{}'::jsonb,   -- { pt, en, es }
  cor        text  not null default 'verde',
  ordem      int   not null default 0,
  criado_em  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Documentos da transparência
-- ---------------------------------------------------------------------------
create table if not exists public.documentos (
  id             uuid primary key default gen_random_uuid(),
  titulo         jsonb not null default '{}'::jsonb,   -- { pt, en, es }
  conteudo       jsonb not null default '{}'::jsonb,   -- descrição da coluna "Conteúdo"
  categoria_id   text references public.documento_categorias (id) on delete set null,
  ano            int  not null,
  publicado_em   date not null,
  arquivo_url    text not null,
  arquivo_path   text,                                 -- caminho no bucket, para poder apagar
  arquivo_nome   text,
  formato        text not null default 'pdf'
                 check (formato in ('pdf','xlsx','csv','doc','docx','imagem','outro')),
  tamanho_bytes  bigint,
  miniatura_url  text,
  miniatura_path text,
  projeto_slug   text,
  publicado      boolean not null default true,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

create index if not exists documentos_ordenacao_idx
  on public.documentos (publicado, publicado_em desc);

drop trigger if exists documentos_atualizacao on public.documentos;
create trigger documentos_atualizacao before update on public.documentos
  for each row execute function public.marcar_atualizacao();

-- ---------------------------------------------------------------------------
-- Notícias
-- ---------------------------------------------------------------------------
create table if not exists public.noticias (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  titulo         jsonb not null default '{}'::jsonb,
  resumo         jsonb not null default '{}'::jsonb,
  corpo          jsonb not null default '{}'::jsonb,   -- { pt: Bloco[], en: [], es: [] }
  categoria      jsonb not null default '{}'::jsonb,
  data           date not null,
  autor          text,
  capa_url       text,
  capa_path      text,
  capa_largura   int,
  capa_altura    int,
  capa_alt       jsonb not null default '{}'::jsonb,
  projetos_relacionados text[] not null default '{}',
  seo_titulo     jsonb,
  seo_descricao  jsonb,
  publicado      boolean not null default false,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

create index if not exists noticias_ordenacao_idx
  on public.noticias (publicado, data desc);

drop trigger if exists noticias_atualizacao on public.noticias;
create trigger noticias_atualizacao before update on public.noticias
  for each row execute function public.marcar_atualizacao();

-- ---------------------------------------------------------------------------
-- Projetos
-- ---------------------------------------------------------------------------
create table if not exists public.projetos (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  nome           text not null,
  categoria      jsonb not null default '{}'::jsonb,
  resumo         jsonb not null default '{}'::jsonb,
  descricao      jsonb not null default '{}'::jsonb,   -- { pt: parágrafos[], … }
  objetivo       jsonb,
  publico        jsonb not null default '{}'::jsonb,   -- { pt: itens[], … }
  locais         jsonb not null default '[]'::jsonb,
  metricas       jsonb not null default '[]'::jsonb,
  metodologia    jsonb,
  resultados     jsonb,
  galeria        jsonb not null default '[]'::jsonb,
  parceiros      text[] not null default '{}',
  capa_url       text,
  capa_path      text,
  capa_largura   int,
  capa_altura    int,
  capa_alt       jsonb not null default '{}'::jsonb,
  ordem          int not null default 0,
  publicado      boolean not null default true,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

create index if not exists projetos_ordenacao_idx
  on public.projetos (publicado, ordem, criado_em);

drop trigger if exists projetos_atualizacao on public.projetos;
create trigger projetos_atualizacao before update on public.projetos
  for each row execute function public.marcar_atualizacao();

-- ---------------------------------------------------------------------------
-- Regras de acesso
-- ---------------------------------------------------------------------------
-- Leitura: o visitante anônimo enxerga apenas o que está publicado.
-- Escrita: apenas administradores.
alter table public.admins               enable row level security;
alter table public.documento_categorias enable row level security;
alter table public.documentos           enable row level security;
alter table public.noticias             enable row level security;
alter table public.projetos             enable row level security;

drop policy if exists admins_leitura on public.admins;
create policy admins_leitura on public.admins
  for select using (public.e_admin() or user_id = auth.uid());

drop policy if exists admins_escrita on public.admins;
create policy admins_escrita on public.admins
  for all using (public.e_admin()) with check (public.e_admin());

drop policy if exists categorias_leitura on public.documento_categorias;
create policy categorias_leitura on public.documento_categorias
  for select using (true);

drop policy if exists categorias_escrita on public.documento_categorias;
create policy categorias_escrita on public.documento_categorias
  for all using (public.e_admin()) with check (public.e_admin());

drop policy if exists documentos_leitura on public.documentos;
create policy documentos_leitura on public.documentos
  for select using (publicado or public.e_admin());

drop policy if exists documentos_escrita on public.documentos;
create policy documentos_escrita on public.documentos
  for all using (public.e_admin()) with check (public.e_admin());

drop policy if exists noticias_leitura on public.noticias;
create policy noticias_leitura on public.noticias
  for select using (publicado or public.e_admin());

drop policy if exists noticias_escrita on public.noticias;
create policy noticias_escrita on public.noticias
  for all using (public.e_admin()) with check (public.e_admin());

drop policy if exists projetos_leitura on public.projetos;
create policy projetos_leitura on public.projetos
  for select using (publicado or public.e_admin());

drop policy if exists projetos_escrita on public.projetos;
create policy projetos_escrita on public.projetos
  for all using (public.e_admin()) with check (public.e_admin());

-- ---------------------------------------------------------------------------
-- Arquivos
-- ---------------------------------------------------------------------------
-- `documentos` guarda os PDFs da transparência; `imagens`, as capas de
-- notícia e projeto e as miniaturas dos documentos. Ambos com leitura
-- pública — é conteúdo destinado ao site — e escrita só para administradores.
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('imagens', 'imagens', true)
on conflict (id) do update set public = true;

drop policy if exists arquivos_leitura on storage.objects;
create policy arquivos_leitura on storage.objects
  for select using (bucket_id in ('documentos', 'imagens'));

drop policy if exists arquivos_envio on storage.objects;
create policy arquivos_envio on storage.objects
  for insert with check (bucket_id in ('documentos', 'imagens') and public.e_admin());

drop policy if exists arquivos_troca on storage.objects;
create policy arquivos_troca on storage.objects
  for update using (bucket_id in ('documentos', 'imagens') and public.e_admin())
  with check (bucket_id in ('documentos', 'imagens') and public.e_admin());

drop policy if exists arquivos_remocao on storage.objects;
create policy arquivos_remocao on storage.objects
  for delete using (bucket_id in ('documentos', 'imagens') and public.e_admin());

-- ---------------------------------------------------------------------------
-- Categorias iniciais — o cliente renomeia, recolore e acrescenta as dele
-- ---------------------------------------------------------------------------
insert into public.documento_categorias (id, rotulo, cor, ordem) values
  ('painel',        '{"pt":"Painel","en":"Dashboard","es":"Panel"}',                                                      'verde', 1),
  ('accountability','{"pt":"Prestação de contas","en":"Accountability","es":"Rendición de cuentas"}',                     'azul',  2),
  ('reports',       '{"pt":"Relatórios","en":"Reports","es":"Informes"}',                                                 'ambar', 3),
  ('institutional', '{"pt":"Documentos institucionais","en":"Institutional documents","es":"Documentos institucionales"}','roxo',  4),
  ('projects',      '{"pt":"Documentos de projetos","en":"Project documents","es":"Documentos de proyectos"}',            'cinza', 5)
on conflict (id) do nothing;
