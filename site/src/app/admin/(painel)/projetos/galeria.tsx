'use client'

import { ImagePlus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import type { ImagemEnviada } from '@/lib/admin/esquemas'
import { enviarImagem } from '@/lib/admin/storage'
import { Aviso, Botao, Campo } from '../../componentes/ui'

export type FotoDaGaleria = ImagemEnviada & { alt: { pt: string; en: string; es: string } }

/**
 * GALERIA DO PROJETO
 * ==================
 * Várias fotos de uma vez: o cliente seleciona quantas quiser e o painel
 * envia todas em sequência, mostrando quais já subiram.
 *
 * A descrição de cada foto fica opcional — sem ela, o site usa o nome do
 * projeto como texto alternativo, que é melhor do que alt vazio.
 */
export function Galeria({
  fotos,
  onChange,
}: {
  fotos: FotoDaGaleria[]
  onChange: (fotos: FotoDaGaleria[]) => void
}) {
  const entrada = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState<string | null>(null)
  const [problema, setProblema] = useState<string | null>(null)

  async function receber(arquivos: FileList) {
    setProblema(null)
    const novas: FotoDaGaleria[] = []

    try {
      let contador = 0
      for (const arquivo of Array.from(arquivos)) {
        contador += 1
        setEnviando(`Enviando ${contador} de ${arquivos.length}…`)

        const enviada = await enviarImagem(arquivo, 'galeria')
        novas.push({
          url: enviada.url,
          path: enviada.path,
          largura: enviada.largura,
          altura: enviada.altura,
          alt: { pt: '', en: '', es: '' },
        })
      }

      onChange([...fotos, ...novas])
    } catch (falha) {
      console.error(falha)
      setProblema(
        novas.length > 0
          ? 'Algumas fotos não subiram. As que subiram já estão na lista.'
          : 'Não foi possível enviar as fotos.',
      )
      if (novas.length > 0) onChange([...fotos, ...novas])
    } finally {
      setEnviando(null)
    }
  }

  return (
    <Campo
      rotulo="Galeria de fotos"
      opcional
      dica="Sem fotos, a seção de galeria simplesmente não aparece na página do projeto."
    >
      <div className="flex flex-col gap-4">
        {fotos.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {fotos.map((foto, indice) => (
              <li key={foto.url} className="group/foto relative">
                <span className="relative block aspect-[4/3] overflow-hidden border border-(--border) bg-paper-3">
                  <Image
                    src={foto.url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, 200px"
                    className="object-cover"
                  />
                </span>

                <button
                  type="button"
                  onClick={() => onChange(fotos.filter((_, i) => i !== indice))}
                  aria-label={`Remover foto ${indice + 1}`}
                  className="absolute right-1.5 top-1.5 flex size-8 items-center justify-center bg-(--bg)/90 text-(--fg-muted) transition-colors hover:text-danger"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <Botao
          type="button"
          variante="contorno"
          className="self-start"
          carregando={enviando !== null}
          onClick={() => entrada.current?.click()}
        >
          <ImagePlus aria-hidden="true" className="size-4" />
          {fotos.length > 0 ? 'Acrescentar fotos' : 'Enviar fotos'}
        </Botao>

        {enviando ? <Aviso>{enviando}</Aviso> : null}
        {problema ? <Aviso tom="erro">{problema}</Aviso> : null}

        <input
          ref={entrada}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(evento) => {
            const arquivos = evento.target.files
            if (arquivos && arquivos.length > 0) void receber(arquivos)
            evento.target.value = ''
          }}
        />
      </div>
    </Campo>
  )
}
