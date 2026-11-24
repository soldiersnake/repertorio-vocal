import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PieceRow, type PieceRowData } from "@/components/PieceRow";
import { RepertoireFilters } from "@/components/RepertoireFilters";
import { HOME_PATH } from "@/lib/auth-routes";
import { monthStartIso } from "@/lib/dates";
import { filterPieces, minutesThisMonth, parseFilters, repertoireSummary } from "@/lib/repertoire";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/require-user";
import type { Rehearsal } from "@/lib/types";

export const metadata: Metadata = { title: "Repertorio · Repertorio Vocal" };

const PRIMARY_BUTTON =
  "inline-flex h-11 items-center justify-center gap-2 rounded-ui bg-brass px-4 text-body font-semibold text-brass-ink no-underline transition-colors hover:bg-brass/90";

type RepertorioPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RepertorioPage({ searchParams }: RepertorioPageProps) {
  const filters = parseFilters(await searchParams);
  const user = await requireUser();
  const supabase = await createClient();
  const now = new Date();

  const [piecesResult, rehearsalsResult] = await Promise.all([
    supabase
      .from("pieces")
      .select("id, title, composer, work, role, status, range_low, range_high")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .overrideTypes<PieceRowData[], { merge: false }>(),
    supabase
      .from("rehearsals")
      .select("minutes, practiced_on")
      .eq("user_id", user.id)
      .gte("practiced_on", monthStartIso(now))
      .overrideTypes<Pick<Rehearsal, "minutes" | "practiced_on">[], { merge: false }>(),
  ]);
  if (piecesResult.error || rehearsalsResult.error) {
    throw new Error("No se pudo cargar el repertorio.");
  }

  const pieces = piecesResult.data;
  const visible = filterPieces(pieces, filters);
  const isEmpty = pieces.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-display text-fg">Repertorio</h1>
          <p className="text-small text-fg-muted tabular-nums">
            {repertoireSummary(pieces, minutesThisMonth(rehearsalsResult.data, now))}
          </p>
        </div>
        {isEmpty ? null : (
          <Link href={`${HOME_PATH}/nueva`} className={PRIMARY_BUTTON}>
            <Plus aria-hidden size={18} strokeWidth={1.75} />
            Añadir pieza
          </Link>
        )}
      </header>

      {isEmpty ? (
        <section className="flex flex-col items-start gap-4 border-y border-line py-10">
          <h2 className="font-display text-title text-fg">Tu repertorio está vacío</h2>
          <p className="max-w-prose text-body text-fg-muted">
            Añade el aria, la canción o el rol que estés preparando. Podrás anotar su tesitura, su
            estado de estudio y cada ensayo.
          </p>
          <Link href={`${HOME_PATH}/nueva`} className={PRIMARY_BUTTON}>
            <Plus aria-hidden size={18} strokeWidth={1.75} />
            Añadir tu primera pieza
          </Link>
        </section>
      ) : (
        <>
          <RepertoireFilters filters={filters} />
          {visible.length === 0 ? (
            <section className="flex flex-col items-start gap-3 border-y border-line py-10">
              <h2 className="font-display text-title text-fg">Ninguna pieza coincide</h2>
              <p className="max-w-prose text-body text-fg-muted">
                Prueba con otro estado u otra búsqueda, o vuelve a ver todo tu repertorio.
              </p>
              <Link
                href={HOME_PATH}
                className="inline-flex h-11 items-center rounded-ui border border-line px-4 text-body font-medium text-fg no-underline transition-colors hover:border-fg-muted hover:bg-surface"
              >
                Quitar filtros
              </Link>
            </section>
          ) : (
            <ul aria-label="Piezas" className="flex flex-col divide-y divide-line border-y border-line">
              {visible.map((piece) => (
                <PieceRow key={piece.id} piece={piece} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
