import { useCallback, useEffect, useRef, useState } from 'react'
import { AdminControls } from '../components/festa/AdminControls'
import { AdminGate } from '../components/festa/AdminGate'
import { ClearPartyDataModal } from '../components/festa/ClearPartyDataModal'
import { DeleteCostumeModal } from '../components/festa/DeleteCostumeModal'
import { FestaLayout } from '../components/festa/FestaLayout'
import { RankingList } from '../components/festa/RankingList'
import { LoadingButton } from '../components/festa/LoadingButton'
import {
  adminLogout,
  clearPartyData,
  deleteCostumeAsAdmin,
  getRanking,
  setRegistrationStatus,
  setVotingStatus,
} from '../services/festaApi'
import type { PartyStatus, RankingEntry, RankingResult } from '../types/festa'

const RANKING_POLL_MS = 10_000
const REMOVE_ERROR =
  'Não foi possível remover os dados.\n\nTente novamente.'

type BusyAction = 'registration' | 'voting' | 'clear' | 'delete' | null

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [status, setStatus] = useState<PartyStatus>({
    registrationOpen: false,
    votingOpen: false,
    votingEnded: false,
  })
  const [ranking, setRanking] = useState<RankingResult | null>(null)
  const [busy, setBusy] = useState<BusyAction>(null)
  const [rankingLoading, setRankingLoading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [clearModalOpen, setClearModalOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<RankingEntry | null>(null)
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
    setSuccess('')
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
    setSuccess('')
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

  const handleClearConfirm = async () => {
    setBusy('clear')
    setError('')
    setSuccess('')
    try {
      await clearPartyData()
      setClearModalOpen(false)
      setSuccess('Fantasias e votos removidos com sucesso.')
      await refreshRanking(false)
    } catch {
      setError(REMOVE_ERROR)
    } finally {
      setBusy(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return

    setBusy('delete')
    setError('')
    setSuccess('')
    try {
      await deleteCostumeAsAdmin(pendingDelete.id)
      setPendingDelete(null)
      setSuccess('Participante removido com sucesso.')
      await refreshRanking(false)
    } catch {
      setError(REMOVE_ERROR)
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

  const maintenanceBusy = busy === 'clear' || busy === 'delete'

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
        <p className="whitespace-pre-line rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {success}
        </p>
      ) : null}

      <AdminControls
        status={status}
        busy={busy === 'registration' || busy === 'voting' ? busy : null}
        onToggleRegistration={() => void handleToggleRegistration()}
        onToggleVoting={() => void handleToggleVoting()}
      />

      <RankingList
        data={ranking}
        loading={rankingLoading}
        onRefresh={() => void refreshRanking(false)}
        onRemoveParticipant={(entry) => {
          setSuccess('')
          setError('')
          setPendingDelete(entry)
        }}
        removeDisabled={maintenanceBusy}
      />

      <section className="glass-card rounded-2xl border border-rose-400/20 px-5 py-5">
        <h2 className="font-display text-lg text-cream">Zona de manutenção</h2>
        <p className="mt-2 text-sm text-mist">
          Limpar todos os dados de teste. As configurações da festa e os
          administradores são preservados.
        </p>
        <div className="mt-4">
          <LoadingButton
            type="button"
            variant="danger"
            disabled={maintenanceBusy}
            onClick={() => {
              setSuccess('')
              setError('')
              setClearModalOpen(true)
            }}
          >
            Limpar fantasias e votos
          </LoadingButton>
        </div>
      </section>

      {clearModalOpen ? (
        <ClearPartyDataModal
          clearing={busy === 'clear'}
          onCancel={() => {
            if (busy === 'clear') return
            setClearModalOpen(false)
          }}
          onConfirm={() => void handleClearConfirm()}
        />
      ) : null}

      {pendingDelete ? (
        <DeleteCostumeModal
          costumeName={pendingDelete.costume}
          personName={pendingDelete.name}
          votes={pendingDelete.votes}
          removing={busy === 'delete'}
          onCancel={() => {
            if (busy === 'delete') return
            setPendingDelete(null)
          }}
          onConfirm={() => void handleDeleteConfirm()}
        />
      ) : null}
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
