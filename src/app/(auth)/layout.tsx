export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center px-5 py-12">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-10">
        <header className="flex flex-col gap-3">
          <h1 className="font-display text-display text-fg sm:text-hero">Repertorio Vocal</h1>
          <p className="text-body text-fg-muted">
            Tus arias, canciones y roles en un sitio: en qué punto está cada pieza, su tesitura y
            tus ensayos.
          </p>
        </header>
        {children}
      </div>
    </main>
  );
}
