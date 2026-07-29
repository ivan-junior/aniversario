const PARTICLES = [
  { left: '8%', delay: '0s', duration: '14s', size: 2 },
  { left: '18%', delay: '2s', duration: '18s', size: 1.5 },
  { left: '27%', delay: '5s', duration: '16s', size: 2 },
  { left: '39%', delay: '1s', duration: '20s', size: 1 },
  { left: '48%', delay: '7s', duration: '15s', size: 2.5 },
  { left: '58%', delay: '3s', duration: '19s', size: 1.5 },
  { left: '67%', delay: '6s', duration: '17s', size: 2 },
  { left: '76%', delay: '4s', duration: '21s', size: 1 },
  { left: '85%', delay: '8s', duration: '16s', size: 2 },
  { left: '93%', delay: '2.5s', duration: '18s', size: 1.5 },
  { left: '12%', delay: '9s', duration: '22s', size: 1 },
  { left: '72%', delay: '11s', duration: '14s', size: 2 },
]

export function AtmosphericBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-ink" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #0c0814 0%, #1a0b2e 45%, #050308 100%)',
        }}
      />
      <div className="fog-layer" />
      <div className="fog-layer fog-layer--slow" />
      <div
        className="absolute top-1/4 left-1/2 h-[40vw] w-[60vw] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(201,162,39,0.12) 0%, transparent 70%)',
        }}
      />
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: p.left,
            bottom: '-5%',
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
      <div className="vignette" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%270 0 200 200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',
        }}
      />
    </div>
  )
}
