type AttendanceSelectorProps = {
  value: boolean | null
  onChange: (value: boolean) => void
  error?: string
}

const OPTIONS = [
  {
    value: true,
    label: '🎭 Sim, estarei lá!',
    description: 'Contamos com você',
  },
  {
    value: false,
    label: '😢 Não vou conseguir',
    description: 'Tudo bem, registramos',
  },
] as const

export function AttendanceSelector({
  value,
  onChange,
  error,
}: AttendanceSelectorProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-1 text-sm font-medium text-cream/90">
        Você vai? <span className="text-gold">*</span>
      </legend>

      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-required="true">
        {OPTIONS.map((option) => {
          const selected = value === option.value
          return (
            <label
              key={String(option.value)}
              className={[
                'glass-card relative cursor-pointer rounded-xl p-4 transition-all duration-200',
                selected
                  ? 'border-gold/50 bg-gold/10 gold-glow'
                  : 'hover:border-white/20 hover:bg-white/5',
              ].join(' ')}
            >
              <input
                type="radio"
                name="presenca"
                className="sr-only"
                checked={selected}
                onChange={() => onChange(option.value)}
                aria-describedby={error ? 'attendance-error' : undefined}
              />
              <span className="block text-sm font-medium text-cream sm:text-base">
                {option.label}
              </span>
              <span className="mt-1 block text-xs text-mist">
                {option.description}
              </span>
              {selected && (
                <span
                  className="absolute top-3 right-3 h-2 w-2 rounded-full bg-gold"
                  aria-hidden="true"
                />
              )}
            </label>
          )
        })}
      </div>

      {error && (
        <p id="attendance-error" className="text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}
