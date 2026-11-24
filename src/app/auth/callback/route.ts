import { NextResponse, type NextRequest } from "next/server";
import { HOME_PATH, LOGIN_PATH } from "@/lib/auth-routes";
import { createClient } from "@/lib/supabase/server";

/** Destino del enlace de confirmación de correo: canjea el código por una sesión. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const target = request.nextUrl.clone();
  target.search = "";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      target.pathname = HOME_PATH;
      return NextResponse.redirect(target);
    }
  }

  target.pathname = LOGIN_PATH;
  target.searchParams.set("confirmacion", "fallida");
  return NextResponse.redirect(target);
}
