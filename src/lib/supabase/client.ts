import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/** Cliente de Supabase para componentes de navegador. */
export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
