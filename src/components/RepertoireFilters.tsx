"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition, type FormEvent } from "react";
import { Search } from "lucide-react";
import { HOME_PATH } from "@/lib/auth-routes";
import { statusShortLabel } from "@/lib/music";
import { filtersToSearch, type RepertoireFilters as Filters } from "@/lib/repertoire";
import { PIECE_STATUSES, type PieceStatus } from "@/lib/types";

const OPTIONS: { value: PieceStatus | null; label: string }[] = [
  { value: null, label: "Todas" },
  ...PIECE_STATUSES.map((status) => ({ value: status, label: statusShortLabel(status) })),
];

/**
 * Filtros del listado: estado (control segmentado) y búsqueda por título o compositor.
 * Solo actualiza la URL; el filtrado lo hace el Server Component con los searchParams.
 * Sin JavaScript sigue funcionando como formulario GET.
 */
export function RepertoireFilters({ filters }: { filters: Filters }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // El segmento elegido se marca al instante, sin esperar a que el servidor responda.
  const [estado, setOptimisticEstado] = useOptimistic(filters.estado);

  function navigate(next: Filters) {
    startTransition(() => {
      setOptimisticEstado(next.estado);
      router.replace(`${HOME_PATH}${filtersToSearch(next)}`, { scroll: false });
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = new FormData(event.currentTarget).get("q");
    navigate({ ...filters, q: typeof q === "string" ? q : "" });
  }

  return (
    <form
      role="search"
      aria-label="Filtrar repertorio"
      aria-busy={pending}
      action={HOME_PATH}
      method="get"
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <fieldset className="min-w-0">
        <legend className="sr-only">Estado</legend>
        <div className="grid grid-cols-4 rounded-ui border border-line bg-surface p-0.5 md:inline-grid">
          {OPTIONS.map((option) => (
            <label
              key={option.label}
              className="flex min-h-11 cursor-pointer items-center justify-center rounded-[calc(var(--radius)-2px)] px-2 text-center text-small leading-tight text-fg-muted transition-colors hover:text-fg has-[:checked]:bg-surface-2 has-[:checked]:font-medium has-[:checked]:text-fg has-[:checked]:shadow-[inset_0_0_0_1px_var(--brass)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brass md:px-4"
            >
              <input
                type="radio"
                name="estado"
                value={option.value ?? ""}
                checked={estado === option.value}
                onChange={() => navigate({ ...filters, estado: option.value })}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-2 md:w-80">
        <label htmlFor="repertorio-q" className="sr-only">
          Buscar por título o compositor
        </label>
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden
            size={18}
            strokeWidth={1.75}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-muted"
          />
          <input
            key={filters.q}
            id="repertorio-q"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Título o compositor"
            autoComplete="off"
            enterKeyHint="search"
            className="h-11 w-full rounded-ui border border-line bg-surface-2 pr-3 pl-10 text-body text-fg transition-colors placeholder:text-fg-muted hover:border-fg-muted"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center rounded-ui border border-line px-4 text-small font-medium text-fg transition-colors hover:border-fg-muted hover:bg-surface"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
