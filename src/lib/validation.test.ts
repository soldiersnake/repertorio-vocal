import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  firstFieldErrors,
  idSchema,
  loginSchema,
  pieceSchema,
  readPieceValues,
  rehearsalSchema,
  signupSchema,
} from "./validation";

function errorsOf(result: { success: boolean; error?: Parameters<typeof firstFieldErrors>[0] }) {
  if (result.success || !result.error) return {};
  return firstFieldErrors(result.error);
}

describe("loginSchema", () => {
  it("acepta credenciales y normaliza el correo", () => {
    const result = loginSchema.safeParse({ email: "  Demo@Repertorio.app ", password: "x" });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("demo@repertorio.app");
  });

  it("explica en español qué falta", () => {
    const errors = errorsOf(loginSchema.safeParse({ email: "no-es-correo", password: "" }));
    expect(errors.email).toMatch(/correo válido/);
    expect(errors.password).toBe("Escribe tu contraseña.");
  });

  it("rechaza campos ausentes (FormData devuelve null)", () => {
    const errors = errorsOf(loginSchema.safeParse({ email: null, password: null }));
    expect(errors.email).toBeDefined();
    expect(errors.password).toBe("Escribe tu contraseña.");
  });
});

describe("signupSchema", () => {
  it("exige al menos 8 caracteres de contraseña", () => {
    const errors = errorsOf(signupSchema.safeParse({ email: "a@b.es", password: "1234567" }));
    expect(errors.password).toBe("La contraseña debe tener al menos 8 caracteres.");
  });

  it("acepta una contraseña de 8 caracteres", () => {
    expect(signupSchema.safeParse({ email: "a@b.es", password: "12345678" }).success).toBe(true);
  });

  it("limita la contraseña a 72 caracteres", () => {
    const result = signupSchema.safeParse({ email: "a@b.es", password: "x".repeat(73) });
    expect(result.success).toBe(false);
  });
});

describe("pieceSchema", () => {
  const base = { title: "Largo al factotum", composer: "Rossini" };

  it("acepta una pieza mínima y aplica valores por defecto", () => {
    const result = pieceSchema.safeParse(base);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      title: "Largo al factotum",
      composer: "Rossini",
      work: null,
      role: null,
      language: null,
      key: null,
      range_low: null,
      range_high: null,
      status: "por_aprender",
      difficulty: 3,
      notes: null,
    });
  });

  it("acepta todos los campos tal como llegan de un formulario", () => {
    const result = pieceSchema.safeParse({
      ...base,
      work: "Il barbiere di Siviglia",
      role: "Figaro",
      language: "Italiano",
      key: "Do mayor",
      range_low: "d3",
      range_high: "G4",
      status: "en_estudio",
      difficulty: "5",
      notes: "  Respirar antes del patter.  ",
    });
    expect(result.success).toBe(true);
    expect(result.data?.range_low).toBe("D3");
    expect(result.data?.difficulty).toBe(5);
    expect(result.data?.notes).toBe("Respirar antes del patter.");
  });

  it("convierte los vacíos en null", () => {
    const result = pieceSchema.safeParse({ ...base, work: "   ", range_low: "", status: "" });
    expect(result.data?.work).toBeNull();
    expect(result.data?.range_low).toBeNull();
    expect(result.data?.status).toBe("por_aprender");
  });

  it("exige título y compositor", () => {
    const errors = errorsOf(pieceSchema.safeParse({ title: "  ", composer: "" }));
    expect(errors.title).toBe("Escribe el título de la pieza.");
    expect(errors.composer).toBe("Escribe el compositor.");
  });

  it("limita la longitud de los textos", () => {
    const errors = errorsOf(
      pieceSchema.safeParse({ ...base, title: "x".repeat(161), notes: "x".repeat(2001) }),
    );
    expect(errors.title).toMatch(/160/);
    expect(errors.notes).toMatch(/2000/);
  });

  it("valida el formato de las notas", () => {
    const errors = errorsOf(pieceSchema.safeParse({ ...base, range_low: "H3", range_high: "C9" }));
    expect(errors.range_low).toMatch(/nota grave/);
    expect(errors.range_high).toMatch(/nota aguda/);
  });

  it("permite solo una de las dos notas", () => {
    expect(pieceSchema.safeParse({ ...base, range_high: "F4" }).success).toBe(true);
  });

  it("rechaza que la nota grave sea más aguda que la aguda", () => {
    const errors = errorsOf(pieceSchema.safeParse({ ...base, range_low: "A4", range_high: "D3" }));
    expect(errors.range_high).toMatch(/igual o más alta/);
  });

  it("acepta la misma nota como grave y aguda, también enarmónica", () => {
    expect(pieceSchema.safeParse({ ...base, range_low: "F#4", range_high: "Gb4" }).success).toBe(
      true,
    );
  });

  it("valida estado y dificultad", () => {
    const errors = errorsOf(pieceSchema.safeParse({ ...base, status: "olvidada", difficulty: 9 }));
    expect(errors.status).toMatch(/Elige un estado/);
    expect(errors.difficulty).toBe("La dificultad va del 1 al 5.");
    const notNumber = errorsOf(pieceSchema.safeParse({ ...base, difficulty: "mucha" }));
    expect(notNumber.difficulty).toMatch(/número/);
  });
});

