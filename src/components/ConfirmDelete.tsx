"use client";

import { useActionState, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Loader2, Trash2 } from "lucide-react";
import type { ActionState } from "@/lib/types";

type ConfirmDeleteProps = {
  action: (state: ActionState) => Promise<ActionState>;
  /** Texto del primer botón ("Borrar pieza"). En modo compacto es su nombre accesible. */
  triggerLabel: string;
  /** Pregunta de confirmación: qué se borra y qué consecuencias tiene. */
  prompt: string;
  confirmLabel: string;
  pendingLabel: string;
  /** Botón inicial solo con icono (filas de ensayo). */
  compact?: boolean;
};

/** Acción destructiva en dos pasos dentro de la propia interfaz (sin window.confirm ni modal). */
export function ConfirmDelete({
  action,
  triggerLabel,
  prompt,
  confirmLabel,
  pendingLabel,
  compact = false,
}: ConfirmDeleteProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [confirming, setConfirming] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  // Mueve el foco al abrir (a "Cancelar", la opción segura) y lo devuelve al cerrar.
  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
    else if (wasConfirming.current) triggerRef.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && !pending) setConfirming(false);
  }

  if (!confirming) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={compact ? triggerLabel : undefined}
        className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-ui text-danger transition-colors hover:bg-danger/10 ${
          compact ? "w-11" : "border border-danger/50 px-4 text-body font-medium"
        }`}
      >
        <Trash2 aria-hidden size={18} strokeWidth={1.75} />
        {compact ? null : triggerLabel}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={triggerLabel}
      onKeyDown={handleKeyDown}
      className="flex w-full flex-col gap-3 rounded-ui border border-danger/50 bg-danger/10 p-3"
    >
      <p className="text-small text-fg">{prompt}</p>
      <form action={formAction} className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-ui bg-danger px-4 text-body font-semibold text-brass-ink transition-colors hover:bg-danger/90 disabled:cursor-wait disabled:opacity-75"
        >
          {pending ? (
            <Loader2 aria-hidden size={18} strokeWidth={1.75} className="animate-spin" />
          ) : (
            <Trash2 aria-hidden size={18} strokeWidth={1.75} />
          )}
          {pending ? pendingLabel : confirmLabel}
        </button>
        <button
          ref={cancelRef}
          type="button"
          disabled={pending}
          onClick={() => setConfirming(false)}
          className="inline-flex h-11 items-center justify-center rounded-ui border border-line px-4 text-body font-medium text-fg transition-colors hover:border-fg-muted hover:bg-surface disabled:opacity-75"
        >
          Cancelar
        </button>
      </form>
      {state.error ? (
        <p role="alert" className="text-small text-danger">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
