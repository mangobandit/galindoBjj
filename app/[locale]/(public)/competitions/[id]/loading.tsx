/** Route-level skeleton shown while the competition tracker data loads. */
export default function Loading() {
  return (
    <section className="container max-w-5xl py-16 md:py-20">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-12 w-2/3 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-4 w-48 animate-pulse rounded bg-muted" />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-lg border border-border bg-card"
          />
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>
    </section>
  );
}
