import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { signIn } from "../actions";

export const metadata: Metadata = { title: "Iniciar sesión · Repertorio Vocal" };

type LoginPageProps = {
  searchParams: Promise<{ confirmacion?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { confirmacion } = await searchParams;

  return (
    <section aria-labelledby="login-title" className="flex flex-col gap-5">
      <h2 id="login-title" className="text-title font-semibold text-fg">
        Iniciar sesión
      </h2>
      {confirmacion === "fallida" ? (
        <p role="alert" className="text-small text-danger">
          No se pudo confirmar tu correo: el enlace puede haber caducado. Inicia sesión o vuelve a
          registrarte para recibir uno nuevo.
        </p>
      ) : null}
      <AuthForm mode="login" action={signIn} />
      <p className="border-t border-line pt-4 text-caption text-fg-muted">
        Cuenta de prueba: <span className="text-fg">demo@repertorio.app</span>
      </p>
    </section>
  );
}
