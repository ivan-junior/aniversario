import { Countdown } from './Countdown'
import { Prize } from './Prize'
import { ScrollIndicator } from './ScrollIndicator'

export function Hero() {
  return (
    <section className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 py-16 sm:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <p className="animate-fade-up delay-1 mt-4 max-w-md text-base sm:text-lg font-display tracking-[0.15em] text-cream/90 uppercase">
          Ivan faz 33 em uma...
        </p>

        <h1 className="animate-fade-up delay-2 font-display mt-2 text-4xl leading-tight font-semibold tracking-wide text-cream uppercase sm:text-5xl md:text-6xl lg:text-7xl">
          Festa à Fantasia
        </h1>

        <p className="animate-fade-up delay-3 mt-4 max-w-md text-base text-mist sm:text-lg">
          Escolha sua melhor fantasia e venha irreconhecível.
        </p>

        <div className="animate-fade-up delay-4 mt-10 w-full sm:mt-12">
          <Countdown />
        </div>

        <div className="animate-fade-up delay-5 mt-8 sm:mt-10">
          <Prize />
        </div>

        <div className="animate-fade-up delay-6 mt-8 space-y-1 text-sm text-mist/80 sm:mt-10 sm:text-base">
          <p className="font-display tracking-[0.15em] text-cream/90 uppercase">
            29 de Agosto de 2026 • 20H
          </p>
          <p className="mt-3">Chácara Aconchêgo</p>
          <p>Rua E, 185 — Recreio Internacional</p>
          <p>Ribeirão Preto</p>
          <a
            href="https://maps.app.goo.gl/Y33FHjdWd7ufBzcX7"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-gold/90 underline-offset-4 transition-colors hover:text-gold-light hover:underline"
          >
            Toque aqui para ver no seu GPS
          </a>
        </div>

        <div className="animate-fade-up delay-6 mt-12 sm:mt-14">
          <ScrollIndicator targetId="confirmacao" />
        </div>
      </div>
    </section>
  )
}
