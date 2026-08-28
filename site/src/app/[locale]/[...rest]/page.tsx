import { notFound } from 'next/navigation'

/**
 * Qualquer endereço não mapeado dentro de um idioma cai aqui e é
 * entregue à página 404 traduzida — nunca a um erro genérico.
 */
export default function CatchAllPage() {
  notFound()
}
