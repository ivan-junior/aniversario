import type { Costume } from '../../types/festa'

type CostumeCardProps = {
  costume: Costume
  selected?: boolean
  locked?: boolean
  onSelect?: (id: string) => void
}

export function CostumeCard({
  costume,
  selected = false,
  locked = false,
  onSelect,
}: CostumeCardProps) {
  const isMine = locked || costume.isMine

  return (
    <button
      type="button"
      disabled={isMine}
      onClick={() => onSelect?.(costume.id)}
      aria-pressed={selected}
      className={[
        'w-full rounded-2xl border px-4 py-4 text-left transition',
        isMine
          ? 'cursor-not-allowed border-white/5 bg-white/[0.02] opacity-60'
          : selected
            ? 'border-gold/60 bg-gold/10 gold-glow'
            : 'border-white/10 bg-white/[0.04] hover:border-gold/35 hover:bg-white/[0.07]',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]',
            isMine
              ? 'border-white/20 text-mist'
              : selected
                ? 'border-gold bg-gold text-ink'
                : 'border-white/30 text-transparent',
          ].join(' ')}
          aria-hidden
        >
          {selected && !isMine ? '●' : ''}
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-tight text-cream">
            {isMine ? `🚫 ${costume.costume}` : costume.costume}
          </p>
          <p className="mt-1 text-sm text-mist">{costume.name}</p>
          {isMine ? (
            <p className="mt-2 text-xs tracking-wide text-gold/80 uppercase">
              Sua fantasia
            </p>
          ) : null}
        </div>
      </div>
    </button>
  )
}
