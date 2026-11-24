import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { TesituraRuler } from "./TesituraRuler";
import { HOME_PATH } from "@/lib/auth-routes";
import { pieceByline } from "@/lib/repertoire";
import type { Piece } from "@/lib/types";

export type PieceRowData = Pick<
  Piece,
  "id" | "title" | "composer" | "work" | "role" | "status" | "range_low" | "range_high"
>;

/** Fila del listado: título y "compositor · obra · rol"; a la derecha estado y tesitura. */
export function PieceRow({ piece }: { piece: PieceRowData }) {
  return (
    <li>
      <Link
        href={`${HOME_PATH}/${piece.id}`}
        className="-mx-3 flex flex-col gap-3 rounded-ui px-3 py-4 text-fg no-underline transition-colors hover:bg-surface sm:flex-row sm:items-center sm:gap-6"
      >
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-title text-fg [overflow-wrap:anywhere]">{piece.title}</h2>
          <p className="mt-0.5 text-small text-fg-muted [overflow-wrap:anywhere]">{pieceByline(piece)}</p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
          <StatusBadge status={piece.status} />
          <TesituraRuler low={piece.range_low} high={piece.range_high} className="w-40 shrink-0" />
        </div>
      </Link>
    </li>
  );
}
