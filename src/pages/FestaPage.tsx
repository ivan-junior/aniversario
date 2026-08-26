import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FestaLayout } from '../components/festa/FestaLayout'
import { PartyStatus } from '../components/festa/PartyStatus'
import { getPartyStatus } from '../services/festaApi'
import type { PartyStatus as PartyStatusType } from '../types/festa'

const disabledClass =
  'flex min-h-[4.5rem] w-full cursor-not-allowed flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 text-center opacity-50'

export function FestaPage() {
  const [status, setStatus] = useState<PartyStatusType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    getPartyStatus({ force: true })
      .then((data) => {
        if (!cancelled) setStatus(data)
      })
      .catch(() => {
        if (!cancelled) {
          setStatus({
            registrationOpen: false,
            votingOpen: false,
            votingEnded: false,
          })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const registrationOpen = status?.registrationOpen === true
  const votingOpen = status?.votingOpen === true
  const votingEnded = status?.votingEnded === true

  return (
    <FestaLayout>
      <div className="animate-fade-up text-center">
        <p className="font-display text-sm tracking-[0.2em] text-gold-light uppercase">
          Concurso da noite
        </p>
        <h1 className="font-display mt-3 text-3xl leading-tight text-cream sm:text-4xl">
          Melhor Fantasia
        </h1>
        <p className="mt-3 text-base text-mist">
          Cadastre sua fantasia e vote em quem merece o prêmio de R$ 300.
        </p>
      </div>

      <div className="animate-fade-up delay-1 mt-10 space-y-4">
        {loading ? (
          <>
            <div className={disabledClass} aria-busy="true">
              <span className="text-lg tracking-wide text-mist uppercase">
                🎭 Cadastrar minha fantasia
              </span>
              <span className="mt-1 text-xs text-mist/70">Carregando...</span>
            </div>
            <div className={disabledClass} aria-busy="true">
              <span className="text-lg tracking-wide text-mist uppercase">
                🏆 Votar na melhor fantasia
              </span>
              <span className="mt-1 text-xs text-mist/70">Carregando...</span>
            </div>
          </>
        ) : (
          <>
            {registrationOpen ? (
              <Link
                to="/fantasia"
                className="btn-gold flex min-h-[4.5rem] w-full items-center justify-center rounded-2xl px-5 py-5 text-center text-lg tracking-wide uppercase"
              >
                🎭 Cadastrar minha fantasia
              </Link>
            ) : (
              <div className={disabledClass} aria-disabled="true">
                <span className="text-lg tracking-wide text-mist uppercase">
                  🎭 Cadastrar minha fantasia
                </span>
                <span className="mt-1 text-xs text-mist/80">Cadastro encerrado</span>
              </div>
            )}

            {votingOpen ? (
              <Link
                to="/votar"
                className="flex min-h-[4.5rem] w-full items-center justify-center rounded-2xl border border-gold/40 bg-gold/10 px-5 py-5 text-center text-lg tracking-wide text-gold-light uppercase transition hover:bg-gold/20"
              >
                🏆 Votar na melhor fantasia
              </Link>
            ) : (
              <div className={disabledClass} aria-disabled="true">
                <span className="text-lg tracking-wide text-mist uppercase">
                  🏆 Votar na melhor fantasia
                </span>
                <span className="mt-1 text-xs text-mist/80">
                  {votingEnded ? 'Votação encerrada' : 'Votação ainda não começou'}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <PartyStatus
        className="animate-fade-up delay-2 mt-10"
        loading={loading}
        registrationOpen={registrationOpen}
        votingOpen={votingOpen}
      />
    </FestaLayout>
  )
}
