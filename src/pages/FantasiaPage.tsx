import { useEffect, useState, type FormEvent } from 'react'
import { FestaLayout } from '../components/festa/FestaLayout'
import { LoadingButton } from '../components/festa/LoadingButton'
import { getCostumes, registerCostume } from '../services/festaApi'
import type { Costume } from '../types/festa'

type ViewState =
  | 'loading'
  | 'closed'
  | 'form'
  | 'success'
  | 'already'
  | 'error'

const MAX_NAME = 60
const MAX_COSTUME = 80

export function FantasiaPage() {
  const [view, setView] = useState<ViewState>('loading')
  const [name, setName] = useState('')
  const [costume, setCostume] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    costume?: string
  }>({})
  const [registered, setRegistered] = useState<Costume | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    getCostumes()
      .then((data) => {
        if (cancelled) return

        if (data.myCostumeId) {
          const mine = data.costumes.find((c) => c.id === data.myCostumeId)
          if (mine) {
            setRegistered(mine)
            setView('already')
            return
          }
        }

        if (!data.registrationOpen) {
          setView('closed')
          return
        }

        setView('form')
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage(
            'Ops! Não conseguimos carregar agora.\n\nTente novamente em alguns segundos.',
          )
          setView('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const validate = (): boolean => {
    const next: { name?: string; costume?: string } = {}
    const trimmedName = name.trim()
    const trimmedCostume = costume.trim()

    if (!trimmedName) next.name = 'Informe seu nome.'
    else if (trimmedName.length > MAX_NAME)
      next.name = `Nome com no máximo ${MAX_NAME} caracteres.`

    if (!trimmedCostume) next.costume = 'Informe sua fantasia.'
    else if (trimmedCostume.length > MAX_COSTUME)
      next.costume = `Fantasia com no máximo ${MAX_COSTUME} caracteres.`

    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate() || submitting) return

    setSubmitting(true)
    setErrorMessage('')

    try {
      const result = await registerCostume(name.trim(), costume.trim())
      setRegistered(result.costume)
      setView(result.alreadyRegistered ? 'already' : 'success')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ops! Não conseguimos registrar agora.\n\nTente novamente em alguns segundos.'

      if (
        message.toLowerCase().includes('encerrado') ||
        message.toLowerCase().includes('fechado')
      ) {
        setView('closed')
      } else {
        setErrorMessage(message)
        setView('error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FestaLayout showBackToHub>
      {view === 'loading' ? (
        <p className="text-center text-mist">Carregando...</p>
      ) : null}

      {view === 'closed' ? (
        <div className="glass-card gold-glow rounded-2xl px-5 py-10 text-center">
          <p className="font-display text-2xl text-cream">🔒 Cadastro encerrado</p>
          <p className="mt-4 text-mist">
            O período para cadastrar fantasias já terminou.
          </p>
        </div>
      ) : null}

      {view === 'already' && registered ? (
        <div className="glass-card gold-glow rounded-2xl px-5 py-10 text-center">
          <p className="font-display text-2xl text-cream">
            🎭 Você já está participando!
          </p>
          <p className="font-display mt-6 text-3xl text-gold-light">
            {registered.costume}
          </p>
          <p className="mt-2 text-lg text-mist">{registered.name}</p>
        </div>
      ) : null}

      {view === 'success' && registered ? (
        <div className="glass-card gold-glow rounded-2xl px-5 py-10 text-center">
          <p className="font-display text-2xl text-cream">✅ Fantasia cadastrada!</p>
          <p className="font-display mt-6 text-3xl text-gold-light">
            {registered.costume}
          </p>
          <p className="mt-2 text-lg text-mist">{registered.name}</p>
          <p className="mt-6 text-mist">Boa sorte no concurso! 🎭</p>
        </div>
      ) : null}

      {view === 'error' ? (
        <div className="glass-card rounded-2xl px-5 py-8 text-center">
          <p className="whitespace-pre-line text-mist">{errorMessage}</p>
          <div className="mt-6">
            <LoadingButton
              onClick={() => {
                setView('form')
                setErrorMessage('')
              }}
            >
              Tentar novamente
            </LoadingButton>
          </div>
        </div>
      ) : null}

      {view === 'form' ? (
        <div className="glass-card gold-glow rounded-2xl px-5 py-8 sm:px-7">
          <h1 className="font-display text-center text-2xl text-cream">
            🎭 Cadastrar fantasia
          </h1>
          <p className="mt-2 text-center text-sm text-mist">
            Um cadastro por aparelho. Escolha bem!
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm text-mist">Seu nome</span>
              <input
                type="text"
                value={name}
                maxLength={MAX_NAME}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="w-full rounded-xl border border-white/15 bg-ink/60 px-4 py-3 text-cream outline-none focus:border-gold/50"
              />
              {fieldErrors.name ? (
                <span className="mt-1 block text-sm text-rose-300">
                  {fieldErrors.name}
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-mist">Sua fantasia</span>
              <input
                type="text"
                value={costume}
                maxLength={MAX_COSTUME}
                onChange={(e) => setCostume(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-ink/60 px-4 py-3 text-cream outline-none focus:border-gold/50"
              />
              {fieldErrors.costume ? (
                <span className="mt-1 block text-sm text-rose-300">
                  {fieldErrors.costume}
                </span>
              ) : null}
            </label>

            <LoadingButton
              type="submit"
              loading={submitting}
              loadingText="Cadastrando sua fantasia..."
            >
              Cadastrar fantasia
            </LoadingButton>
          </form>
        </div>
      ) : null}
    </FestaLayout>
  )
}
