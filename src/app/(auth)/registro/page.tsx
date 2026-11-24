import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { signUp } from "../actions";

export const metadata: Metadata = { title: "Crear cuenta · Repertorio Vocal" };

export default function SignupPage() {
  return (
    <section aria-labelledby="signup-title" className="flex flex-col gap-5">
      <h2 id="signup-title" className="text-title font-semibold text-fg">
        Crear cuenta
      </h2>
      <AuthForm mode="registro" action={signUp} />
    </section>
  );
}
