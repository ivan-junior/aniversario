import type { RankingEntry, RankingResult } from '../../types/festa'
import { LoadingButton } from './LoadingButton'

type RankingListProps = {
  data: RankingResult | null
  loading: boolean
  onRefresh: () => void
  onRemoveParticipant?: (entry: RankingEntry) => void
  removeDisabled?: boolean
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

export function RankingList({
  data,
  loading,
  onRefresh,
  onRemoveParticipant,
  removeDisabled = false,
}: RankingListProps) {
  return (
    <section className="glass-card rounded-2xl px-5 py-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg text-cream">🏆 Ranking</h2>
        <LoadingButton
          variant="ghost"
          onClick={onRefresh}
          loading={loading}
          loadingText="..."
          className="!min-h-10 !w-auto !px-4 !py-2 !text-sm"
        >
          Atualizar
        </LoadingButton>
      </div>

      {data ? (
        <>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-mist">
            <p>Total de votos: {data.totalVotes}</p>
            <p>Fantasias cadastradas: {data.totalCostumes}</p>
          </div>

          {data.ranking.length === 0 ? (
            <p className="mt-6 text-center text-sm text-mist">
              Ainda não há votos registrados.
            </p>
          ) : (
            <ol className="mt-5 space-y-3">
              {data.ranking.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base text-cream">
                      {entry.position}º {entry.costume} — {entry.name}
                    </p>
                    <p className="mt-1 text-sm text-gold-light">
                      {entry.votes} {entry.votes === 1 ? 'voto' : 'votos'}
                    </p>
                  </div>
                  {onRemoveParticipant ? (
                    <button
                      type="button"
                      onClick={() => onRemoveParticipant(entry)}
                      disabled={removeDisabled}
                      aria-label={`Remover participante ${entry.costume} — ${entry.name}`}
                      title="Remover participante"
                      className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-mist/70 transition hover:bg-rose-500/15 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <TrashIcon />
                    </button>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </>
      ) : (
        <p className="mt-6 text-center text-sm text-mist">
          {loading ? 'Carregando ranking...' : 'Toque em Atualizar para carregar.'}
        </p>
      )}
    </section>
  )
}
