type DatumProps = {
  label: string;
  value: string | null;
  /** Dato de medición (fechas, cifras): mono con cifras tabulares. */
  mono?: boolean;
};

/** Par término/valor dentro de un `<dl>`. Sin valor muestra "Sin indicar". */
export function Datum({ label, value, mono = false }: DatumProps) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-caption text-fg-muted">{label}</dt>
      {value ? (
        <dd className={`text-body text-fg [overflow-wrap:anywhere] ${mono ? "font-mono" : ""}`}>{value}</dd>
      ) : (
        <dd className="text-body text-fg-muted">Sin indicar</dd>
      )}
    </div>
  );
}
