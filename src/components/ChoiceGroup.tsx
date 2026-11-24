type Choice = { value: string; label: string };

type ChoiceGroupProps = {
  id: string;
  name: string;
  legend: string;
  options: readonly Choice[];
  defaultValue?: string;
  hint?: string;
  error?: string;
  /** Usa cifras en mono (p. ej. dificultad 1–5). */
  numeric?: boolean;
};

/** Grupo de opciones exclusivas como control segmentado (radios nativos: teclado con flechas). */
export function ChoiceGroup({
  id,
  name,
  legend,
  options,
  defaultValue,
  hint,
  error,
  numeric = false,
}: ChoiceGroupProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset id={id} aria-describedby={describedBy} className="flex min-w-0 flex-col gap-1.5">
      <legend className="mb-1.5 text-small font-medium text-fg">{legend}</legend>
      <div
        className={`grid rounded-ui border bg-surface p-0.5 ${error ? "border-danger" : "border-line"}`}
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex min-h-11 cursor-pointer items-center justify-center rounded-[calc(var(--radius)-2px)] px-2 text-center leading-tight text-fg-muted transition-colors hover:text-fg has-[:checked]:bg-surface-2 has-[:checked]:font-medium has-[:checked]:text-fg has-[:checked]:shadow-[inset_0_0_0_1px_var(--brass)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brass ${
              numeric ? "font-mono text-body" : "text-small"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
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
    </fieldset>
  );
}
