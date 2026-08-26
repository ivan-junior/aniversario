import { useEffect, useState } from 'react'
import { ConfirmVoteModal } from '../components/festa/ConfirmVoteModal'
import { CostumeCard } from '../components/festa/CostumeCard'
import { FestaLayout } from '../components/festa/FestaLayout'
import { LoadingButton } from '../components/festa/LoadingButton'
import { getCostumes, vote } from '../services/festaApi'
import type { Costume } from '../types/festa'

type ViewState =
  | 'loading'
  | 'empty'
  | 'closed'
  | 'ended'
  | 'already'
  | 'list'
  | 'done'
  | 'error'

export function VotacaoPage() {
  const [view, setView] = useState<ViewState>('loading')
  const [costumes, setCostumes] = useState<Costume[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const selected = costumes.find((c) => c.id === selectedId) ?? null

  const load = async () => {
    setView('loading')
    setErrorMessage('')

    try {
      const data = await getCostumes()

      if (data.hasVoted) {
        setView('already')
        return
      }

      if (!data.votingOpen) {
        setView(data.votingEnded ? 'ended' : 'closed')
        return
      }

      if (data.costumes.length === 0) {
        setView('empty')
        return
      }

      setCostumes(
        data.costumes.map((c) => ({
          ...c,
          isMine: c.id === data.myCostumeId || c.isMine === true,
        })),
      )
      setView('list')
    } catch {
      setErrorMessage(
        'Ops! Não conseguimos carregar agora.\n\nTente novamente em alguns segundos.',
      )
      setView('error')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleConfirmVote = async () => {
    if (!selectedId || submitting) return

    setSubmitting(true)
    try {
      await vote(selectedId)
      setConfirmOpen(false)
      setView('done')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ops! Não conseguimos registrar agora.\n\nTente novamente em alguns segundos.'

      setConfirmOpen(false)

      if (message.toLowerCase().includes('já votou')) {
        setView('already')
      } else if (
        message.toLowerCase().includes('encerrada') ||
        message.toLowerCase().includes('fechada') ||
        message.toLowerCase().includes('não está aberta')
      ) {
        setView('ended')
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
        <p className="text-center text-mist">Carregando fantasias...</p>
      ) : null}

      {view === 'empty' ? (
        <div className="glass-card rounded-2xl px-5 py-10 text-center">
          <p className="font-display text-2xl text-cream">
            🎭 Nenhuma fantasia cadastrada ainda.
          </p>
          <p className="mt-4 text-mist">Volte daqui a pouco!</p>
        </div>
      ) : null}

      {view === 'closed' ? (
        <div className="glass-card rounded-2xl px-5 py-10 text-center">
          <p className="font-display text-2xl text-cream">
            ⏳ A votação ainda não começou!
          </p>
          <p className="mt-4 text-mist">
            Aguarde o anúncio durante a festa.
          </p>
        </div>
      ) : null}

      {view === 'ended' ? (
        <div className="glass-card rounded-2xl px-5 py-10 text-center">
          <p className="font-display text-2xl text-cream">🔒 Votação encerrada!</p>
          <p className="mt-4 text-mist">Obrigado por participar.</p>
          <p className="mt-2 text-mist">
            O vencedor será anunciado em instantes... 👀
          </p>
        </div>
      ) : null}

      {view === 'already' || view === 'done' ? (
        <div className="glass-card gold-glow rounded-2xl px-5 py-10 text-center">
          <p className="font-display text-2xl text-cream">
            ✅ Seu voto já foi registrado!
          </p>
          <p className="mt-4 text-mist">Obrigado por participar.</p>
          <p className="mt-2 text-mist">
            O resultado será anunciado em breve. 🏆
          </p>
        </div>
      ) : null}

      {view === 'error' ? (
        <div className="glass-card rounded-2xl px-5 py-8 text-center">
          <p className="whitespace-pre-line text-mist">{errorMessage}</p>
          <div className="mt-6">
            <LoadingButton onClick={() => void load()}>
              Tentar novamente
            </LoadingButton>
          </div>
        </div>
      ) : null}

      {view === 'list' ? (
        <>
          <div className="text-center">
            <h1 className="font-display text-2xl text-cream sm:text-3xl">
              🏆 Melhor fantasia da noite
            </h1>
            <p className="mt-3 text-mist">
              Escolha quem merece levar o prêmio de R$ 300:
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {costumes.map((costume) => (
              <CostumeCard
                key={costume.id}
                costume={costume}
                selected={selectedId === costume.id}
                locked={costume.isMine}
                onSelect={setSelectedId}
              />
            ))}
          </div>

          <div className="mt-8">
            <LoadingButton
              disabled={!selectedId}
              onClick={() => setConfirmOpen(true)}
            >
              Confirmar meu voto
            </LoadingButton>
          </div>
        </>
      ) : null}

      {confirmOpen && selected ? (
        <ConfirmVoteModal
          costumeName={selected.costume}
          personName={selected.name}
          confirming={submitting}
          onCancel={() => {
            if (!submitting) setConfirmOpen(false)
          }}
          onConfirm={() => void handleConfirmVote()}
        />
      ) : null}
    </FestaLayout>
  )
}
