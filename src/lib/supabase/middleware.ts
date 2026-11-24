import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authRedirect } from "../auth-routes";
import { getSupabaseEnv } from "./env";

/** Refresca la sesión de Supabase y aplica las redirecciones de autenticación. */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  const { url, key } = getSupabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser valida el token contra Supabase y, de paso, lo refresca si ha caducado.
  const { data, error } = await supabase.auth.getUser();
  const hasUser = !error && data.user !== null;

  const target = authRedirect(request.nextUrl.pathname, hasUser);
  if (!target) return response;

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = target;
  redirectUrl.search = "";
  const redirect = NextResponse.redirect(redirectUrl);
  // Conserva las cookies de sesión recién refrescadas.
  for (const cookie of response.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}
