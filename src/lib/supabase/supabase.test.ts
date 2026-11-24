// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  createBrowserClient: vi.fn(),
  cookies: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: mocks.createServerClient,
  createBrowserClient: mocks.createBrowserClient,
}));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { createClient as createBrowser } from "./client";
import { getSupabaseEnv } from "./env";
import { updateSession } from "./middleware";
import { requireUser } from "./require-user";
import { createClient as createServer } from "./server";

type CookieAdapter = {
  getAll: () => unknown;
  setAll: (cookies: { name: string; value: string; options: object }[]) => void;
};

const URL = "https://ejemplo.supabase.co";
const KEY = "sb_publishable_prueba";

function fakeSupabase(user: { id: string; email: string } | null, withError = false) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: withError ? { message: "fallo" } : null,
      }),
    },
  };
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", URL);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", KEY);
  mocks.createServerClient.mockReset();
  mocks.createBrowserClient.mockReset();
  mocks.cookies.mockReset();
  mocks.redirect.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getSupabaseEnv", () => {
  it("lee la URL y la clave publicable", () => {
    expect(getSupabaseEnv()).toEqual({ url: URL, key: KEY });
  });

  it("falla con un mensaje claro si faltan", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(() => getSupabaseEnv()).toThrow(/\.env\.local/);
  });
});

describe("createClient (navegador)", () => {
  it("usa createBrowserClient con las variables públicas", () => {
    mocks.createBrowserClient.mockReturnValue("cliente");
    expect(createBrowser()).toBe("cliente");
    expect(mocks.createBrowserClient).toHaveBeenCalledWith(URL, KEY);
  });
});

describe("createClient (servidor)", () => {
  it("conecta las cookies de next/headers", async () => {
    const store = { getAll: vi.fn(() => [{ name: "a", value: "1" }]), set: vi.fn() };
    mocks.cookies.mockResolvedValue(store);
    mocks.createServerClient.mockReturnValue("cliente");

    expect(await createServer()).toBe("cliente");
    const [url, key, options] = mocks.createServerClient.mock.calls[0] as [
      string,
      string,
      { cookies: CookieAdapter },
    ];
    expect([url, key]).toEqual([URL, KEY]);
    expect(options.cookies.getAll()).toEqual([{ name: "a", value: "1" }]);
    options.cookies.setAll([{ name: "b", value: "2", options: { path: "/" } }]);
    expect(store.set).toHaveBeenCalledWith("b", "2", { path: "/" });
  });

  it("ignora la escritura de cookies desde un Server Component", async () => {
    const store = {
      getAll: vi.fn(() => []),
      set: vi.fn(() => {
        throw new Error("solo lectura");
      }),
    };
    mocks.cookies.mockResolvedValue(store);
    mocks.createServerClient.mockReturnValue("cliente");
    await createServer();
    const options = mocks.createServerClient.mock.calls[0][2] as { cookies: CookieAdapter };
    expect(() => options.cookies.setAll([{ name: "b", value: "2", options: {} }])).not.toThrow();
  });
});

describe("requireUser", () => {
  it("devuelve el usuario con sesión", async () => {
    const user = { id: "u1", email: "demo@repertorio.app" };
    mocks.cookies.mockResolvedValue({ getAll: () => [], set: vi.fn() });
    mocks.createServerClient.mockReturnValue(fakeSupabase(user));
    await expect(requireUser()).resolves.toEqual(user);
  });

  it("redirige a /login sin sesión o si Supabase falla", async () => {
    mocks.cookies.mockResolvedValue({ getAll: () => [], set: vi.fn() });
    mocks.createServerClient.mockReturnValue(fakeSupabase(null));
    await expect(requireUser()).rejects.toThrow("REDIRECT:/login");

    mocks.createServerClient.mockReturnValue(fakeSupabase({ id: "u", email: "x" }, true));
    await expect(requireUser()).rejects.toThrow("REDIRECT:/login");
  });
});

describe("updateSession", () => {
  const request = (path: string) => new NextRequest(new globalThis.URL(path, "http://localhost:3000"));

  it("sin sesión, /repertorio redirige a /login", async () => {
    mocks.createServerClient.mockReturnValue(fakeSupabase(null));
    const response = await updateSession(request("/repertorio?q=x"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("con sesión, /login redirige a /repertorio", async () => {
    mocks.createServerClient.mockReturnValue(fakeSupabase({ id: "u1", email: "a@b.es" }));
    const response = await updateSession(request("/login"));
    expect(response.headers.get("location")).toBe("http://localhost:3000/repertorio");
  });

  it("con sesión, deja pasar a /repertorio", async () => {
    mocks.createServerClient.mockReturnValue(fakeSupabase({ id: "u1", email: "a@b.es" }));
    const response = await updateSession(request("/repertorio"));
    expect(response.headers.get("location")).toBeNull();
  });

  it("trata un error de Supabase como sesión ausente", async () => {
    mocks.createServerClient.mockReturnValue(fakeSupabase({ id: "u1", email: "a@b.es" }, true));
    const response = await updateSession(request("/repertorio"));
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("propaga las cookies refrescadas, también en la redirección", async () => {
    mocks.createServerClient.mockImplementation(
      (_url: string, _key: string, options: { cookies: CookieAdapter }) => ({
        auth: {
          getUser: vi.fn(async () => {
            options.cookies.setAll([{ name: "sb-token", value: "nuevo", options: { path: "/" } }]);
            return { data: { user: { id: "u1" } }, error: null };
          }),
        },
      }),
    );
    const passThrough = await updateSession(request("/repertorio"));
    expect(passThrough.cookies.get("sb-token")?.value).toBe("nuevo");

    const redirected = await updateSession(request("/login"));
    expect(redirected.cookies.get("sb-token")?.value).toBe("nuevo");
  });
});
