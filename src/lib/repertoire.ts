import { monthStartIso } from "./dates";
import { PIECE_STATUSES, type Piece, type PieceStatus } from "./types";

/** Filtros del listado tal como viajan en la URL (`?estado=&q=`). */
export type RepertoireFilters = {
  estado: PieceStatus | null;
  q: string;
};

export const NO_FILTERS: RepertoireFilters = { estado: null, q: "" };

const MAX_QUERY_LENGTH = 100;

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function isPieceStatus(value: string): value is PieceStatus {
  return (PIECE_STATUSES as readonly string[]).includes(value);
}

/** Lee los filtros de los searchParams. Ignora un estado desconocido y recorta la búsqueda. */
export function parseFilters(params: Record<string, string | string[] | undefined>): RepertoireFilters {
  const estado = firstValue(params.estado);
  const q = firstValue(params.q).trim().slice(0, MAX_QUERY_LENGTH);
  return { estado: isPieceStatus(estado) ? estado : null, q };
}

/** Cadena de búsqueda de la URL para unos filtros: "?estado=listo&q=verdi" o "" sin filtros. */
export function filtersToSearch(filters: RepertoireFilters): string {
  const params = new URLSearchParams();
  if (filters.estado) params.set("estado", filters.estado);
  const q = filters.q.trim();
  if (q) params.set("q", q);
  const search = params.toString();
  return search ? `?${search}` : "";
}

/** Minúsculas y sin tildes, para que "hande" encuentre "Händel". */
export function normalizeForSearch(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

type FilterablePiece = Pick<Piece, "title" | "composer" | "status">;

/** Filtra por estado y por título o compositor (sin distinguir mayúsculas ni tildes). */
export function filterPieces<T extends FilterablePiece>(pieces: readonly T[], filters: RepertoireFilters): T[] {
  const query = normalizeForSearch(filters.q);
  return pieces.filter((piece) => {
    if (filters.estado && piece.status !== filters.estado) return false;
    if (!query) return true;
    return (
      normalizeForSearch(piece.title).includes(query) ||
      normalizeForSearch(piece.composer).includes(query)
    );
  });
}

/** Suma de minutos de una lista de ensayos. */
export function sumMinutes(rehearsals: readonly { minutes: number }[]): number {
  return rehearsals.reduce((total, rehearsal) => total + rehearsal.minutes, 0);
}

/** Minutos ensayados en el mes en curso (UTC) del instante dado. */
export function minutesThisMonth(
  rehearsals: readonly { minutes: number; practiced_on: string }[],
  now: Date = new Date(),
): number {
  const start = monthStartIso(now);
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const end = monthStartIso(nextMonth);
  return sumMinutes(rehearsals.filter((r) => r.practiced_on >= start && r.practiced_on < end));
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** "12 piezas · 3 listas · 140 min ensayados este mes". */
export function repertoireSummary(
  pieces: readonly Pick<Piece, "status">[],
  monthMinutes: number,
): string {
  const ready = pieces.filter((piece) => piece.status === "listo").length;
  return [
    plural(pieces.length, "pieza", "piezas"),
    plural(ready, "lista", "listas"),
    `${monthMinutes} min ensayados este mes`,
  ].join(" · ");
}

/** "compositor · obra · rol", omitiendo lo que falte. */
export function pieceByline(piece: Pick<Piece, "composer" | "work" | "role">): string {
  return [piece.composer, piece.work, piece.role].filter(Boolean).join(" · ");
}
