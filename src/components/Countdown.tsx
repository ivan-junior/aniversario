import { useEffect, useState } from 'react'
import { EVENT_DATE, getTimeLeft, padTime, type TimeLeft } from '../utils/date'

const UNITS: { key: keyof Omit<TimeLeft, 'isComplete'>; label: string }[] = [
  { key: 'days', label: 'DIAS' },
  { key: 'hours', label: 'HORAS' },
  { key: 'minutes', label: 'MIN' },
  { key: 'seconds', label: 'SEG' },
]

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeLeft(EVENT_DATE),
  )

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(EVENT_DATE))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  if (timeLeft.isComplete) {
    return (
      <p
        className="font-display text-center text-xl text-gold-light sm:text-2xl"
        role="status"
      >
        A festa começou. 🎭
      </p>
    )
  }

  return (
    <div
      className="flex items-start justify-center gap-2 sm:gap-3"
      role="timer"
      aria-live="polite"
      aria-label={`Faltam ${timeLeft.days} dias, ${timeLeft.hours} horas, ${timeLeft.minutes} minutos e ${timeLeft.seconds} segundos`}
    >
      {UNITS.map((unit, index) => (
        <div key={unit.key} className="flex items-start gap-2 sm:gap-3">
          <div className="flex flex-col items-center gap-2">
            <div className="glass-card gold-glow flex h-14 w-14 items-center justify-center rounded-lg sm:h-16 sm:w-16 sm:rounded-xl md:h-20 md:w-20">
              <span className="font-display text-xl font-semibold tracking-wider text-cream tabular-nums sm:text-3xl md:text-4xl">
                {unit.key === 'days'
                  ? timeLeft[unit.key]
                  : padTime(timeLeft[unit.key])}
              </span>
            </div>
            <span className="text-[0.65rem] font-medium tracking-[0.2em] text-mist uppercase sm:text-xs">
              {unit.label}
            </span>
          </div>
          {index < UNITS.length - 1 && (
            <span
              className="font-display mt-3 text-xl text-gold/60 sm:mt-4 sm:text-3xl"
              aria-hidden="true"
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
