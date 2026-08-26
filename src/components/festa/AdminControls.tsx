import type { PartyStatus } from '../../types/festa'
import { LoadingButton } from './LoadingButton'

type AdminControlsProps = {
  status: PartyStatus
  busy: 'registration' | 'voting' | null
  onToggleRegistration: () => void
  onToggleVoting: () => void
}

export function AdminControls({
  status,
  busy,
  onToggleRegistration,
  onToggleVoting,
}: AdminControlsProps) {
  return (
    <div className="space-y-4">
      <section className="glass-card rounded-2xl px-5 py-5">
        <h2 className="font-display text-lg text-cream">🎭 Cadastro de fantasias</h2>
        <p className="mt-2 text-sm text-mist">
          Status:{' '}
          <span
            className={
              status.registrationOpen ? 'text-emerald-400' : 'text-rose-400'
            }
          >
            {status.registrationOpen ? '🟢 ABERTO' : '🔴 ENCERRADO'}
          </span>
        </p>
        <div className="mt-4">
          <LoadingButton
            variant={status.registrationOpen ? 'danger' : 'gold'}
            loading={busy === 'registration'}
            loadingText="Atualizando..."
            onClick={onToggleRegistration}
          >
            {status.registrationOpen ? 'Encerrar cadastro' : 'Abrir cadastro'}
          </LoadingButton>
        </div>
      </section>

      <section className="glass-card rounded-2xl px-5 py-5">
        <h2 className="font-display text-lg text-cream">🏆 Votação</h2>
        <p className="mt-2 text-sm text-mist">
          Status:{' '}
          <span className={status.votingOpen ? 'text-emerald-400' : 'text-rose-400'}>
            {status.votingOpen ? '🟢 ABERTA' : '🔴 FECHADA'}
          </span>
        </p>
        <div className="mt-4">
          <LoadingButton
            variant={status.votingOpen ? 'danger' : 'gold'}
            loading={busy === 'voting'}
            loadingText="Atualizando..."
            onClick={onToggleVoting}
          >
            {status.votingOpen ? 'Encerrar votação' : 'Abrir votação'}
          </LoadingButton>
        </div>
      </section>
    </div>
  )
}
