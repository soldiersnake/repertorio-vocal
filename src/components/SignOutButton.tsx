"use client";

import { useActionState } from "react";
import { Loader2, LogOut } from "lucide-react";
import type { AuthFormState } from "@/lib/types";

type SignOutButtonProps = {
  action: () => Promise<AuthFormState>;
};

export function SignOutButton({ action }: SignOutButtonProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center gap-2 rounded-ui border border-line px-3 text-small font-medium text-fg transition-colors hover:border-fg-muted hover:bg-surface disabled:cursor-wait disabled:opacity-75"
      >
        {pending ? (
          <Loader2 aria-hidden size={18} strokeWidth={1.75} className="animate-spin" />
        ) : (
          <LogOut aria-hidden size={18} strokeWidth={1.75} />
        )}
        {pending ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
      {state.error ? (
        <p role="alert" className="text-caption text-danger">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
