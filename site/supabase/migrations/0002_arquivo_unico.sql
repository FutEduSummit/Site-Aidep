-- ============================================================================
-- UM ARQUIVO, UM DOCUMENTO
-- ============================================================================
-- `arquivo_path` é o caminho do arquivo dentro do bucket. Dois documentos
-- apontando para o mesmo caminho seriam um bug em qualquer cenário: apagar um
-- deles removeria o arquivo do outro do Storage.
--
-- A restrição também é o que permite reexecutar a semeadura de conteúdo
-- (`npm run conteudo:semear`) sem duplicar linha: o `upsert` reconhece o
-- documento pelo caminho do arquivo.
--
-- Índice sem cláusula `where` de propósito. Um índice parcial serviria para
-- garantir a unicidade, mas o `ON CONFLICT` da API não consegue inferi-lo, e
-- o upsert falha com "no unique or exclusion constraint matching". O índice
-- simples resolve os dois lados — e no Postgres ele já permite quantos nulos
-- forem precisos, porque nulos não se comparam entre si. É o caso dos
-- documentos cadastrados à mão no código, que apontam para `/public` e não
-- têm caminho no bucket.
-- ============================================================================

drop index if exists public.documentos_arquivo_path_unico;

create unique index if not exists documentos_arquivo_path_unico
  on public.documentos (arquivo_path);
