import { describe, expect, it } from "vitest";
import { formatDateEs, isNotFutureDate, latestTodayIso, monthStartIso, toIsoDate } from "./dates";

describe("toIsoDate", () => {
  it("devuelve la fecha UTC como YYYY-MM-DD", () => {
    expect(toIsoDate(new Date("2026-03-05T23:30:00Z"))).toBe("2026-03-05");
  });
});

describe("latestTodayIso", () => {
  it("ya es el día siguiente en UTC+14 a partir de las 10:00 UTC", () => {
    expect(latestTodayIso(new Date("2026-11-24T09:59:00Z"))).toBe("2026-11-24");
    expect(latestTodayIso(new Date("2026-11-24T10:00:00Z"))).toBe("2026-11-25");
  });
});

describe("isNotFutureDate", () => {
  const now = new Date("2026-11-24T08:00:00Z");

  it("acepta hoy y días anteriores", () => {
    expect(isNotFutureDate("2026-11-24", now)).toBe(true);
    expect(isNotFutureDate("2025-01-01", now)).toBe(true);
  });

  it("rechaza días futuros", () => {
    expect(isNotFutureDate("2026-11-25", now)).toBe(false);
  });

  it("acepta el día de quien va por delante de UTC (p. ej. Valencia a medianoche)", () => {
    // 23:30 UTC = 00:30 del día siguiente en Valencia (UTC+1).
    expect(isNotFutureDate("2026-11-25", new Date("2026-11-24T23:30:00Z"))).toBe(true);
  });
});

describe("monthStartIso", () => {
  it("devuelve el día 1 del mes (UTC)", () => {
    expect(monthStartIso(new Date("2026-11-24T10:00:00Z"))).toBe("2026-11-01");
    expect(monthStartIso(new Date("2026-01-01T00:00:00Z"))).toBe("2026-01-01");
  });
});

describe("formatDateEs", () => {
  it("formatea en español sin puntos de abreviatura", () => {
    expect(formatDateEs("2026-11-24")).toBe("24 nov 2026");
    expect(formatDateEs("2026-01-05")).toBe("5 ene 2026");
  });

  it("no depende del huso horario del servidor", () => {
    expect(formatDateEs("2026-03-01")).toBe("1 mar 2026");
  });

  it("devuelve la entrada si no es una fecha ISO", () => {
    expect(formatDateEs("ayer")).toBe("ayer");
    expect(formatDateEs("2026-13-45")).toBe("2026-13-45");
  });
});
