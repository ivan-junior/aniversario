import { useState } from 'react'
import type { FormEvent } from 'react'
import { AttendanceSelector } from './AttendanceSelector'
import { PeopleCounter } from './PeopleCounter'
import { submitRsvp } from '../services/rsvp.service'
import type { FormStatus } from '../types/rsvp'

type FormErrors = {
  nome?: string
  presenca?: string
}

export function RSVPForm() {
  const [nome, setNome] = useState('')
  const [presenca, setPresenca] = useState<boolean | null>(null)
  const [quantidadePessoas, setQuantidadePessoas] = useState(1)
  const [observacoes, setObservacoes] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errors, setErrors] = useState<FormErrors>({})
  const [confirmedAttendance, setConfirmedAttendance] = useState<boolean | null>(
    null,
  )

  const validate = (): boolean => {
    const next: FormErrors = {}

    if (!nome.trim()) {
      next.nome = 'Informe seu nome.'
    }

    if (presenca === null) {
      next.presenca = 'Selecione se você vai ou não.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validate() || presenca === null) return

    setStatus('submitting')

    const payload = {
      nome: nome.trim(),
      presenca,
      quantidadePessoas: presenca ? quantidadePessoas : 0,
      observacoes: observacoes.trim(),
      enviadoEm: new Date().toISOString(),
    }

    try {
      await submitRsvp(payload)
      setConfirmedAttendance(presenca)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success' && confirmedAttendance !== null) {
    return (
      <div
        className="animate-fade-up glass-card gold-glow mx-auto w-full max-w-xl rounded-2xl px-6 py-12 text-center sm:px-10"
        role="status"
      >
        {confirmedAttendance ? (
          <>
            <p className="font-display text-2xl text-gold-light sm:text-3xl">
              Presença confirmada! 🎭
            </p>
            <p className="mt-4 text-base text-mist sm:text-lg">
              Agora só falta escolher a fantasia.
            </p>
            <p className="font-display mt-6 text-sm tracking-wide text-cream/80">
              Nos vemos dia 29 de agosto!
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-2xl text-gold-light sm:text-3xl">
              Resposta registrada ❤️
            </p>
            <p className="mt-4 text-base text-mist sm:text-lg">
              Que pena que você não poderá estar com a gente.
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="glass-card mx-auto w-full max-w-xl rounded-2xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="mb-8 text-center">
        <h2 className="font-display text-3xl tracking-wide text-cream uppercase sm:text-4xl">
          Você vem?
        </h2>
        <p className="mt-3 text-sm text-mist sm:text-base">
          Confirme sua presença para conseguirmos preparar tudo para a noite.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="space-y-2">
          <label htmlFor="nome" className="block text-sm font-medium text-cream/90">
            Seu nome <span className="text-gold">*</span>
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            autoComplete="name"
            required
            value={nome}
            onChange={(e) => {
              setNome(e.target.value)
              if (errors.nome) setErrors((prev) => ({ ...prev, nome: undefined }))
            }}
            placeholder="Como podemos te identificar?"
            aria-invalid={Boolean(errors.nome)}
            aria-describedby={errors.nome ? 'nome-error' : undefined}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream placeholder:text-mist/50 transition-colors focus:border-gold/50 focus:bg-white/8 focus:outline-none"
          />
          {errors.nome && (
            <p id="nome-error" className="text-sm text-red-300" role="alert">
              {errors.nome}
            </p>
          )}
        </div>

        <AttendanceSelector
          value={presenca}
          onChange={(value) => {
            setPresenca(value)
            if (errors.presenca) {
              setErrors((prev) => ({ ...prev, presenca: undefined }))
            }
            if (!value) setQuantidadePessoas(1)
          }}
          error={errors.presenca}
        />

        {presenca === true && (
          <div className="animate-fade-up">
            <PeopleCounter
              value={quantidadePessoas}
              onChange={setQuantidadePessoas}
            />
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="observacoes"
            className="block text-sm font-medium text-cream/90"
          >
            Quer deixar alguma observação?
          </label>
          <textarea
            id="observacoes"
            name="observacoes"
            rows={3}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Escreva alguma coisa aqui..."
            className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream placeholder:text-mist/50 transition-colors focus:border-gold/50 focus:bg-white/8 focus:outline-none"
          />
        </div>

        <p className="rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3 text-center text-sm text-mist">
          🍻 Traga apenas o que for beber!
        </p>

        {status === 'error' && (
          <div
            className="rounded-xl border border-red-400/30 bg-red-950/40 px-4 py-4 text-center"
            role="alert"
          >
            <p className="font-medium text-red-200">
              Não conseguimos registrar sua confirmação.
            </p>
            <p className="mt-1 text-sm text-red-200/80">
              Tente novamente em alguns instantes.
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-3 text-sm text-gold-light underline-offset-4 hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="btn-gold font-display w-full rounded-xl px-6 py-3.5 text-sm tracking-wider uppercase sm:text-base"
        >
          {status === 'submitting' ? 'Confirmando...' : 'Confirmar presença'}
        </button>
      </form>
    </div>
  )
}
