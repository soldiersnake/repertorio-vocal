export default function PiezaLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-8">
      <p role="status" className="sr-only">
        Cargando la pieza…
      </p>
      <div aria-hidden className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="flex flex-col gap-4">
          <span className="h-11 w-32 animate-pulse rounded-ui bg-surface" />
          <span className="h-9 w-72 max-w-full animate-pulse rounded-ui bg-surface-2" />
          <span className="h-4 w-56 max-w-full animate-pulse rounded-ui bg-surface" />
          <span className="mt-4 h-16 w-full animate-pulse rounded-ui bg-surface" />
        </div>
        <div className="flex flex-col gap-3">
          <span className="h-6 w-28 animate-pulse rounded-ui bg-surface-2" />
          <span className="h-44 w-full animate-pulse rounded-ui bg-surface" />
        </div>
      </div>
    </div>
  );
}
