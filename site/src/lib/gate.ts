/**
 * PORTÃO DE PRÉ-LANÇAMENTO
 * ========================
 * Enquanto `gateEnabled` for `true`, qualquer rota do site responde com a
 * página "Site em construção" (`app/em-construcao`) e o conteúdo real só
 * aparece depois da senha.
 *
 * PARA PUBLICAR O SITE DE VERDADE: troque `gateEnabled` para `false`.
 * É a única alteração necessária — nenhuma outra parte do site depende
 * deste arquivo. Depois disso, a pasta `app/em-construcao`, a rota
 * `app/api/liberar` e este arquivo podem ser apagados.
 *
 * A senha fica chumbada aqui DE PROPÓSITO: é uma barreira de cortesia
 * para a fase de aprovação, não um mecanismo de segurança. Qualquer
 * pessoa com acesso ao código-fonte a conhece. Não use este portão para
 * proteger dados sensíveis.
 */

/** Chave geral do portão. `false` = site aberto ao público. */
export const gateEnabled: boolean = true

/** Senha de acesso à pré-visualização. */
export const gatePassword = '123'

/** Cookie que marca o navegador como liberado, e seu valor esperado. */
export const gateCookie = 'aidep-preview'
export const gateToken = 'liberado'

/** Página de construção e endpoint que valida a senha. */
export const gatePath = '/em-construcao'
export const gateUnlockPath = '/api/liberar'

/**
 * Cabeçalho usado no rewrite para que a página de construção saiba qual
 * endereço o visitante pediu — e possa devolvê-lo a ele após a senha.
 */
export const gateFromHeader = 'x-aidep-destino'

export function gateUnlocked(value: string | undefined) {
  return value === gateToken
}

/**
 * Normaliza o destino pós-liberação para um caminho interno deste site.
 *
 * A resolução contra uma base descartável faz o trabalho: endereço
 * absoluto, protocolo-relativo (`//exemplo.com`) ou com barra invertida
 * deixam de apontar para esta origem e são rejeitados — assim o
 * formulário não pode ser usado como redirecionador aberto.
 */
export function safeDestination(value: string | null | undefined) {
  if (!value) return '/'

  const base = 'http://portao.interno'
  let url: URL

  try {
    url = new URL(value, base)
  } catch {
    return '/'
  }

  if (url.origin !== base) return '/'
  if (url.pathname.startsWith(gatePath)) return '/'

  return `${url.pathname}${url.search}`
}
