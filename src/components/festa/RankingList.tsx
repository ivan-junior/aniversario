import type { RankingResult } from '../../types/festa'
import { LoadingButton } from './LoadingButton'

type RankingListProps = {
  data: RankingResult | null
  loading: boolean
  onRefresh: () => void
}

export function RankingList({ data, loading, onRefresh }: RankingListProps) {
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
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <p className="font-display text-base text-cream">
                    {entry.position}º {entry.costume} — {entry.name}
                  </p>
                  <p className="mt-1 text-sm text-gold-light">
                    {entry.votes} {entry.votes === 1 ? 'voto' : 'votos'}
                  </p>
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
