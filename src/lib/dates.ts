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
