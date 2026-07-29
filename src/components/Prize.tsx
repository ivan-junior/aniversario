export function Prize() {
  return (
    <div className="mx-auto max-w-sm text-center">
      <div className="inline-flex flex-col items-center gap-1 rounded-lg border border-gold/25 bg-gold/5 px-5 py-3">
        <p className="font-display text-[0.7rem] tracking-[0.25em] text-gold-light uppercase sm:text-xs">
          🏆 Melhor Fantasia
        </p>
        <p className="font-display text-2xl font-semibold text-gold sm:text-3xl">
          R$ 300
        </p>
      </div>
      <p className="mt-3 text-sm text-mist italic sm:text-base">
        Então capriche... sua fantasia pode valer R$ 300!
      </p>
    </div>
  )
}
