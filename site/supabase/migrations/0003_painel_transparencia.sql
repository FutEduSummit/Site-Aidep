-- ============================================================================
-- A CAPTURA DO PAINEL DISCRICIONÁRIAS E LEGAIS
-- ============================================================================
-- A página de Transparência abre com a tela do painel público do Governo
-- Federal (Transferegov). Essa tela envelhece: os valores mudam a cada
-- repasse, e quem atualiza é a associação, pelo painel do site — não o
-- desenvolvedor, mexendo no código.
--
-- É UMA LINHA SÓ, E O BANCO GARANTE ISSO
-- --------------------------------------
-- `id int primary key default 1 check (id = 1)` é o jeito de dizer "esta
-- tabela tem no máximo uma linha" em SQL. Sem isso, dois envios seguidos
-- deixariam duas capturas gravadas e o site teria de escolher uma — e
-- "escolher" viraria bug no dia em que a escolhida fosse a antiga. O
-- `upsert` do painel sempre grava com id 1, então enviar de novo troca a
-- captura no lugar de acumular.
--
-- SEM CAPTURA GRAVADA, O SITE NÃO FICA VAZIO
-- ------------------------------------------
-- A tabela nasce vazia. Enquanto estiver assim, o site publica a captura
-- versionada em `public/images/transparencia/` (ver
-- `src/content/painel-transferegov.ts`) — a primeira, entregue junto com o
-- site. A partir do primeiro envio pelo painel, o banco manda.
--
-- COMO APLICAR: Supabase → SQL Editor → cole e rode. Rodar de novo é
-- seguro.
-- ============================================================================

create table if not exists public.painel_transparencia (
  id             int primary key default 1 check (id = 1),
  imagem_url     text not null,
  imagem_path    text,                                 -- caminho no bucket, para poder apagar
  imagem_largura int  not null default 1600,
  imagem_altura  int  not null default 900,
  -- A data impressa no cabeçalho do painel do Governo Federal
  -- ("Atualizado em 09/09/2026"), que é o que a faixa verde anuncia. Não é
  -- a data do envio: a captura pode ser enviada dias depois.
  capturado_em   date not null,
  -- Descrição da tela para quem usa leitor de tela: { pt, en, es }.
  alt            jsonb not null default '{}'::jsonb,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

drop trigger if exists painel_transparencia_atualizacao on public.painel_transparencia;
create trigger painel_transparencia_atualizacao before update on public.painel_transparencia
  for each row execute function public.marcar_atualizacao();

-- ---------------------------------------------------------------------------
-- Acesso
-- ---------------------------------------------------------------------------
-- Leitura para qualquer visitante (é conteúdo público da página de
-- Transparência); escrita só para quem está na tabela `admins`.
alter table public.painel_transparencia enable row level security;

drop policy if exists painel_transparencia_leitura on public.painel_transparencia;
create policy painel_transparencia_leitura on public.painel_transparencia
  for select using (true);

drop policy if exists painel_transparencia_escrita on public.painel_transparencia;
create policy painel_transparencia_escrita on public.painel_transparencia
  for all using (public.e_admin()) with check (public.e_admin());
