export default function RepertorioLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <h1 className="font-display text-display text-fg">Repertorio</h1>
      <p role="status" className="sr-only">
        Cargando repertorio…
      </p>
      <ul aria-hidden className="flex flex-col divide-y divide-line border-y border-line">
        {[0, 1, 2].map((row) => (
          <li key={row} className="flex flex-col gap-2 py-4">
            <span className="h-5 w-48 max-w-full animate-pulse rounded-ui bg-surface-2" />
            <span className="h-4 w-32 max-w-full animate-pulse rounded-ui bg-surface" />
          </li>
        ))}
      </ul>
    </div>
  );
}
