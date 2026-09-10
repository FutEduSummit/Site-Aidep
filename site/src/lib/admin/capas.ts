import { galleryOf, getMedia } from '@/content/media'
import type { MediaAsset } from '@/content/types'
import type { LinhaNoticia, LinhaProjeto } from '@/lib/cms/tipos'

/**
 * A FOTO QUE O SITE ESTÁ USANDO
 * =============================
 * O painel lia só `capa_url` — a imagem enviada pelo Storage — e por isso
 * mostrava moldura vazia em notícia e projeto que o site publica com
 * fotografia. Não faltava foto: faltava olhar no mesmo lugar que o site.
 *
 * O site resolve a capa em ordem de prioridade (ver `coverOf` em
 * `content/media.ts`): a imagem enviada pelo painel primeiro; sem ela, a
 * fotografia do acervo registrada para a chave da notícia ou do projeto.
 * As notícias e os projetos que subiram por `npm run conteudo:publicar` e
 * `npm run projetos:publicar` chegam ao banco sem capa própria justamente
 * porque a fotografia deles já está registrada lá.
 *
 * Este módulo repete essa ordem para o painel, e diz de onde veio a foto:
 * `doAcervo` é o que permite ao formulário escrever "esta é a foto do
 * acervo em uso" em vez de fingir que o cliente enviou a imagem.
 *
 * Só de leitura: nada aqui vira valor salvo. Capa do acervo é caminho em
 * /public, e o esquema do painel (`imagemEnviada`) guarda endereço do
 * Storage — gravar uma na outra misturaria as duas fontes.
 */

export type CapaDoPainel = {
  src: string
  largura: number
  altura: number
  /** `false` = enviada pelo painel; `true` = fotografia oficial do acervo. */
  doAcervo: boolean
}

type LinhaComCapa = {
  capa_url: string | null
  capa_largura: number | null
  capa_altura: number | null
}

const LARGURA_PADRAO = 1600
const ALTURA_PADRAO = 900

function doAcervo(foto: MediaAsset | null): CapaDoPainel | null {
  if (!foto) return null
  return {
    src: foto.src,
    largura: foto.width,
    altura: foto.height,
    doAcervo: true,
  }
}

/** A mesma ordem de `coverOf`: enviada pelo painel, senão a do acervo. */
function resolver(linha: LinhaComCapa, chave: string): CapaDoPainel | null {
  if (linha.capa_url) {
    return {
      src: linha.capa_url,
      largura:
        linha.capa_largura && linha.capa_largura > 0
          ? linha.capa_largura
          : LARGURA_PADRAO,
      altura:
        linha.capa_altura && linha.capa_altura > 0
          ? linha.capa_altura
          : ALTURA_PADRAO,
      doAcervo: false,
    }
  }

  return doAcervo(getMedia(chave))
}

/** Capa de uma notícia — a chave é a mesma que `lib/cms/mapear.ts` monta. */
export function capaDaNoticia(
  linha: Pick<LinhaNoticia, 'slug' | 'capa_url' | 'capa_largura' | 'capa_altura'>,
): CapaDoPainel | null {
  return resolver(linha, `noticia.${linha.slug}`)
}

/** Capa de um projeto — idem, a chave de `paraProjeto`. */
export function capaDoProjeto(
  linha: Pick<LinhaProjeto, 'slug' | 'capa_url' | 'capa_largura' | 'capa_altura'>,
): CapaDoPainel | null {
  return resolver(linha, `project.${linha.slug}.cover`)
}

/**
 * O álbum do acervo que a página do projeto exibe enquanto ninguém montou
 * a galeria pelo painel (ver `galleryOf`). Dois dos três projetos do
 * briefing chegam ao banco com a galeria vazia e mostram no site o álbum
 * registrado pelo slug — sem isto, o painel diria "nenhuma foto" ao lado
 * de uma página cheia delas.
 */
export function galeriaDoAcervo(slug: string): MediaAsset[] {
  return galleryOf({ slug, gallery: [] })
}
