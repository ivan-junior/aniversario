import { AtmosphericBackground } from './components/AtmosphericBackground'
import { Hero } from './components/Hero'
import { RSVPForm } from './components/RSVPForm'

function App() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <AtmosphericBackground />
      <main className="relative z-10">
        <Hero />
        <section
          id="confirmacao"
          className="relative px-5 py-20 sm:px-8 sm:py-28"
          aria-labelledby="rsvp-heading"
        >
          <h2 id="rsvp-heading" className="sr-only">
            Confirmação de presença
          </h2>
          <RSVPForm />
        </section>
      </main>
    </div>
  )
}

export default App
