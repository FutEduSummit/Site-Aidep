'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Media query reativa e segura para SSR.
 * Usa `useSyncExternalStore`: nenhum estado é atualizado dentro de efeitos
 * e o valor no servidor é sempre `false` — nada de movimento antes da
 * hidratação.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

/**
 * `true` apenas em dispositivos com ponteiro preciso (mouse/trackpad).
 * Todos os efeitos de mouse — magnético, spotlight, tilt, cursor — dependem
 * disto, garantindo que nada no site dependa de hover em telas de toque.
 */
export function usePointerFine() {
  return useMediaQuery('(hover: hover) and (pointer: fine)')
}

/** `true` quando o sistema pede menos movimento. */
export function useReducedMotionSafe() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/** `true` a partir do breakpoint informado (padrão: lg / 1024px). */
export function useIsDesktop(minWidth = 1024) {
  return useMediaQuery(`(min-width: ${minWidth}px)`)
}
