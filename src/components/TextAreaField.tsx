import type { TextareaHTMLAttributes } from "react";

type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "name"> & {
  id: string;
  name: string;
  label: string;
  hint?: string;
  error?: string;
};

/** Área de texto con etiqueta, ayuda y error enlazados por `aria-describedby`. */
export function TextAreaField({ id, name, label, hint, error, className, ...props }: TextAreaFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-small font-medium text-fg">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`min-h-28 w-full resize-y rounded-ui border bg-surface-2 px-3 py-2.5 text-body text-fg transition-colors placeholder:text-fg-muted hover:border-fg-muted ${
          error ? "border-danger" : "border-line"
        } ${className ?? ""}`}
        {...props}
      />
      {hint ? (
        <p id={hintId} className="text-caption text-fg-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-caption text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
