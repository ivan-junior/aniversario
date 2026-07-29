import { Minus, Plus } from 'lucide-react'

type PeopleCounterProps = {
  value: number
  onChange: (value: number) => void
  min?: number
}

export function PeopleCounter({
  value,
  onChange,
  min = 1,
}: PeopleCounterProps) {
  const decrease = () => {
    if (value > min) onChange(value - 1)
  }

  const increase = () => {
    onChange(value + 1)
  }

  return (
    <div className="space-y-3">
      <label
        htmlFor="quantidade"
        className="block text-sm font-medium text-cream/90"
      >
        Quantas pessoas vão com você?
      </label>
      <p className="text-xs text-mist">
        Inclua você mesmo. Ex.: 1 = só você · 2 = você + 1 acompanhante
      </p>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={decrease}
          disabled={value <= min}
          className="glass-card flex h-11 w-11 items-center justify-center rounded-lg text-cream transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Diminuir quantidade de pessoas"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>

        <output
          id="quantidade"
          className="font-display min-w-10 text-center text-2xl text-gold-light tabular-nums"
          aria-live="polite"
        >
          {value}
        </output>

        <button
          type="button"
          onClick={increase}
          className="glass-card flex h-11 w-11 items-center justify-center rounded-lg text-cream transition-colors hover:border-gold/40 hover:text-gold"
          aria-label="Aumentar quantidade de pessoas"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
