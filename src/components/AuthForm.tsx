"use client";

import Link from "next/link";
import { useActionState, useRef, useState, type FormEvent } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { TextField } from "./TextField";
import type { AuthField, AuthFormState } from "@/lib/types";
import { firstFieldErrors, loginSchema, signupSchema } from "@/lib/validation";

type AuthMode = "login" | "registro";

type AuthFormProps = {
  mode: AuthMode;
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
};

const COPY: Record<
  AuthMode,
  { submit: string; pending: string; altText: string; altLink: string; altHref: string }
> = {
  login: {
    submit: "Entrar",
    pending: "Entrando…",
    altText: "¿Aún no tienes cuenta?",
    altLink: "Crear cuenta",
    altHref: "/registro",
  },
  registro: {
    submit: "Crear cuenta",
    pending: "Creando cuenta…",
    altText: "¿Ya tienes cuenta?",
    altLink: "Iniciar sesión",
    altHref: "/login",
  },
};

type FieldErrors = Partial<Record<AuthField, string>>;

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [email, setEmail] = useState("");
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const copy = COPY[mode];
  const schema = mode === "login" ? loginSchema : signupSchema;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const parsed = schema.safeParse({ email: data.get("email"), password: data.get("password") });
    if (parsed.success) {
      setClientErrors(null);
      return;
    }
    event.preventDefault();
    const errors: FieldErrors = firstFieldErrors(parsed.error);
    setClientErrors(errors);
    (errors.email ? emailRef : passwordRef).current?.focus();
  }

  if (state.message) {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-ui border border-line bg-surface p-5">
        <p className="flex items-center gap-2 text-body font-medium text-fg">
          <MailCheck aria-hidden size={20} strokeWidth={1.75} className="shrink-0 text-brass" />
          {state.message}
        </p>
        <p className="text-small text-fg-muted">
          Te enviamos un enlace a <span className="text-fg">{email}</span>. Ábrelo para empezar a
          usar tu repertorio.
        </p>
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center self-start text-small font-medium text-brass underline"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  const errors = clientErrors ?? state.fieldErrors ?? {};

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          ref={emailRef}
          id={`${mode}-email`}
          name="email"
          type="email"
          label="Correo electrónico"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <TextField
          ref={passwordRef}
          id={`${mode}-password`}
          name="password"
          type="password"
          label="Contraseña"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          hint={mode === "registro" ? "Mínimo 8 caracteres." : undefined}
          error={errors.password}
        />

        {state.error && !clientErrors ? (
          <p role="alert" className="text-small text-danger">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-ui bg-brass px-4 text-body font-semibold text-brass-ink transition-colors hover:bg-brass/90 disabled:cursor-wait disabled:opacity-75"
        >
          {pending ? (
            <Loader2 aria-hidden size={18} strokeWidth={1.75} className="animate-spin" />
          ) : null}
          {pending ? copy.pending : copy.submit}
        </button>
      </form>

      <p className="text-small text-fg-muted">
        {copy.altText}{" "}
        <Link
          href={copy.altHref}
          className="inline-flex min-h-11 items-center font-medium text-fg underline hover:text-brass"
        >
          {copy.altLink}
        </Link>
      </p>
    </div>
  );
}