describe("rehearsalSchema", () => {
  const pieceId = "3f1c2a4e-8b7d-4c1a-9e2f-5a6b7c8d9e0f";

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-24T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("acepta un ensayo de hoy con minutos como texto", () => {
    const result = rehearsalSchema.safeParse({
      piece_id: pieceId,
      practiced_on: "2026-11-24",
      minutes: "45",
      note: "",
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      piece_id: pieceId,
      practiced_on: "2026-11-24",
      minutes: 45,
      note: null,
    });
  });

  it("rechaza fechas futuras", () => {
    const errors = errorsOf(
      rehearsalSchema.safeParse({ piece_id: pieceId, practiced_on: "2026-11-30", minutes: 30 }),
    );
    expect(errors.practiced_on).toMatch(/no puede ser futura/);
  });

  it("rechaza fechas con formato incorrecto", () => {
    const errors = errorsOf(
      rehearsalSchema.safeParse({ piece_id: pieceId, practiced_on: "24/11/2026", minutes: 30 }),
    );
    expect(errors.practiced_on).toMatch(/AAAA-MM-DD/);
  });

  it("exige minutos entre 1 y 600", () => {
    for (const minutes of [0, 601, ""]) {
      const errors = errorsOf(
        rehearsalSchema.safeParse({ piece_id: pieceId, practiced_on: "2026-11-20", minutes }),
      );
      expect(errors.minutes).toBe("Escribe entre 1 y 600 minutos.");
    }
    const decimal = errorsOf(
      rehearsalSchema.safeParse({ piece_id: pieceId, practiced_on: "2026-11-20", minutes: 2.5 }),
    );
    expect(decimal.minutes).toMatch(/entero/);
  });

  it("valida la pieza y la longitud de la nota", () => {
    const errors = errorsOf(
      rehearsalSchema.safeParse({
        piece_id: "no-uuid",
        practiced_on: "2026-11-20",
        minutes: 10,
        note: "x".repeat(501),
      }),
    );
    expect(errors.piece_id).toMatch(/pieza no es válida/);
    expect(errors.note).toMatch(/500/);
  });
});

describe("firstFieldErrors", () => {
  it("se queda con el primer mensaje de cada campo", () => {
    const result = signupSchema.safeParse({ email: "", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = firstFieldErrors(result.error);
      expect(Object.keys(errors).sort()).toEqual(["email", "password"]);
      expect(typeof errors.email).toBe("string");
    }
  });
});

describe("idSchema", () => {
  it("acepta un uuid y rechaza el resto con un mensaje legible", () => {
    expect(idSchema.safeParse("6f1c2a3e-8b4d-4c5e-9f10-123456789abc").success).toBe(true);
    const result = idSchema.safeParse("123");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toMatch(/no es válido/);
  });
});

describe("readPieceValues", () => {
  it("devuelve solo los campos de pieza escritos como texto", () => {
    const formData = new FormData();
    formData.set("title", "Ombra mai fù");
    formData.set("range_low", "D3");
    formData.set("otro", "x");
    expect(readPieceValues(formData)).toEqual({ title: "Ombra mai fù", range_low: "D3" });
  });
});
