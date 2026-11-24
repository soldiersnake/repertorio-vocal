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
