/** Traduce el código de error de Supabase Auth a un mensaje legible en español. */
export function authErrorMessage(code: string | undefined): string {
  switch (code) {
    case "invalid_credentials":
      return "El correo o la contraseña no coinciden. Revísalos e inténtalo de nuevo.";
    case "email_not_confirmed":
      return "Aún no has confirmado tu correo. Abre el enlace que te enviamos y vuelve a entrar.";
    case "user_already_exists":
    case "email_exists":
      return "Ya hay una cuenta con ese correo. Inicia sesión o usa otro correo.";
    case "weak_password":
      return "La contraseña es demasiado débil. Usa al menos 8 caracteres combinando letras y números.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Demasiados intentos seguidos. Espera un minuto y vuelve a intentarlo.";
    case "signup_disabled":
      return "El registro de cuentas nuevas está desactivado en este momento.";
    default:
      return "No se pudo completar la operación. Comprueba tu conexión e inténtalo de nuevo.";
  }
}
