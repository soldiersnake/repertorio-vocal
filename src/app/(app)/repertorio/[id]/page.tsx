import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { Datum } from "@/components/Datum";
import { RehearsalForm } from "@/components/RehearsalForm";
import { StatusBadge } from "@/components/StatusBadge";
import { TesituraRuler } from "@/components/TesituraRuler";
import { HOME_PATH } from "@/lib/auth-routes";
import { formatDateEs, latestTodayIso, toIsoDate } from "@/lib/dates";
import { pieceByline, sumMinutes } from "@/lib/repertoire";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/require-user";
import type { Piece, Rehearsal } from "@/lib/types";
import { idSchema } from "@/lib/validation";
import { addRehearsal, deletePiece, deleteRehearsal } from "../actions";

export const metadata: Metadata = { title: "Pieza · Repertorio Vocal" };

type PiezaPageProps = { params: Promise<{ id: string }> };

type RehearsalRow = Pick<Rehearsal, "id" | "practiced_on" | "minutes" | "note">;

export default async function PiezaPage({ params }: PiezaPageProps) {
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();

  const user = await requireUser();
  const supabase = await createClient();
  const [pieceResult, rehearsalsResult] = await Promise.all([
    supabase
      .from("pieces")
      .select("*")
      .eq("id", id.data)
      .eq("user_id", user.id)
      .maybeSingle<Piece>(),
    supabase
      .from("rehearsals")
      .select("id, practiced_on, minutes, note")
      .eq("piece_id", id.data)
      .eq("user_id", user.id)
      .order("practiced_on", { ascending: false })
      .order("created_at", { ascending: false })
      .overrideTypes<RehearsalRow[], { merge: false }>(),
  ]);
  if (pieceResult.error || rehearsalsResult.error) throw new Error("No se pudo cargar la pieza.");
  const piece = pieceResult.data;
  if (!piece) notFound();

  const rehearsals = rehearsalsResult.data;
  const lastRehearsal = rehearsals[0];
  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <BackLink href={HOME_PATH}>Repertorio</BackLink>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
        <article className="flex min-w-0 flex-col gap-8">
          <header className="flex flex-col items-start gap-3">
            <h1 className="font-display text-display text-fg [overflow-wrap:anywhere] sm:text-hero">
              {piece.title}
            </h1>
            <p className="text-body text-fg-muted [overflow-wrap:anywhere]">{pieceByline(piece)}</p>
            <StatusBadge status={piece.status} />
          </header>

          <section aria-labelledby="tesitura-heading" className="flex flex-col gap-3">
            <h2 id="tesitura-heading" className="text-body font-medium text-fg">
              Tesitura
            </h2>
            <TesituraRuler low={piece.range_low} high={piece.range_high} size="lg" className="max-w-xl" />
          </section>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <Datum label="Idioma" value={piece.language} />
            <Datum label="Tonalidad" value={piece.key} />
            <Datum label="Dificultad" value={`${piece.difficulty} de 5`} mono />
            <Datum
              label="Último ensayo"
              value={lastRehearsal ? formatDateEs(lastRehearsal.practiced_on) : null}
              mono
            />
          </dl>

          <section aria-labelledby="notas-heading" className="flex flex-col gap-2">
            <h2 id="notas-heading" className="text-body font-medium text-fg">
              Notas
            </h2>
            {piece.notes ? (
              <p className="max-w-prose whitespace-pre-line text-body text-fg [overflow-wrap:anywhere]">
                {piece.notes}
              </p>
            ) : (
              <p className="text-small text-fg-muted">Sin notas.</p>
            )}
          </section>

          <div className="flex flex-wrap items-start gap-3">
            <Link
              href={`${HOME_PATH}/${piece.id}/editar`}
              className="inline-flex h-11 items-center gap-2 rounded-ui border border-line px-4 text-body font-medium text-fg no-underline transition-colors hover:border-fg-muted hover:bg-surface"
            >
              <Pencil aria-hidden size={18} strokeWidth={1.75} />
              Editar pieza
            </Link>
            <ConfirmDelete
              action={deletePiece.bind(null, piece.id)}
              triggerLabel="Borrar pieza"
              prompt={`¿Borrar «${piece.title}» y todos sus ensayos? No se puede deshacer.`}
              confirmLabel="Sí, borrar pieza"
              pendingLabel="Borrando pieza…"
            />
          </div>
        </article>

        <section aria-labelledby="ensayos-heading" className="flex min-w-0 flex-col gap-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="ensayos-heading" className="font-display text-title text-fg">
              Ensayos
            </h2>
            <p className="font-mono text-small text-fg-muted">
              <span className="sr-only">Total: </span>
              {sumMinutes(rehearsals)} min
            </p>
          </div>

          <div className="rounded-ui border border-line bg-surface p-4">
            <RehearsalForm
              action={addRehearsal}
              pieceId={piece.id}
              today={toIsoDate(now)}
              maxDate={latestTodayIso(now)}
            />
          </div>

          {rehearsals.length === 0 ? (
            <p className="text-small text-fg-muted">Aún no has registrado ensayos de esta pieza.</p>
          ) : (
            <ul aria-label="Ensayos registrados" className="flex flex-col divide-y divide-line border-y border-line">
              {rehearsals.map((rehearsal) => {
                const date = formatDateEs(rehearsal.practiced_on);
                return (
                  <li key={rehearsal.id} className="flex flex-wrap items-start gap-x-3 gap-y-2 py-3">
                    <div className="min-w-0 flex-1 pt-2.5">
                      <p className="font-mono text-small text-fg">
                        <time dateTime={rehearsal.practiced_on}>{date}</time>
                        <span aria-hidden className="text-fg-muted">
                          {" · "}
                        </span>
                        {rehearsal.minutes} min
                      </p>
                      {rehearsal.note ? (
                        <p className="mt-1 text-small text-fg-muted [overflow-wrap:anywhere]">
                          {rehearsal.note}
                        </p>
                      ) : null}
                    </div>
                    <ConfirmDelete
                      compact
                      action={deleteRehearsal.bind(null, piece.id, rehearsal.id)}
                      triggerLabel={`Borrar ensayo del ${date}`}
                      prompt={`¿Borrar el ensayo del ${date} (${rehearsal.minutes} min)?`}
                      confirmLabel="Sí, borrar ensayo"
                      pendingLabel="Borrando…"
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
