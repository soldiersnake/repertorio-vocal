"use client";

import { RotateCcw } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import { HOME_PATH } from "@/lib/auth-routes";

type PiezaErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PiezaError({ reset }: PiezaErrorProps) {
  return (
    <div className="flex flex-col items-start gap-4">
      <BackLink href={HOME_PATH}>Repertorio</BackLink>
      <div role="alert" className="flex flex-col gap-1">
        <h1 className="font-display text-display text-fg">No se pudo cargar la pieza</h1>
        <p className="text-small text-fg-muted">
          Puede ser un fallo de conexión. Vuelve a intentarlo en unos segundos.
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-11 items-center gap-2 rounded-ui bg-brass px-4 text-body font-semibold text-brass-ink transition-colors hover:bg-brass/90"
      >
        <RotateCcw aria-hidden size={18} strokeWidth={1.75} />
        Reintentar
      </button>
    </div>
  );
}
