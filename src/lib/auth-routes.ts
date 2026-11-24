export const LOGIN_PATH = "/login";
export const SIGNUP_PATH = "/registro";
export const HOME_PATH = "/repertorio";

const PRIVATE_PREFIXES = [HOME_PATH];
const AUTH_PAGES = [LOGIN_PATH, SIGNUP_PATH];

function matches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PREFIXES.some((prefix) => matches(pathname, prefix));
}

export function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((page) => matches(pathname, page));
}

/**
 * Decide a dónde redirigir según la ruta y la sesión. `null` si se puede seguir.
 * - `/` → repertorio o login.
 * - Ruta privada sin sesión → login.
 * - Login o registro con sesión → repertorio.
 */
export function authRedirect(pathname: string, hasUser: boolean): string | null {
  if (pathname === "/") return hasUser ? HOME_PATH : LOGIN_PATH;
  if (!hasUser && isPrivatePath(pathname)) return LOGIN_PATH;
  if (hasUser && isAuthPage(pathname)) return HOME_PATH;
  return null;
}
