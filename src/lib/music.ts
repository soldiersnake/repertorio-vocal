import type { PieceStatus } from "./types";

/** Nota en notación científica: letra, alteración opcional (# o b) y octava 0–7. */
export const NOTE_PATTERN = /^[A-G](#|b)?[0-7]$/;

const PITCH_CLASS: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function isNote(value: string): boolean {
  return NOTE_PATTERN.test(value);
}

/** Convierte una nota a número MIDI (C4 = 60). Devuelve `null` si la nota no es válida. */
export function noteToMidi(note: string): number | null {
  if (!isNote(note)) return null;
  const letter = note[0];
  const accidental = note.length === 3 ? note[1] : "";
  const octave = Number(note[note.length - 1]);
  const shift = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
  return (octave + 1) * 12 + PITCH_CLASS[letter] + shift;
}

/** Convierte un número MIDI a nota (con sostenidos). `null` fuera de C0–B7 o si no es entero. */
export function midiToNote(midi: number): string | null {
  if (!Number.isInteger(midi) || midi < 12 || midi > 107) return null;
  const octave = Math.floor(midi / 12) - 1;
  return `${SHARP_NAMES[midi % 12]}${octave}`;
}

/** Negativo si `a` es más grave que `b`, 0 si suenan igual, positivo si es más aguda. */
export function compareNotes(a: string, b: string): number | null {
  const ma = noteToMidi(a);
  const mb = noteToMidi(b);
  if (ma === null || mb === null) return null;
  return ma - mb;
}

/** Ámbito en semitonos entre la nota grave y la aguda. */
export function rangeSpan(low: string, high: string): number | null {
  return compareNotes(high, low);
}

export type RangePercent = { left: number; width: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * Posición del tramo de tesitura sobre la pauta `min`–`max` (por defecto C2–C6), en %.
 * Las notas fuera de la pauta se recortan a sus bordes.
 */
export function rangeToPercent(
  low: string,
  high: string,
  min = "C2",
  max = "C6",
): RangePercent | null {
  const lo = noteToMidi(low);
  const hi = noteToMidi(high);
  const start = noteToMidi(min);
  const end = noteToMidi(max);
  if (lo === null || hi === null || start === null || end === null) return null;
  if (end <= start || hi < lo) return null;
  const total = end - start;
  const left = clamp(((lo - start) / total) * 100, 0, 100);
  const right = clamp(((hi - start) / total) * 100, 0, 100);
  return { left, width: right - left };
}

const STATUS_LABELS: Record<PieceStatus, string> = {
  por_aprender: "Por aprender",
  en_estudio: "En estudio",
  listo: "Listo para escenario",
};

export function statusLabel(status: PieceStatus): string {
  return STATUS_LABELS[status];
}

const STATUS_SHORT_LABELS: Record<PieceStatus, string> = {
  por_aprender: "Por aprender",
  en_estudio: "En estudio",
  listo: "Listo",
};

/** Etiqueta corta del estado, para insignias y controles segmentados. */
export function statusShortLabel(status: PieceStatus): string {
  return STATUS_SHORT_LABELS[status];
}

/** Notas de la pauta de la regla de tesitura: cada Do de C2 a C6. */
export const RULER_MARKS = ["C2", "C3", "C4", "C5", "C6"] as const;

/** Texto accesible de una tesitura: "Tesitura D3 a G4" o `null` si falta o no es válida. */
export function tesituraLabel(low: string | null, high: string | null): string | null {
  if (!low || !high || !rangeToPercent(low, high)) return null;
  return `Tesitura ${low} a ${high}`;
}
