import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { LOGIN_PATH } from "../auth-routes";
import { createClient } from "./server";

/** Devuelve el usuario con sesión o redirige a /login. Para layouts y páginas privadas. */
export async function requireUser(): Promise<User> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect(LOGIN_PATH);
  return data.user;
}
