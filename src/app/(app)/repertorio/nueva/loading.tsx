export default function NuevaPiezaLoading() {
  return (
    <div aria-busy="true" className="flex max-w-2xl flex-col gap-6">
      <span aria-hidden className="h-11 w-32 animate-pulse rounded-ui bg-surface" />
      <h1 className="font-display text-display text-fg">Nueva pieza</h1>
      <p role="status" className="sr-only">
        Cargando el formulario…
      </p>
      <div aria-hidden className="flex flex-col gap-6">
        {[0, 1, 2, 3].map((field) => (
          <div key={field} className="flex flex-col gap-1.5">
            <span className="h-4 w-24 animate-pulse rounded-ui bg-surface" />
            <span className="h-11 w-full animate-pulse rounded-ui bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
