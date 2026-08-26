import { useCallback, useEffect, useState } from 'react'
import { AdminControls } from '../components/festa/AdminControls'
import { AdminGate } from '../components/festa/AdminGate'
import { FestaLayout } from '../components/festa/FestaLayout'
import { RankingList } from '../components/festa/RankingList'
import {
  getRanking,
  setRegistrationStatus,
  setVotingStatus,
} from '../services/festaApi'
import type { PartyStatus, RankingResult } from '../types/festa'

function AdminPanel() {
  const [status, setStatus] = useState<PartyStatus>({
    registrationOpen: false,
    votingOpen: false,
    votingEnded: false,
  })
  const [ranking, setRanking] = useState<RankingResult | null>(null)
  const [busy, setBusy] = useState<'registration' | 'voting' | null>(null)
  const [rankingLoading, setRankingLoading] = useState(false)
  const [error, setError] = useState('')

  const refreshRanking = useCallback(async () => {
    setRankingLoading(true)
    setError('')
    try {
      const data = await getRanking()
      setRanking(data)
      setStatus(data.status)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar o ranking.',
      )
    } finally {
      setRankingLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshRanking()
    const timer = window.setInterval(() => {
      void refreshRanking()
    }, 10_000)
    return () => window.clearInterval(timer)
  }, [refreshRanking])

  const handleToggleRegistration = async () => {
    setBusy('registration')
    setError('')
    try {
      const next = await setRegistrationStatus(!status.registrationOpen)
      setStatus(next)
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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao alterar a votação.',
      )
    } finally {
      setBusy(null)
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
        onRefresh={() => void refreshRanking()}
      />
    </div>
  )
}

export function AdminPage() {
  return (
    <FestaLayout>
      <AdminGate>
        <AdminPanel />
      </AdminGate>
    </FestaLayout>
  )
}
