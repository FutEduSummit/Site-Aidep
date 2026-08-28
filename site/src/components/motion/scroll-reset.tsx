'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from '@/i18n/navigation'

/**
 * TODA PÁGINA ABRE NO COMEÇO.
 *
 * Ao trocar de rota, a página precisa começar na primeira seção. Só o
 * comportamento padrão do App Router não garante isso aqui: o site tem
 * animações de entrada, `useScroll` em vários blocos e uma sequência de
 * ScrollTrigger, e qualquer um deles pode mexer na rolagem no mesmo quadro
 * em que a rota muda — o resultado é a página nova aparecendo já na segunda
 * seção. Duas chamadas resolvem: uma imediata e outra depois do primeiro
 * quadro, quando as animações já se instalaram.
 *
 * O que este componente NÃO faz, de propósito:
 *   • não mexe em navegação por âncora (`#secao`), que tem destino próprio;
 *   • não mexe no voltar/avançar do navegador, onde a expectativa é
 *     reencontrar a página no ponto em que ela foi deixada;
 *   • não mexe na primeira carga, que já vem no topo ou na âncora pedida.
 */
export function ScrollReset() {
  const pathname = usePathname()

  const isHistoryNavigation = useRef(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    function onPopState() {
      isHistoryNavigation.current = true
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (isHistoryNavigation.current) {
      isHistoryNavigation.current = false
      return
    }

    if (window.location.hash) return

    /* `instant` vence o `scroll-behavior: smooth` do documento: trocar de
       página não é rolar, e uma rolagem animada de página inteira só
       atrasa a leitura. */
    const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    toTop()
    const frame = requestAnimationFrame(toTop)
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  return null
}
