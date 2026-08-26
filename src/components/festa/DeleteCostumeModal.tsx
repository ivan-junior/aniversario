import { LoadingButton } from './LoadingButton'

type DeleteCostumeModalProps = {
  costumeName: string
  personName: string
  votes: number
  removing: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteCostumeModal({
  costumeName,
  personName,
  votes,
  removing,
  onCancel,
  onConfirm,
}: DeleteCostumeModalProps) {
  const votesLabel = votes === 1 ? 'voto' : 'votos'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/80 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-costume-title"
    >
      <div className="glass-card gold-glow w-full max-w-md rounded-2xl px-5 py-6 sm:px-7">
        <h2
          id="delete-costume-title"
          className="font-display text-center text-xl text-cream"
        >
          Remover participante?
        </h2>
        <p className="mt-3 text-center text-sm text-mist">
          Você está prestes a remover:
        </p>
        <p className="font-display mt-2 text-center text-lg text-gold-light">
          {costumeName} — {personName}
        </p>
        <p className="mt-3 text-center text-sm text-mist">
          Esta fantasia possui {votes} {votesLabel}.
        </p>
        <p className="mt-3 text-center text-sm text-rose-200">
          A fantasia e todos os votos recebidos por ela serão apagados
          permanentemente.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <LoadingButton
            variant="ghost"
            onClick={onCancel}
            disabled={removing}
            className="sm:flex-1"
          >
            Cancelar
          </LoadingButton>
          <LoadingButton
            variant="danger"
            onClick={onConfirm}
            loading={removing}
            loadingText="Removendo participante..."
            className="sm:flex-1"
          >
            Remover participante
          </LoadingButton>
        </div>
      </div>
    </div>
  )
}
