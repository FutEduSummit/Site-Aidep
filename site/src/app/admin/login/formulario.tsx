'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { entrar } from '../acoes'
import { Aviso, Botao, Campo, Entrada } from '../componentes/ui'

export function FormularioDeEntrada() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)

    const resposta = await entrar(email, senha)

    if (!resposta.ok) {
      setErro(resposta.erro)
      setEnviando(false)
      return
    }

    /* `refresh()` antes de navegar: sem ele o layout do painel ainda é o
       renderizado sem sessão, e a primeira tela volta para o login. */
    router.refresh()
    router.replace('/admin')
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <Campo htmlFor="email" rotulo="E-mail">
        <Entrada
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
        />
      </Campo>

      <Campo htmlFor="senha" rotulo="Senha">
        <Entrada
          id="senha"
          type="password"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
        />
      </Campo>

      {erro ? <Aviso tom="erro">{erro}</Aviso> : null}

      <Botao type="submit" carregando={enviando} className="mt-1 w-full">
        Entrar
      </Botao>
    </form>
  )
}
