import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formata um número inteiro no padrão do idioma (ex.: 1.800 / 1,800). */
export function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value)
}

/** Data longa e localizada, estável entre servidor e cliente (UTC). */
export function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso))
}

/**
 * Data curta e localizada — 01/09/2026, 09/01/2026, 01.09.2026, conforme
 * o idioma. Serve à coluna "Data" da tabela de Transparência no celular,
 * onde a data por extenso é a diferença entre a tabela caber na tela e
 * não caber: "01 de setembro de 2026" ocupa três linhas onde a versão
 * numérica ocupa uma.
 */
export function formatDateShort(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(iso))
}

export function formatMonthYear(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso))
}
