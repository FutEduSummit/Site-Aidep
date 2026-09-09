'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { pedirNovaSenha } from '../acoes'
import { classesDeLigacao } from '../componentes/moldura-de-entrada'
import { Aviso, Botao, Campo, Entrada } from '../componentes/ui'

/**
 * PEDIDO DE NOVA SENHA
 * ====================
 * Depois de enviado, o formulário sai da tela e dá lugar à confirmação: o
 * próximo passo está na caixa de e-mail, não aqui. Continuar mostrando o
 * campo só convida a pedir de novo e esbarrar no limite de envio.
 */
export function FormularioDeRecuperacao({
  linkInvalido = false,
}: {
  linkInvalido?: boolean
}) {
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)

    const resposta = await pedirNovaSenha(email)

    setEnviando(false)
    if (!resposta.ok) {
      setErro(resposta.erro)
      return
    }

    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="flex flex-col gap-5">
        <Aviso tom="sucesso">
          Se <strong>{email.trim().toLowerCase()}</strong> tiver acesso ao
          painel, o link para criar a senha nova chega em instantes. Ele vale
          por uma hora e só pode ser usado uma vez.
        </Aviso>

        <p className="text-small leading-relaxed text-(--fg-muted)">
          Abra o link neste mesmo navegador. Não chegou? Confira a caixa de
          spam antes de{' '}
          <button
            type="button"
            onClick={() => setEnviado(false)}
            className={classesDeLigacao}
          >
            pedir outro e-mail
          </button>
          .
        </p>

        <Link
          href="/admin/login"
          className="text-micro font-semibold uppercase tracking-[0.12em] text-(--fg-muted) transition-colors hover:text-(--fg)"
        >
          Voltar para a entrada
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      {/* O aviso do link vencido vive aqui, e não na página, para sair da
          tela no instante em que a pessoa pede um e-mail novo. */}
      {linkInvalido && !erro ? (
        <Aviso tom="erro">
          Este link não vale mais: ou já passou de uma hora, ou já foi usado,
          ou foi aberto em outro navegador. Peça um novo abaixo.
        </Aviso>
      ) : null}

      <Campo
        htmlFor="email"
        rotulo="E-mail"
        dica="O mesmo endereço com que você entra no painel."
      >
        <Entrada
          id="email"
          type="email"
          autoComplete="username"
          autoFocus
          required
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
        />
      </Campo>

      {erro ? <Aviso tom="erro">{erro}</Aviso> : null}

      <Botao type="submit" carregando={enviando} className="mt-1 w-full">
        Enviar link
      </Botao>

      <Link
        href="/admin/login"
        className="self-start text-micro font-semibold uppercase tracking-[0.12em] text-(--fg-muted) transition-colors hover:text-(--fg)"
      >
        Voltar para a entrada
      </Link>
    </form>
  )
}
