import { describe, expect, it } from "vitest";
import { isNotFutureDate, latestTodayIso, toIsoDate } from "./dates";

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
