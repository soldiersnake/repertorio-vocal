import { statusShortLabel } from "@/lib/music";
import type { PieceStatus } from "@/lib/types";

const TONE: Record<PieceStatus, { text: string; dot: string; border: string }> = {
  por_aprender: { text: "text-st-aprender", dot: "bg-st-aprender", border: "border-st-aprender/40" },
  en_estudio: { text: "text-st-estudio", dot: "bg-st-estudio", border: "border-st-estudio/40" },
  listo: { text: "text-st-listo", dot: "bg-st-listo", border: "border-st-listo/40" },
};

/** Estado de estudio de una pieza: color del token del estado y siempre con texto. */
export function StatusBadge({ status }: { status: PieceStatus }) {
  const tone = TONE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-caption font-medium ${tone.text} ${tone.border}`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${tone.dot}`} />
      {statusShortLabel(status)}
    </span>
  );
}
