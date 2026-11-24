/** Tipos de las filas de la BD (supabase/migrations/0001_init.sql) y estados compartidos. */

export const PIECE_STATUSES = ["por_aprender", "en_estudio", "listo"] as const;

export type PieceStatus = (typeof PIECE_STATUSES)[number];

export type Piece = {
  id: string;
  user_id: string;
  title: string;
  composer: string;
  work: string | null;
  role: string | null;
  language: string | null;
  key: string | null;
  range_low: string | null;
  range_high: string | null;
  status: PieceStatus;
  difficulty: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Rehearsal = {
  id: string;
  user_id: string;
  piece_id: string;
  /** Fecha ISO `YYYY-MM-DD`. */
  practiced_on: string;
  minutes: number;
  note: string | null;
  created_at: string;
};

export type AuthField = "email" | "password";

/** Estado que devuelven las Server Actions de autenticación al formulario. */
export type AuthFormState = {
  error?: string;
  fieldErrors?: Partial<Record<AuthField, string>>;
  message?: string;
  email?: string;
};

/** Campos del formulario de pieza (columnas editables de `pieces`). */
export const PIECE_FIELDS = [
  "title",
  "composer",
  "work",
  "role",
  "language",
  "key",
  "range_low",
  "range_high",
  "status",
  "difficulty",
  "notes",
] as const;

export type PieceField = (typeof PIECE_FIELDS)[number];

/** Valores tal como se escribieron en el formulario, para no perderlos si el servidor rechaza. */
export type PieceFormValues = Partial<Record<PieceField, string>>;

export type PieceFormState = {
  error?: string;
  fieldErrors?: Partial<Record<PieceField, string>>;
  values?: PieceFormValues;
};

export type RehearsalField = "practiced_on" | "minutes" | "note";

export type RehearsalFormState = {
  error?: string;
  fieldErrors?: Partial<Record<RehearsalField, string>>;
  values?: Partial<Record<RehearsalField, string>>;
  /** Cambia en cada ensayo guardado para que el formulario se limpie. */
  savedAt?: number;
};

/** Estado de una acción sin campos (borrar). */
export type ActionState = {
  error?: string;
};
