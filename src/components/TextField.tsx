import type { InputHTMLAttributes, Ref } from "react";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name"> & {
  id: string;
  name: string;
  ref?: Ref<HTMLInputElement>;
  label: string;
  hint?: string;
  error?: string;
};

/** Campo de texto con etiqueta, ayuda y error enlazados por `aria-describedby`. */
export function TextField({ id, name, ref, label, hint, error, className, ...inputProps }: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-small font-medium text-fg">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-11 w-full rounded-ui border bg-surface-2 px-3 text-body text-fg transition-colors placeholder:text-fg-muted hover:border-fg-muted ${
          error ? "border-danger" : "border-line"
        } ${className ?? ""}`}
        {...inputProps}
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
