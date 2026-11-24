import { describe, expect, it } from "vitest";
import { authRedirect, isAuthPage, isPrivatePath } from "./auth-routes";

describe("isPrivatePath", () => {
  it("protege /repertorio y sus subrutas", () => {
    expect(isPrivatePath("/repertorio")).toBe(true);
    expect(isPrivatePath("/repertorio/abc/editar")).toBe(true);
  });

  it("no confunde rutas con el mismo prefijo", () => {
    expect(isPrivatePath("/repertorios")).toBe(false);
    expect(isPrivatePath("/login")).toBe(false);
  });
});

describe("isAuthPage", () => {
  it("reconoce login y registro", () => {
    expect(isAuthPage("/login")).toBe(true);
    expect(isAuthPage("/registro")).toBe(true);
    expect(isAuthPage("/auth/callback")).toBe(false);
  });
});

describe("authRedirect", () => {
  it("envía / al repertorio o al login", () => {
    expect(authRedirect("/", true)).toBe("/repertorio");
    expect(authRedirect("/", false)).toBe("/login");
  });

  it("sin sesión, las rutas privadas van a /login", () => {
    expect(authRedirect("/repertorio", false)).toBe("/login");
    expect(authRedirect("/repertorio/123", false)).toBe("/login");
  });

  it("con sesión, login y registro van al repertorio", () => {
    expect(authRedirect("/login", true)).toBe("/repertorio");
    expect(authRedirect("/registro", true)).toBe("/repertorio");
  });

  it("deja pasar el resto", () => {
    expect(authRedirect("/repertorio", true)).toBeNull();
    expect(authRedirect("/login", false)).toBeNull();
    expect(authRedirect("/auth/callback", false)).toBeNull();
  });
});
