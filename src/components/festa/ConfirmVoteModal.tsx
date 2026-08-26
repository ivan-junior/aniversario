import { LoadingButton } from './LoadingButton'

type ConfirmVoteModalProps = {
  costumeName: string
  personName: string
  confirming: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmVoteModal({
  costumeName,
  personName,
  confirming,
  onCancel,
  onConfirm,
}: ConfirmVoteModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/80 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-vote-title"
    >
      <div className="glass-card gold-glow w-full max-w-md rounded-2xl px-5 py-6 sm:px-7">
        <h2
          id="confirm-vote-title"
          className="font-display text-center text-xl text-cream"
        >
          Confirmar voto?
        </h2>
        <p className="mt-3 text-center text-sm text-mist">Você está votando em:</p>
        <p className="font-display mt-2 text-center text-lg text-gold-light">
          {costumeName} — {personName}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <LoadingButton
            variant="ghost"
            onClick={onCancel}
            disabled={confirming}
            className="sm:flex-1"
          >
            Cancelar
          </LoadingButton>
          <LoadingButton
            onClick={onConfirm}
            loading={confirming}
            loadingText="Registrando seu voto..."
            className="sm:flex-1"
          >
            Confirmar voto
          </LoadingButton>
        </div>
      </div>
    </div>
  )
}
