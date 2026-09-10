/**
 * LEVA OS PROJETOS DO CÓDIGO PARA O PAINEL
 * ========================================
 *   npm run projetos:publicar
 *
 * Faz pelo terminal o que o botão "Importar conteúdo do site" faz dentro
 * de `/admin/projetos`: copia os três projetos de `src/content/projects.ts`
 * para a tabela `projetos` do Supabase, atualizando pelo `slug` em vez de
 * duplicar.
 *
 * POR QUE EXISTE
 * --------------
 * A partir do momento em que a tabela tem linhas, é ela que manda: o site
 * lê do banco e a lista do código vira só reserva (ver `getProjects()` em
 * `content/projects.ts`). Editar o arquivo e recarregar a página não muda
 * nada — foi assim que as dezenove cidades do Coração Valente ficaram
 * fora do mapa da Página inicial mesmo já estando escritas no código.
 *
 * Este script fecha esse buraco sem depender do navegador nem de sessão
 * de administrador: conecta direto no Postgres, com as mesmas credenciais
 * de `npm run db:migrate`.
 *
 * ATENÇÃO: **sobrescreve** o que estiver no painel para os mesmos slugs.
 * Se o cliente já editou um projeto por lá, o texto dele volta ao que
 * está no código. Rode com isso em mente.
 */
import { register } from 'node:module'
import { conectar } from './lib/conexao.mjs'

register('./lib/alias.mjs', import.meta.url)

const { projetosDoBriefing } = await import('../src/content/projects.ts')

const cliente = await conectar()

console.log(`\n${projetosDoBriefing.length} projetos a publicar\n`)

for (const [indice, projeto] of projetosDoBriefing.entries()) {
  const { rows } = await cliente.query(
    `insert into public.projetos
       (slug, nome, categoria, resumo, descricao, objetivo, publico,
        locais, metricas, metodologia, resultados, galeria, parceiros,
        ordem, publicado)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,true)
     on conflict (slug) do update set
       nome        = excluded.nome,
       categoria   = excluded.categoria,
       resumo      = excluded.resumo,
       descricao   = excluded.descricao,
       objetivo    = excluded.objetivo,
       publico     = excluded.publico,
       locais      = excluded.locais,
       metricas    = excluded.metricas,
       metodologia = excluded.metodologia,
       resultados  = excluded.resultados,
       galeria     = excluded.galeria,
       parceiros   = excluded.parceiros,
       ordem       = excluded.ordem,
       publicado   = true
     returning slug, jsonb_array_length(locais) as locais`,
    [
      projeto.slug,
      projeto.name,
      JSON.stringify(projeto.category),
      JSON.stringify(projeto.summary),
      JSON.stringify(projeto.description),
      projeto.objective ? JSON.stringify(projeto.objective) : null,
      JSON.stringify(projeto.audience),
      JSON.stringify(projeto.locations),
      JSON.stringify(projeto.metrics),
      projeto.methodology ? JSON.stringify(projeto.methodology) : null,
      projeto.results ? JSON.stringify(projeto.results) : null,
      JSON.stringify(projeto.gallery),
      projeto.partnerIds,
      indice,
    ],
  )

  const linha = rows[0]
  console.log(`  ✓ ${linha.slug}  —  ${linha.locais} locais`)
}

await cliente.end()
console.log('\nPronto. O site já lê os projetos atualizados.\n')
