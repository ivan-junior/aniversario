import { Link } from 'react-router-dom'
import { AtmosphericBackground } from '../AtmosphericBackground'
import type { ReactNode } from 'react'

type FestaLayoutProps = {
  children: ReactNode
  showBackToHub?: boolean
}

export function FestaLayout({
  children,
  showBackToHub = false,
}: FestaLayoutProps) {
  const year = new Date().getFullYear()

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <AtmosphericBackground />
      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-col px-5 py-10 sm:px-8 sm:py-14">
        {showBackToHub ? (
          <Link
            to="/festa"
            className="mb-6 inline-flex self-start text-sm text-gold/90 underline-offset-4 hover:text-gold-light hover:underline"
          >
            ← Voltar ao hub
          </Link>
        ) : null}
        {children}
      </main>
      <footer className="relative z-10 px-5 pb-10 pt-4 text-center sm:px-8">
        <p className="text-xs tracking-wide text-mist/50 sm:text-sm">
          © {year} Ivan Junior. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  )
}
