import { defaultLocale, locales, type Locale } from '@/i18n/routing'
import type { Localized } from '@/content/types'

/**
 * TEXTO NOS TRÊS IDIOMAS, SEM BURACO
 * ==================================
 * O cliente escreve em português e o painel traduz para inglês e espanhol
 * (ver `lib/traduzir.ts`). Se uma tradução falhar, for apagada ou o texto
 * for antigo, o campo chega aqui incompleto — e o site não pode exibir
 * vazio por isso. Estas funções completam o que faltar com o português.
 */

function primeiroPreenchido(bruto: Record<string, unknown>): string {
  for (const idioma of [defaultLocale, ...locales]) {
    const valor = bruto[idioma]
    if (typeof valor === 'string' && valor.trim()) return valor
  }
  return ''
}

/** Objeto `{pt,en,es}` de texto — o que vier vazio herda o português. */
export function texto(bruto: unknown): Localized {
  const fonte = (bruto ?? {}) as Record<string, unknown>
  const base = primeiroPreenchido(fonte)

  return Object.fromEntries(
    locales.map((idioma) => {
      const valor = fonte[idioma]
      return [idioma, typeof valor === 'string' && valor.trim() ? valor : base]
    }),
  ) as Localized
}

/** Igual a `texto`, mas devolve `null` quando não há nada escrito. */
export function textoOpcional(bruto: unknown): Localized | null {
  const fonte = (bruto ?? {}) as Record<string, unknown>
  return primeiroPreenchido(fonte) ? texto(fonte) : null
}

/** Objeto `{pt,en,es}` de listas — parágrafos, itens de público-alvo… */
export function lista(bruto: unknown): Localized<string[]> {
  const fonte = (bruto ?? {}) as Record<string, unknown>

  const base =
    [defaultLocale, ...locales]
      .map((idioma) => fonte[idioma])
      .find((valor): valor is string[] => Array.isArray(valor) && valor.length > 0) ?? []

  return Object.fromEntries(
    locales.map((idioma) => {
      const valor = fonte[idioma]
      return [idioma, Array.isArray(valor) && valor.length > 0 ? valor.map(String) : base]
    }),
  ) as Localized<string[]>
}

/** Igual a `lista`, mas devolve `null` quando todas estão vazias. */
export function listaOpcional(bruto: unknown): Localized<string[]> | null {
  const resultado = lista(bruto)
  return resultado[defaultLocale].length > 0 ? resultado : null
}

/**
 * Estrutura por idioma que não é texto simples nem lista de texto — os
 * blocos do corpo da notícia e os passos da metodologia. Mesmo princípio:
 * idioma vazio herda o português.
 */
export function estrutura<T>(bruto: unknown): Localized<T[]> {
  const fonte = (bruto ?? {}) as Record<string, unknown>

  const base =
    [defaultLocale, ...locales]
      .map((idioma) => fonte[idioma])
      .find((valor): valor is T[] => Array.isArray(valor) && valor.length > 0) ?? []

  return Object.fromEntries(
    locales.map((idioma) => {
      const valor = fonte[idioma]
      return [idioma, Array.isArray(valor) && valor.length > 0 ? (valor as T[]) : base]
    }),
  ) as Localized<T[]>
}

export function estruturaOpcional<T>(bruto: unknown): Localized<T[]> | null {
  const resultado = estrutura<T>(bruto)
  return resultado[defaultLocale].length > 0 ? resultado : null
}

/** Monta o objeto dos três idiomas a partir de um texto só. */
export function mesmoTexto(valor: string): Localized {
  return Object.fromEntries(locales.map((idioma) => [idioma, valor])) as Localized
}

export function vazio(valor: Localized | null | undefined): boolean {
  if (!valor) return true
  return !locales.some((idioma) => valor[idioma]?.trim())
}

export type { Locale }
