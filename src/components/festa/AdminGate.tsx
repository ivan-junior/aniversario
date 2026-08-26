import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  adminLogin,
  adminLogout,
  getAdminSession,
} from '../../services/festaApi'
import { LoadingButton } from './LoadingButton'

type GateState = 'loading' | 'login' | 'denied' | 'ready'

type AdminGateProps = {
  children: ReactNode
}

export function AdminGate({ children }: AdminGateProps) {
  const [state, setState] = useState<GateState>('loading')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    getAdminSession()
      .then((session) => {
        if (cancelled) return
        if (!session) {
          setState('login')
          return
        }
        if (!session.isAdmin) {
          setState('denied')
          return
        }
        setState('ready')
      })
      .catch(() => {
        if (!cancelled) setState('login')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await adminLogin(email, password)
      setState('ready')
      setPassword('')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível entrar.'
      if (message.toLowerCase().includes('acesso negado')) {
        setState('denied')
      } else {
        setError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeniedLogout = async () => {
    await adminLogout()
    setState('login')
    setError('')
  }

  if (state === 'loading') {
    return (
      <div className="mx-auto w-full max-w-md text-center text-sm text-mist">
        Verificando sessão...
      </div>
    )
  }

  if (state === 'denied') {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="glass-card gold-glow rounded-2xl px-5 py-8 sm:px-8">
          <h1 className="font-display text-center text-2xl text-cream">
            Acesso negado
          </h1>
          <p className="mt-2 text-center text-sm text-mist">
            Esta conta está autenticada, mas não está autorizada como
            administradora.
          </p>
          <div className="mt-8">
            <LoadingButton type="button" onClick={() => void handleDeniedLogout()}>
              Sair
            </LoadingButton>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'ready') {
    return <>{children}</>
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="glass-card gold-glow rounded-2xl px-5 py-8 sm:px-8">
        <h1 className="font-display text-center text-2xl text-cream">
          Área administrativa
        </h1>
        <p className="mt-2 text-center text-sm text-mist">
          Entre com e-mail e senha de administrador.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-mist">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-xl border border-white/15 bg-ink/60 px-4 py-3 text-cream outline-none focus:border-gold/50"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-mist">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-white/15 bg-ink/60 px-4 py-3 text-cream outline-none focus:border-gold/50"
            />
          </label>

          {error ? (
            <p className="text-sm text-rose-300" role="alert">
              {error}
            </p>
          ) : null}

          <LoadingButton type="submit" loading={submitting} loadingText="Entrando...">
            Entrar
          </LoadingButton>
        </form>
      </div>
    </div>
  )
}
