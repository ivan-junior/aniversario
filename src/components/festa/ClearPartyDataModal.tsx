import { useState } from 'react'
import { createPortal } from 'react-dom'
import { LoadingButton } from './LoadingButton'

type ClearPartyDataModalProps = {
  clearing: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ClearPartyDataModal({
  clearing,
  onCancel,
  onConfirm,
}: ClearPartyDataModalProps) {
  const [confirmation, setConfirmation] = useState('')
  const canConfirm = confirmation === 'LIMPAR'

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-party-title"
    >
      <div className="glass-card gold-glow w-full max-w-md rounded-2xl px-5 py-6 sm:px-7">
        <h2
          id="clear-party-title"
          className="font-display text-center text-xl text-cream"
        >
          Apagar todas as fantasias e votos?
        </h2>
        <p className="mt-3 text-sm text-mist">
          Essa ação irá remover permanentemente:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-mist">
          <li>todas as fantasias cadastradas</li>
          <li>todos os votos registrados</li>
        </ul>
        <p className="mt-3 text-sm text-mist">
          As configurações da festa e usuários administrativos serão mantidos.
        </p>
        <p className="mt-2 text-sm font-medium text-rose-200">
          Essa ação não pode ser desfeita.
        </p>

        <label className="mt-5 block text-sm text-mist" htmlFor="clear-confirm">
          Digite LIMPAR para confirmar
        </label>
        <input
          id="clear-confirm"
          type="text"
          autoComplete="off"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          disabled={clearing}
          className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-cream outline-none focus:border-gold/50"
          placeholder="LIMPAR"
        />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <LoadingButton
            variant="ghost"
            onClick={onCancel}
            disabled={clearing}
            className="sm:flex-1"
          >
            Cancelar
          </LoadingButton>
          <LoadingButton
            variant="danger"
            onClick={onConfirm}
            loading={clearing}
            loadingText="Limpando fantasias e votos..."
            disabled={!canConfirm}
            className="sm:flex-1"
          >
            Apagar tudo
          </LoadingButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}
