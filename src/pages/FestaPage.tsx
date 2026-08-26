import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FestaLayout } from '../components/festa/FestaLayout'
import { PartyStatus } from '../components/festa/PartyStatus'
import { getPartyStatus } from '../services/festaApi'
import type { PartyStatus as PartyStatusType } from '../types/festa'

export function FestaPage() {
  const [status, setStatus] = useState<PartyStatusType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    getPartyStatus()
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
        <Link
          to="/fantasia"
          className="btn-gold flex min-h-[4.5rem] w-full items-center justify-center rounded-2xl px-5 py-5 text-center text-lg tracking-wide uppercase"
        >
          🎭 Cadastrar minha fantasia
        </Link>

        <Link
          to="/votar"
          className="flex min-h-[4.5rem] w-full items-center justify-center rounded-2xl border border-gold/40 bg-gold/10 px-5 py-5 text-center text-lg tracking-wide text-gold-light uppercase transition hover:bg-gold/20"
        >
          🏆 Votar na melhor fantasia
        </Link>
      </div>

      <PartyStatus
        className="animate-fade-up delay-2 mt-10"
        loading={loading}
        registrationOpen={status?.registrationOpen ?? false}
        votingOpen={status?.votingOpen ?? false}
      />
    </FestaLayout>
  )
}
