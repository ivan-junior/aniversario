export const EVENT_DATE = new Date('2026-08-29T19:30:00-03:00')

export type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
  isComplete: boolean
}

export function getTimeLeft(target: Date, now: Date = new Date()): TimeLeft {
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isComplete: true,
    }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, isComplete: false }
}

export function padTime(value: number): string {
  return String(value).padStart(2, '0')
}
