import { describe, expect, it } from "vitest";
import { authErrorMessage } from "./auth-errors";

describe("authErrorMessage", () => {
  it("explica credenciales incorrectas", () => {
    expect(authErrorMessage("invalid_credentials")).toMatch(/correo o la contraseña/);
  });

  it("pide confirmar el correo", () => {
    expect(authErrorMessage("email_not_confirmed")).toMatch(/confirmado tu correo/);
  });

  it("avisa de cuentas existentes con ambos códigos", () => {
    expect(authErrorMessage("user_already_exists")).toMatch(/Ya hay una cuenta/);
    expect(authErrorMessage("email_exists")).toMatch(/Ya hay una cuenta/);
  });

  it("cubre contraseña débil, límite de intentos y registro desactivado", () => {
    expect(authErrorMessage("weak_password")).toMatch(/débil/);
    expect(authErrorMessage("over_request_rate_limit")).toMatch(/Espera un minuto/);
    expect(authErrorMessage("over_email_send_rate_limit")).toMatch(/Espera un minuto/);
    expect(authErrorMessage("signup_disabled")).toMatch(/desactivado/);
  });

  it("nunca devuelve el código crudo", () => {
    const message = authErrorMessage("unexpected_failure");
    expect(message).not.toContain("unexpected_failure");
    expect(message).toMatch(/inténtalo de nuevo/);
    expect(authErrorMessage(undefined)).toBe(message);
  });
});
