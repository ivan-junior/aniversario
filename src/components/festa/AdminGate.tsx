import { useState, type FormEvent, type ReactNode } from 'react'
import { LoadingButton } from './LoadingButton'

const ADMIN_SESSION_KEY = 'festa_admin_ok'

type AdminGateProps = {
  children: ReactNode
}

function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1'
}

export function AdminGate({ children }: AdminGateProps) {
  const [authed, setAuthed] = useState(() => isAdminAuthenticated())
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const expected = import.meta.env.VITE_ADMIN_PASSWORD ?? ''

    if (!expected) {
      setError('Senha administrativa não configurada no ambiente.')
      return
    }

    if (password !== expected) {
      setError('Senha incorreta.')
      return
    }

    sessionStorage.setItem(ADMIN_SESSION_KEY, '1')
    setAuthed(true)
    setError('')
  }

  if (authed) {
    return <>{children}</>
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="glass-card gold-glow rounded-2xl px-5 py-8 sm:px-8">
        <h1 className="font-display text-center text-2xl text-cream">
          Área administrativa
        </h1>
        <p className="mt-2 text-center text-sm text-mist">
          Digite a senha para continuar.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-mist">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/15 bg-ink/60 px-4 py-3 text-cream outline-none focus:border-gold/50"
            />
          </label>

          {error ? (
            <p className="text-sm text-rose-300" role="alert">
              {error}
            </p>
          ) : null}

          <LoadingButton type="submit">Entrar</LoadingButton>
        </form>
      </div>
    </div>
  )
}
