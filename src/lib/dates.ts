/** Mayor adelanto horario sobre UTC (UTC+14). */
const MAX_UTC_OFFSET_MS = 14 * 60 * 60 * 1000;

/** Fecha ISO `YYYY-MM-DD` (UTC) del instante dado. */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Última fecha que ya es "hoy" en algún huso horario.
 * El servidor corre en UTC; así no se rechaza el ensayo de hoy de quien va por delante de UTC.
 */
export function latestTodayIso(now: Date = new Date()): string {
  return toIsoDate(new Date(now.getTime() + MAX_UTC_OFFSET_MS));
}

/** `true` si `iso` (`YYYY-MM-DD`) no es posterior a hoy en ningún huso horario. */
export function isNotFutureDate(iso: string, now: Date = new Date()): boolean {
  return iso <= latestTodayIso(now);
}

/** Primer día (`YYYY-MM-DD`, UTC) del mes del instante dado. */
export function monthStartIso(now: Date = new Date()): string {
  return `${toIsoDate(now).slice(0, 7)}-01`;
}

const DATE_FORMAT = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-11-24" → "24 nov 2026". Devuelve la cadena tal cual si no es una fecha ISO válida. */
export function formatDateEs(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || Number.isNaN(date.getTime())) return iso;
  return DATE_FORMAT.format(date).replace(/\./g, "");
}
