import Image from 'next/image'
import type { Partner } from '@/content/types'
import type { Locale } from '@/i18n/routing'
import { QUALIDADE_DA_IMAGEM } from '@/lib/image-quality'
import { cn } from '@/lib/utils'

/**
 * ALTURA POR LOGO, NÃO CAIXA IGUAL PARA TODAS
 * ===========================================
 * As logomarcas dos parceiros têm proporções muito diferentes: a Honda é
 * uma tipográfica de 7,9:1, a assinatura do Governo Federal tem 2,1:1.
 *
 * A primeira versão desta caixa travava largura **e** altura e usava
 * `object-contain`. O efeito era o contrário do pretendido: a Honda
 * enchia a caixa e a assinatura do Governo Federal, que é quase quadrada,
 * era limitada pela altura e sobrava vazia nos dois lados — ficava
 * visivelmente menor que as vizinhas, mesmo tendo a mesma caixa.
 *
 * Aqui a caixa deixou de existir. O que se iguala é a **área ótica**: uma
 * logo larga e baixa recebe menos altura, uma logo alta e estreita recebe
 * mais, e as duas terminam ocupando mais ou menos a mesma mancha na
 * faixa. Se a área fosse igualada na conta exata (altura ∝ 1/√proporção),
 * a Honda ficaria com quinze centímetros de largura; o expoente 0,4 e as
 * travas de 0,72 a 1,45 seguram a correção antes disso.
 *
 * A proporção de referência é 3:1 — a mediana das logomarcas que a
 * associação usa hoje. Logo com essa proporção sai na altura base, sem
 * correção nenhuma.
 */
const PROPORCAO_DE_REFERENCIA = 3

function fatorDeAltura(largura: number, altura: number): number {
  const proporcao = largura / altura
  const bruto = (PROPORCAO_DE_REFERENCIA / proporcao) ** 0.4
  return Math.min(1.45, Math.max(0.72, bruto))
}

/**
 * Altura base de cada tamanho, em `rem`. A altura publicada é esta
 * multiplicada pelo fator da logo; a largura sai da proporção do arquivo,
 * com um teto para a tipográfica mais larga não dominar a faixa.
 */
const alturas = {
  sm: { min: 1.9, vw: 3.6, max: 2.7, tetoDeLargura: '11rem' },
  md: { min: 2.2, vw: 4.2, max: 3, tetoDeLargura: '12rem' },
  lg: { min: 2.5, vw: 4.8, max: 3.5, tetoDeLargura: '13rem' },
} as const

export type PartnerLogoSize = keyof typeof alturas

/**
 * Logomarca oficial do parceiro. Devolve `null` quando o arquivo ainda não foi
 * fornecido — quem chama decide o que mostrar no lugar (a faixa mostra o nome
 * numa placa tipográfica; a lista já exibe o nome ao lado e não repete).
 */
export function PartnerLogo({
  partner,
  locale,
  size = 'md',
  align = 'center',
  className,
}: {
  partner: Partner
  locale: Locale
  size?: PartnerLogoSize
  align?: 'left' | 'center'
  className?: string
}) {
  if (!partner.logo) return null

  const { min, vw, max, tetoDeLargura } = alturas[size]
  const fator = fatorDeAltura(partner.logo.width, partner.logo.height)
  const altura = `clamp(${(min * fator).toFixed(2)}rem, ${(vw * fator).toFixed(2)}vw, ${(max * fator).toFixed(2)}rem)`

  return (
    <span
      className={cn(
        'flex shrink-0 items-center',
        align === 'left' ? 'justify-start' : 'justify-center',
        className,
      )}
      style={{ height: altura, maxWidth: tetoDeLargura }}
    >
      <Image
        src={partner.logo.src}
        alt={partner.logo.alt[locale]}
        width={partner.logo.width}
        height={partner.logo.height}
        sizes="(max-width: 768px) 45vw, 200px"
        /* Logomarca é traço e tipografia, não fotografia: é o desenho que
           mais sofre com recompressão — o AVIF põe halo em volta da letra
           antes de embaçar qualquer foto. Em 200 px o arquivo é de poucos
           quilobytes em qualquer qualidade, então aqui não há troca a
           fazer. Ver `lib/image-quality.ts`. */
        quality={QUALIDADE_DA_IMAGEM}
        /* A altura manda; a largura acompanha a proporção do arquivo, até
           o teto. `object-contain` cobre o caso do teto: aí a logo encolhe
           junto em vez de ser cortada. */
        className="h-full w-auto max-w-full object-contain"
      />
    </span>
  )
}
