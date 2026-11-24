"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { ChoiceGroup } from "./ChoiceGroup";
import { TextAreaField } from "./TextAreaField";
import { TextField } from "./TextField";
import { statusLabel } from "@/lib/music";
import {
  PIECE_FIELDS,
  PIECE_STATUSES,
  type Piece,
  type PieceField,
  type PieceFormState,
  type PieceFormValues,
} from "@/lib/types";
import { firstFieldErrors, pieceSchema, readPieceValues } from "@/lib/validation";

type PieceFormProps = {
  action: (state: PieceFormState, formData: FormData) => Promise<PieceFormState>;
  /** Pieza a editar; sin ella el formulario crea una nueva. */
  piece?: Piece;
  cancelHref: string;
};

type FieldErrors = Partial<Record<PieceField, string>>;

const NOTE_HINT = "Notación anglosajona: C4 = Do central.";

const STATUS_OPTIONS = PIECE_STATUSES.map((status) => ({ value: status, label: statusLabel(status) }));
const DIFFICULTY_OPTIONS = ["1", "2", "3", "4", "5"].map((value) => ({ value, label: value }));

function initialValues(piece?: Piece): PieceFormValues {
  if (!piece) return { status: "por_aprender", difficulty: "3" };
  return {
    title: piece.title,
    composer: piece.composer,
    work: piece.work ?? "",
    role: piece.role ?? "",
    language: piece.language ?? "",
    key: piece.key ?? "",
    range_low: piece.range_low ?? "",
    range_high: piece.range_high ?? "",
    status: piece.status,
    difficulty: String(piece.difficulty),
    notes: piece.notes ?? "",
  };
}

/** Formulario de pieza (crear y editar) con validación en cliente y en servidor. */
export function PieceForm({ action, piece, cancelHref }: PieceFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);
  const values = state.values ?? initialValues(piece);
  const errors: FieldErrors = clientErrors ?? state.fieldErrors ?? {};

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const parsed = pieceSchema.safeParse(readPieceValues(new FormData(form)));
    if (parsed.success) {
      setClientErrors(null);
      return;
    }
    event.preventDefault();
    const found: FieldErrors = firstFieldErrors(parsed.error);
    setClientErrors(found);
    const firstInvalid = PIECE_FIELDS.find((field) => found[field]);
    if (firstInvalid) form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
  }

  const field = (name: PieceField) => ({
    id: `piece-${name}`,
    name,
    defaultValue: values[name] ?? "",
    error: errors[name],
  });

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <p className="text-small text-fg-muted">
        Los campos con <span className="text-brass">*</span> son obligatorios.
      </p>

      <TextField {...field("title")} label="Título" required requiredMark maxLength={160} />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          {...field("composer")}
          label="Compositor"
          required
          requiredMark
          maxLength={120}
          autoComplete="off"
        />
        <TextField {...field("work")} label="Obra" maxLength={160} hint="Ópera, ciclo u oratorio." />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <TextField {...field("role")} label="Rol" maxLength={80} />
        <TextField {...field("language")} label="Idioma" maxLength={40} />
        <TextField {...field("key")} label="Tonalidad" maxLength={20} placeholder="p. ej. Fa mayor" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          {...field("range_low")}
          label="Nota grave"
          placeholder="p. ej. D3"
          hint={NOTE_HINT}
          maxLength={3}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
        />
        <TextField
          {...field("range_high")}
          label="Nota aguda"
          placeholder="p. ej. G4"
          hint={NOTE_HINT}
          maxLength={3}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
        />
      </div>

      <ChoiceGroup
        id="piece-status"
        name="status"
        legend="Estado"
        options={STATUS_OPTIONS}
        defaultValue={values.status}
        error={errors.status}
      />

      <ChoiceGroup
        id="piece-difficulty"
        name="difficulty"
        legend="Dificultad"
        options={DIFFICULTY_OPTIONS}
        defaultValue={values.difficulty}
        hint="1 = asequible, 5 = muy exigente."
        error={errors.difficulty}
        numeric
      />

      <TextAreaField
        {...field("notes")}
        label="Notas"
        maxLength={2000}
        rows={4}
        hint="Respiraciones, cortes, indicaciones de tu maestro…"
      />

      {state.error && !clientErrors ? (
        <p role="alert" className="text-small text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <Link
          href={cancelHref}
          className="inline-flex h-11 items-center justify-center rounded-ui px-4 text-body font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-ui bg-brass px-5 text-body font-semibold text-brass-ink transition-colors hover:bg-brass/90 disabled:cursor-wait disabled:opacity-75 sm:order-first"
        >
          {pending ? <Loader2 aria-hidden size={18} strokeWidth={1.75} className="animate-spin" /> : null}
          {pending ? "Guardando pieza…" : "Guardar pieza"}
        </button>
      </div>
    </form>
  );
}
