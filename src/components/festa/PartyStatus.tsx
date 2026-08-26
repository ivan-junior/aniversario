type PartyStatusProps = {
  registrationOpen: boolean
  votingOpen: boolean
  loading?: boolean
  className?: string
}

export function PartyStatus({
  registrationOpen,
  votingOpen,
  loading = false,
  className = '',
}: PartyStatusProps) {
  if (loading) {
    return (
      <p className={`text-center text-sm text-mist/60 ${className}`}>
        Carregando status...
      </p>
    )
  }

  return (
    <div
      className={`space-y-1 text-center text-sm text-mist/70 ${className}`}
      aria-live="polite"
    >
      <p>
        Cadastro de fantasias:{' '}
        <span className={registrationOpen ? 'text-emerald-400' : 'text-rose-400'}>
          {registrationOpen ? '🟢 Aberto' : '🔴 Fechado'}
        </span>
      </p>
      <p>
        Votação:{' '}
        <span className={votingOpen ? 'text-emerald-400' : 'text-rose-400'}>
          {votingOpen ? '🟢 Aberta' : '🔴 Fechada'}
        </span>
      </p>
    </div>
  )
}
