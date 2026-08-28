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

export function formatMonthYear(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso))
}
