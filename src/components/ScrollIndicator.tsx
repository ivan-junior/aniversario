import { ChevronDown } from 'lucide-react'

type ScrollIndicatorProps = {
  targetId: string
}

export function ScrollIndicator({ targetId }: ScrollIndicatorProps) {
  const scrollToForm = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollToForm}
      className="group mx-auto flex flex-col items-center gap-2 border-0 bg-transparent p-2 text-mist transition-colors hover:text-gold-light"
      aria-label="Ir para confirmação de presença"
    >
      <span className="text-sm tracking-wide">Confirme sua presença</span>
      <ChevronDown
        className="animate-soft-bounce h-6 w-6 text-gold/80 transition-colors group-hover:text-gold"
        aria-hidden="true"
      />
    </button>
  )
}
