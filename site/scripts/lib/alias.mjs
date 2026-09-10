/**
 * O ATALHO `@/` PARA OS SCRIPTS DE TERMINAL
 * =========================================
 * O Node 24 lê TypeScript sozinho — apaga os tipos e executa. O que ele
 * não sabe é o atalho `@/…` que o `tsconfig.json` do site declara para
 * `src/…`, nem o que fazer com `server-only`, que é um pacote do Next e
 * existe só para explodir quando um módulo de servidor é importado por
 * engano no navegador.
 *
 * Este gancho resolve os dois. Com ele, um script `.mjs` importa o
 * conteúdo do site direto da fonte:
 *
 *     import { register } from 'node:module'
 *     register('./lib/alias.mjs', import.meta.url)
 *     const { projetosDoBriefing } = await import('../src/content/projects.ts')
 *
 * Por que isso importa: sem ele, todo script que precisasse dos projetos,
 * das notícias ou dos documentos teria de repetir esses dados em JSON ao
 * lado — e a segunda cópia desatualiza no primeiro dia. Assim há uma
 * fonte só, e ela é a que o site publica.
 */
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const src = path.join(raiz, 'src')

/** Um módulo vazio no lugar de `server-only`: fora do Next ele não faz sentido. */
const VAZIO = 'data:text/javascript,export{}'

export async function resolve(especificador, contexto, proximo) {
  if (especificador === 'server-only') {
    return { url: VAZIO, shortCircuit: true }
  }

  if (especificador.startsWith('@/')) {
    const semAtalho = path.join(src, especificador.slice(2))
    /* O atalho é escrito sem extensão no código do site; aqui ela precisa
       ser dita. Um arquivo `.ts` primeiro, uma pasta com `index.ts`
       depois — a mesma ordem do resolvedor do TypeScript. */
    for (const tentativa of [
      `${semAtalho}.ts`,
      `${semAtalho}.tsx`,
      path.join(semAtalho, 'index.ts'),
    ]) {
      try {
        return await proximo(pathToFileURL(tentativa).href, contexto)
      } catch {
        /* Próxima tentativa. */
      }
    }
  }

  /* Import relativo sem extensão, como o TypeScript permite. */
  if (especificador.startsWith('.') && !path.extname(especificador)) {
    try {
      return await proximo(`${especificador}.ts`, contexto)
    } catch {
      /* Segue para o caminho normal. */
    }
  }

  return proximo(especificador, contexto)
}
