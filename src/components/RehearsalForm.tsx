"use client";

import { useActionState, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { TextField } from "./TextField";
import type { RehearsalField, RehearsalFormState } from "@/lib/types";
import { firstFieldErrors, rehearsalSchema } from "@/lib/validation";

type RehearsalFormProps = {
  action: (state: RehearsalFormState, formData: FormData) => Promise<RehearsalFormState>;
  pieceId: string;
  /** Fecha por defecto (`YYYY-MM-DD`). */
  today: string;
  /** Fecha máxima admitida (`YYYY-MM-DD`). */
  maxDate: string;
};

type FieldErrors = Partial<Record<RehearsalField, string>>;

const FIELD_ORDER: RehearsalField[] = ["practiced_on", "minutes", "note"];

/** Registrar un ensayo: fecha (hoy por defecto), minutos y nota opcional. */
export function RehearsalForm({ action, pieceId, today, maxDate }: RehearsalFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);
  const errors: FieldErrors = clientErrors ?? state.fieldErrors ?? {};
  const values = state.values ?? {};

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const data = new FormData(form);
    const parsed = rehearsalSchema.safeParse({
      piece_id: data.get("piece_id"),
      practiced_on: data.get("practiced_on"),
      minutes: data.get("minutes"),
      note: data.get("note"),
    });
    if (parsed.success) {
      setClientErrors(null);
      return;
    }
    event.preventDefault();
    const found: FieldErrors = firstFieldErrors(parsed.error);
    setClientErrors(found);
    const firstInvalid = FIELD_ORDER.find((field) => found[field]);
    if (firstInvalid) form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
  }

  return (
    <form
      key={state.savedAt}
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="piece_id" value={pieceId} />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="rehearsal-date"
          name="practiced_on"
          type="date"
          label="Fecha"
          required
          defaultValue={values.practiced_on ?? today}
          max={maxDate}
          error={errors.practiced_on}
          className="font-mono"
        />
        <TextField
          id="rehearsal-minutes"
          name="minutes"
          type="number"
          label="Minutos"
          required
          min={1}
          max={600}
          step={1}
          inputMode="numeric"
          placeholder="p. ej. 30"
          defaultValue={values.minutes ?? ""}
          error={errors.minutes}
          className="font-mono"
        />
      </div>
      <TextField
        id="rehearsal-note"
        name="note"
        label="Nota (opcional)"
        maxLength={500}
        placeholder="Qué trabajaste"
        defaultValue={values.note ?? ""}
        error={errors.note}
      />

      {state.error && !clientErrors ? (
        <p role="alert" className="text-small text-danger">
          {state.error}
        </p>
      ) : null}
      {state.savedAt && !clientErrors ? (
        <p role="status" className="text-small text-st-listo">
          Ensayo registrado.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-ui bg-brass px-4 text-body font-semibold text-brass-ink transition-colors hover:bg-brass/90 disabled:cursor-wait disabled:opacity-75"
      >
        {pending ? <Loader2 aria-hidden size={18} strokeWidth={1.75} className="animate-spin" /> : null}
        {pending ? "Registrando…" : "Registrar ensayo"}
      </button>
    </form>
  );
}
