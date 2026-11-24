"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authErrorMessage } from "@/lib/auth-errors";
import { HOME_PATH, LOGIN_PATH } from "@/lib/auth-routes";
import { createClient } from "@/lib/supabase/server";
import type { AuthFormState } from "@/lib/types";
import { firstFieldErrors, loginSchema, signupSchema } from "@/lib/validation";

const NETWORK_ERROR =
  "No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.";

function readCredentials(formData: FormData) {
  return { email: formData.get("email"), password: formData.get("password") };
}

function typedEmail(formData: FormData): string {
  const email = formData.get("email");
  return typeof email === "string" ? email : "";
}

async function requestOrigin(): Promise<string> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  return `${protocol}://${host}`;
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = typedEmail(formData);
  const parsed = loginSchema.safeParse(readCredentials(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error), email };
  }

  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return { error: authErrorMessage(error.code), email };
  } catch {
    return { error: NETWORK_ERROR, email };
  }

  revalidatePath("/", "layout");
  redirect(HOME_PATH);
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = typedEmail(formData);
  const parsed = signupSchema.safeParse(readCredentials(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error), email };
  }

  const supabase = await createClient();
  let hasSession = false;
  try {
    const { data, error } = await supabase.auth.signUp({
      ...parsed.data,
      options: { emailRedirectTo: `${await requestOrigin()}/auth/callback` },
    });
    if (error) return { error: authErrorMessage(error.code), email };
    hasSession = data.session !== null;
  } catch {
    return { error: NETWORK_ERROR, email };
  }

  if (hasSession) {
    revalidatePath("/", "layout");
    redirect(HOME_PATH);
  }
  return { message: "Revisa tu correo para confirmar la cuenta.", email: parsed.data.email };
}

export async function signOut(): Promise<AuthFormState> {
  const supabase = await createClient();
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) redirect(LOGIN_PATH);

  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { error: "No se pudo cerrar la sesión. Inténtalo de nuevo." };
  } catch {
    return { error: NETWORK_ERROR };
  }

  revalidatePath("/", "layout");
  redirect(LOGIN_PATH);
}
