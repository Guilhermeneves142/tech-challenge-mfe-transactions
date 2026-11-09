export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="flex flex-col gap-4">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-12 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="col-span-12 h-24 animate-pulse rounded bg-gray-100 sm:col-span-6 lg:col-span-3" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded bg-gray-100" />
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
