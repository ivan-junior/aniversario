import { useCallback, useEffect, useRef, useState } from 'react'
import { AdminControls } from '../components/festa/AdminControls'
import { AdminGate } from '../components/festa/AdminGate'
import { FestaLayout } from '../components/festa/FestaLayout'
import { RankingList } from '../components/festa/RankingList'
import { LoadingButton } from '../components/festa/LoadingButton'
import {
  adminLogout,
  getRanking,
  setRegistrationStatus,
  setVotingStatus,
} from '../services/festaApi'
import type { PartyStatus, RankingResult } from '../types/festa'

const RANKING_POLL_MS = 10_000

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [status, setStatus] = useState<PartyStatus>({
    registrationOpen: false,
    votingOpen: false,
    votingEnded: false,
  })
  const [ranking, setRanking] = useState<RankingResult | null>(null)
  const [busy, setBusy] = useState<'registration' | 'voting' | null>(null)
  const [rankingLoading, setRankingLoading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [error, setError] = useState('')
  const inFlight = useRef(false)
  const hasRanking = useRef(false)

  const refreshRanking = useCallback(async (silent = false) => {
    if (inFlight.current) return
    if (silent && typeof document !== 'undefined' && document.hidden) return

    inFlight.current = true
    if (!silent) {
      setRankingLoading(true)
      setError('')
    }

    try {
      const data = await getRanking()
      setRanking(data)
      setStatus(data.status)
      hasRanking.current = true
      setError('')
    } catch (err) {
      if (!silent || !hasRanking.current) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível atualizar o ranking.',
        )
      }
    } finally {
      inFlight.current = false
      if (!silent) setRankingLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshRanking(false)

    const timer = window.setInterval(() => {
      void refreshRanking(true)
    }, RANKING_POLL_MS)

    const onVisibility = () => {
      if (!document.hidden) void refreshRanking(true)
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [refreshRanking])

  const handleToggleRegistration = async () => {
    setBusy('registration')
    setError('')
    try {
      const next = await setRegistrationStatus(!status.registrationOpen)
      setStatus(next)
      void refreshRanking(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao alterar o cadastro.',
      )
    } finally {
      setBusy(null)
    }
  }

  const handleToggleVoting = async () => {
    setBusy('voting')
    setError('')
    try {
      const next = await setVotingStatus(!status.votingOpen)
      setStatus(next)
      void refreshRanking(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao alterar a votação.',
      )
    } finally {
      setBusy(null)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await adminLogout()
      onLogout()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">
          Painel da festa
        </h1>
        <p className="mt-2 text-sm text-mist">
          Controle cadastro, votação e acompanhe o ranking.
        </p>
        <p className="mt-1 text-xs text-mist/50">
          Ranking atualiza a cada 10s (somente com a aba aberta).
        </p>
        <div className="mt-4 flex justify-center">
          <LoadingButton
            type="button"
            variant="danger"
            loading={loggingOut}
            loadingText="Saindo..."
            onClick={() => void handleLogout()}
            className="!w-auto min-w-[8rem] px-6"
          >
            Sair
          </LoadingButton>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <AdminControls
        status={status}
        busy={busy}
        onToggleRegistration={() => void handleToggleRegistration()}
        onToggleVoting={() => void handleToggleVoting()}
      />

      <RankingList
        data={ranking}
        loading={rankingLoading}
        onRefresh={() => void refreshRanking(false)}
      />
    </div>
  )
}

export function AdminPage() {
  const [gateKey, setGateKey] = useState(0)

  return (
    <FestaLayout>
      <AdminGate key={gateKey}>
        <AdminPanel onLogout={() => setGateKey((k) => k + 1)} />
      </AdminGate>
    </FestaLayout>
  )
}
