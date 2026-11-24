import { z } from "zod";
import { compareNotes, NOTE_PATTERN } from "./music";
import { isNotFutureDate } from "./dates";
import { PIECE_FIELDS, PIECE_STATUSES, type PieceFormValues } from "./types";

/** Convierte los vacíos de un formulario ("", "   ", null) en `null` y recorta espacios. */
function blankToNull(value: unknown): unknown {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Igual que `blankToNull` pero deja `undefined` para que actúe el valor por defecto. */
function blankToUndefined(value: unknown): unknown {
  const result = blankToNull(value);
  return result === null ? undefined : result;
}

/** Acepta "c4" o " Bb3 " y lo deja como "C4" / "Bb3". */
function normalizeNote(value: unknown): unknown {
  const result = blankToNull(value);
  if (typeof result !== "string") return result;
  return result.charAt(0).toUpperCase() + result.slice(1);
}

const requiredText = (max: number, emptyMessage: string, longMessage: string) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z
      .string({ error: emptyMessage })
      .min(1, { error: emptyMessage })
      .max(max, { error: longMessage }),
  );

const optionalText = (max: number, longMessage: string) =>
  z.preprocess(blankToNull, z.string().max(max, { error: longMessage }).nullable());

const noteField = (label: string) =>
  z.preprocess(
    normalizeNote,
    z
      .string()
      .regex(NOTE_PATTERN, {
        error: `Escribe la nota ${label} como letra, alteración opcional y octava (p. ej. D3, F#4 o Bb2).`,
      })
      .nullable(),
  );

export const emailField = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
  z.email({ error: "Escribe un correo válido, por ejemplo nombre@dominio.com." }),
);

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string({ error: "Escribe tu contraseña." })
    .min(1, { error: "Escribe tu contraseña." }),
});

export const signupSchema = z.object({
  email: emailField,
  password: z
    .string({ error: "Elige una contraseña de al menos 8 caracteres." })
    .min(8, { error: "La contraseña debe tener al menos 8 caracteres." })
    .max(72, { error: "La contraseña puede tener como máximo 72 caracteres." }),
});

export const pieceSchema = z
  .object({
    title: requiredText(
      160,
      "Escribe el título de la pieza.",
      "Acorta el título a 160 caracteres como máximo.",
    ),
    composer: requiredText(
      120,
      "Escribe el compositor.",
      "Acorta el compositor a 120 caracteres como máximo.",
    ),
    work: optionalText(160, "Acorta la obra a 160 caracteres como máximo."),
    role: optionalText(80, "Acorta el rol a 80 caracteres como máximo."),
    language: optionalText(40, "Acorta el idioma a 40 caracteres como máximo."),
    key: optionalText(20, "Acorta la tonalidad a 20 caracteres como máximo."),
    range_low: noteField("grave"),
    range_high: noteField("aguda"),
    status: z.preprocess(
      blankToUndefined,
      z
        .enum(PIECE_STATUSES, {
          error: "Elige un estado: por aprender, en estudio o listo para escenario.",
        })
        .default("por_aprender"),
    ),
    difficulty: z.preprocess(
      blankToUndefined,
      z.coerce
        .number({ error: "Indica la dificultad con un número del 1 al 5." })
        .int({ error: "Indica la dificultad con un número entero del 1 al 5." })
        .min(1, { error: "La dificultad va del 1 al 5." })
        .max(5, { error: "La dificultad va del 1 al 5." })
        .default(3),
    ),
    notes: optionalText(2000, "Acorta las notas a 2000 caracteres como máximo."),
  })
  .refine(
    (piece) => {
      if (!piece.range_low || !piece.range_high) return true;
      const diff = compareNotes(piece.range_low, piece.range_high);
      // Si alguna nota no es válida, el error de formato ya lo emite noteField.
      if (diff === null) return true;
      return diff <= 0;
    },
    {
      path: ["range_high"],
      error: "La nota aguda debe ser igual o más alta que la grave (p. ej. D3–G4).",
    },
  );

export const rehearsalSchema = z.object({
  piece_id: z.uuid({ error: "La pieza no es válida. Vuelve a abrirla desde el repertorio." }),
  practiced_on: z
    .iso.date({ error: "Escribe la fecha del ensayo con el formato AAAA-MM-DD." })
    .refine((value) => isNotFutureDate(value), {
      error: "La fecha del ensayo no puede ser futura. Elige hoy o un día anterior.",
    }),
  minutes: z.coerce
    .number({ error: "Escribe los minutos con un número." })
    .int({ error: "Escribe los minutos como número entero." })
    .min(1, { error: "Escribe entre 1 y 600 minutos." })
    .max(600, { error: "Escribe entre 1 y 600 minutos." }),
  note: optionalText(500, "Acorta la nota a 500 caracteres como máximo."),
});

/** Identificador de una fila (pieza o ensayo). */
export const idSchema = z.uuid({
  error: "El elemento no es válido. Vuelve a abrirlo desde el repertorio.",
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type PieceInput = z.infer<typeof pieceSchema>;
export type RehearsalInput = z.infer<typeof rehearsalSchema>;

/** Lee del FormData los campos de pieza como texto, para devolverlos al formulario. */
export function readPieceValues(formData: FormData): PieceFormValues {
  const values: PieceFormValues = {};
  for (const field of PIECE_FIELDS) {
    const value = formData.get(field);
    if (typeof value === "string") values[field] = value;
  }
  return values;
}

/** Primer mensaje de error de cada campo, listo para mostrar bajo el campo. */
export function firstFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in result)) {
      result[field] = issue.message;
    }
  }
  return result;
}
