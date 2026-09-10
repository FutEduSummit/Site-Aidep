import { TituloDaPagina } from '../../../componentes/ui'
import { FormularioDeProjeto } from '../formulario'

export default function NovoProjetoPage() {
  return (
    <>
      <TituloDaPagina
        titulo="Cadastrar projeto"
        descricao="Preencha em português. Inglês e espanhol são opcionais. Sem eles, o site exibe o texto em português nos três idiomas."
      />

      <FormularioDeProjeto />
    </>
  )
}
