import { describe, expect, it } from "vitest";
import {
  filterPieces,
  filtersToSearch,
  minutesThisMonth,
  normalizeForSearch,
  NO_FILTERS,
  parseFilters,
  pieceByline,
  repertoireSummary,
  sumMinutes,
} from "./repertoire";
import type { PieceStatus } from "./types";

const piece = (title: string, composer: string, status: PieceStatus) => ({ title, composer, status });

const PIECES = [
  piece("Largo al factotum", "Rossini", "en_estudio"),
  piece("Ombra mai fù", "Händel", "listo"),
  piece("Di Provenza il mar", "Verdi", "por_aprender"),
  piece("Votre toast", "Bizet", "listo"),
];

describe("parseFilters", () => {
  it("lee estado y búsqueda", () => {
    expect(parseFilters({ estado: "listo", q: "  verdi " })).toEqual({ estado: "listo", q: "verdi" });
  });

  it("ignora estados desconocidos y valores ausentes", () => {
    expect(parseFilters({ estado: "terminado" })).toEqual(NO_FILTERS);
    expect(parseFilters({})).toEqual(NO_FILTERS);
  });

  it("toma el primer valor si el parámetro se repite y limita la longitud", () => {
    expect(parseFilters({ estado: ["en_estudio", "listo"], q: ["a", "b"] })).toEqual({
      estado: "en_estudio",
      q: "a",
    });
    expect(parseFilters({ q: "x".repeat(300) }).q).toHaveLength(100);
  });
});

describe("filtersToSearch", () => {
  it("construye la cadena de la URL", () => {
    expect(filtersToSearch({ estado: "listo", q: "verdi" })).toBe("?estado=listo&q=verdi");
    expect(filtersToSearch({ estado: null, q: "don giovanni" })).toBe("?q=don+giovanni");
  });

  it("sin filtros devuelve una cadena vacía", () => {
    expect(filtersToSearch({ estado: null, q: "   " })).toBe("");
  });
});

describe("normalizeForSearch", () => {
  it("quita tildes y mayúsculas", () => {
    expect(normalizeForSearch("  Händel Fù ")).toBe("handel fu");
  });
});

describe("filterPieces", () => {
  it("sin filtros devuelve todas", () => {
    expect(filterPieces(PIECES, NO_FILTERS)).toHaveLength(4);
  });

  it("filtra por estado", () => {
    expect(filterPieces(PIECES, { estado: "listo", q: "" }).map((p) => p.title)).toEqual([
      "Ombra mai fù",
      "Votre toast",
    ]);
  });

  it("busca por título o compositor sin tildes", () => {
    expect(filterPieces(PIECES, { estado: null, q: "hande" }).map((p) => p.title)).toEqual([
      "Ombra mai fù",
    ]);
    expect(filterPieces(PIECES, { estado: null, q: "PROVENZA" }).map((p) => p.composer)).toEqual([
      "Verdi",
    ]);
  });

  it("combina estado y búsqueda", () => {
    expect(filterPieces(PIECES, { estado: "por_aprender", q: "bizet" })).toEqual([]);
  });
});

describe("sumMinutes", () => {
  it("suma los minutos", () => {
    expect(sumMinutes([{ minutes: 30 }, { minutes: 45 }])).toBe(75);
    expect(sumMinutes([])).toBe(0);
  });
});

describe("minutesThisMonth", () => {
  const now = new Date("2026-11-24T10:00:00Z");

  it("cuenta solo los ensayos del mes en curso", () => {
    const rehearsals = [
      { minutes: 30, practiced_on: "2026-11-01" },
      { minutes: 20, practiced_on: "2026-11-24" },
      { minutes: 99, practiced_on: "2026-10-31" },
      { minutes: 99, practiced_on: "2026-12-01" },
      { minutes: 99, practiced_on: "2025-11-10" },
    ];
    expect(minutesThisMonth(rehearsals, now)).toBe(50);
  });

  it("funciona en diciembre (cambio de año)", () => {
    expect(
      minutesThisMonth([{ minutes: 15, practiced_on: "2026-12-31" }], new Date("2026-12-05T00:00:00Z")),
    ).toBe(15);
  });
});

describe("repertoireSummary", () => {
  it("resume piezas, listas y minutos con plurales", () => {
    expect(repertoireSummary(PIECES, 140)).toBe("4 piezas · 2 listas · 140 min ensayados este mes");
    expect(repertoireSummary([{ status: "listo" }], 0)).toBe(
      "1 pieza · 1 lista · 0 min ensayados este mes",
    );
  });
});

describe("pieceByline", () => {
  it("une compositor, obra y rol omitiendo vacíos", () => {
    expect(pieceByline({ composer: "Rossini", work: "Il barbiere di Siviglia", role: "Figaro" })).toBe(
      "Rossini · Il barbiere di Siviglia · Figaro",
    );
    expect(pieceByline({ composer: "Fauré", work: null, role: null })).toBe("Fauré");
  });
});
