'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { SENHA_MINIMA } from '@/lib/admin/esquemas'
import { definirNovaSenha } from '../acoes'
import { Aviso, Botao, Campo, Entrada } from '../componentes/ui'

/**
 * NOVA SENHA
 * ==========
 * Dois campos: a senha e a repetição. A conferência do par acontece aqui,
 * antes de chegar ao servidor — errar a digitação é o motivo mais comum de
 * alguém sair desta tela sem conseguir entrar depois.
 */
export function FormularioDeNovaSenha({ email }: { email: string }) {
  const router = useRouter()

  const [senha, setSenha] = useState('')
  const [repetida, setRepetida] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  const curta = senha.length > 0 && senha.length < SENHA_MINIMA
  const diferente = repetida.length > 0 && repetida !== senha

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)

    if (senha !== repetida) {
      setErro('As duas senhas não são iguais.')
      return
    }

    setSalvando(true)
    const resposta = await definirNovaSenha(senha)

    if (!resposta.ok) {
      setErro(resposta.erro)
      setSalvando(false)
      return
    }

    /* `refresh()` antes de navegar: sem ele o layout do painel ainda é o
       renderizado sem sessão, e a primeira tela volta para o login. */
    router.refresh()
    router.replace(resposta.destino)
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <Aviso>
        Você está trocando a senha de <strong>{email}</strong>.
      </Aviso>

      {/* Campo escondido com o e-mail: é o que faz o gerenciador de senhas
          do navegador oferecer a atualização em vez de salvar uma entrada
          nova, sem dono. */}
      <input type="hidden" name="username" autoComplete="username" value={email} readOnly />

      <Campo
        htmlFor="senha"
        rotulo="Senha nova"
        dica={`Pelo menos ${SENHA_MINIMA} caracteres.`}
        erro={curta ? `Faltam caracteres: o mínimo é ${SENHA_MINIMA}.` : undefined}
      >
        <Entrada
          id="senha"
          type="password"
          autoComplete="new-password"
          autoFocus
          required
          minLength={SENHA_MINIMA}
          aria-invalid={curta || undefined}
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
        />
      </Campo>

      <Campo
        htmlFor="repetida"
        rotulo="Repita a senha"
        erro={diferente ? 'As duas senhas não são iguais.' : undefined}
      >
        <Entrada
          id="repetida"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={diferente || undefined}
          value={repetida}
          onChange={(evento) => setRepetida(evento.target.value)}
        />
      </Campo>

      {erro ? <Aviso tom="erro">{erro}</Aviso> : null}

      <Botao
        type="submit"
        carregando={salvando}
        disabled={curta || diferente}
        className="mt-1 w-full"
      >
        Salvar e entrar
      </Botao>
    </form>
  )
}
