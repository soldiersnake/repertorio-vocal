import { RULER_MARKS, rangeToPercent, tesituraLabel } from "@/lib/music";

type TesituraRulerProps = {
  low: string | null;
  high: string | null;
  size?: "sm" | "lg";
  className?: string;
};

const FIRST_MARK = RULER_MARKS[0];

/** Posición (%) de cada Do sobre la pauta C2–C6. */
const MARK_POSITIONS = RULER_MARKS.map((mark) => ({
  mark,
  left: rangeToPercent(FIRST_MARK, mark)?.width ?? 0,
}));

/**
 * Regla de tesitura: pauta de C2 a C6 con una marca en cada Do y el ámbito de la pieza
 * como un tramo de latón que crece desde su nota grave.
 */
export function TesituraRuler({ low, high, size = "sm", className = "" }: TesituraRulerProps) {
  const label = tesituraLabel(low, high);
  const span = low && high ? rangeToPercent(low, high) : null;

  if (!label || !span) {
    return <p className={`text-caption text-fg-muted ${className}`}>Sin tesitura</p>;
  }

  const large = size === "lg";

  return (
    <div role="img" aria-label={label} className={`flex flex-col gap-1.5 ${className}`}>
      <span
        className={`font-mono text-fg ${large ? "text-title" : "text-caption"}`}
      >
        {low}–{high}
      </span>
      <div className="px-2.5">
        <div className={`relative ${large ? "h-5" : "h-3"}`}>
          <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
          {MARK_POSITIONS.map(({ mark, left }) => (
            <span
              key={mark}
              className="absolute inset-y-0 w-px bg-line"
              style={{ left: `${left}%` }}
            />
          ))}
          <span
            data-testid="tesitura-span"
            className={`tesitura-span absolute top-1/2 min-w-1.5 rounded-full bg-brass ${
              large ? "-mt-1 h-2" : "-mt-[3px] h-1.5"
            }`}
            style={{ left: `${span.left}%`, width: `${span.width}%` }}
          />
        </div>
        <div className="relative mt-1 h-4">
          {MARK_POSITIONS.map(({ mark, left }) => (
            <span
              key={mark}
              className="absolute -translate-x-1/2 font-mono text-caption leading-none text-fg-muted"
              style={{ left: `${left}%` }}
            >
              {mark}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
