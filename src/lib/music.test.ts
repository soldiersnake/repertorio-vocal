import { describe, expect, it } from "vitest";
import {
  compareNotes,
  isNote,
  midiToNote,
  noteToMidi,
  rangeSpan,
  rangeToPercent,
  RULER_MARKS,
  statusLabel,
  statusShortLabel,
  tesituraLabel,
} from "./music";

describe("isNote", () => {
  it.each(["C4", "F#3", "Bb2", "A0", "G7"])("acepta %s", (note) => {
    expect(isNote(note)).toBe(true);
  });

  it.each(["", "H4", "C8", "c4", "C#", "Cx4", "C##4", "C4 "])("rechaza %j", (note) => {
    expect(isNote(note)).toBe(false);
  });
});

describe("noteToMidi", () => {
  it("C4 es 60 (do central)", () => {
    expect(noteToMidi("C4")).toBe(60);
  });

  it("A4 es 69", () => {
    expect(noteToMidi("A4")).toBe(69);
  });

  it("soporta sostenidos y bemoles", () => {
    expect(noteToMidi("C#4")).toBe(61);
    expect(noteToMidi("Db4")).toBe(61);
    expect(noteToMidi("Bb3")).toBe(58);
  });

  it("los enarmónicos que cruzan octava suenan igual", () => {
    expect(noteToMidi("Cb4")).toBe(noteToMidi("B3"));
    expect(noteToMidi("B#3")).toBe(noteToMidi("C4"));
  });

  it("cubre los extremos de la notación", () => {
    expect(noteToMidi("C0")).toBe(12);
    expect(noteToMidi("B7")).toBe(107);
  });

  it("devuelve null si la nota no es válida", () => {
    expect(noteToMidi("X4")).toBeNull();
    expect(noteToMidi("C9")).toBeNull();
  });
});

describe("midiToNote", () => {
  it("60 es C4", () => {
    expect(midiToNote(60)).toBe("C4");
  });

  it("usa sostenidos para las alteraciones", () => {
    expect(midiToNote(61)).toBe("C#4");
    expect(midiToNote(70)).toBe("A#4");
  });

  it("es inversa de noteToMidi en notas naturales y sostenidos", () => {
    for (const note of ["C2", "D3", "F#4", "G#5", "B7", "C0"]) {
      const midi = noteToMidi(note);
      expect(midi).not.toBeNull();
      expect(midiToNote(midi ?? -1)).toBe(note);
    }
  });

  it("devuelve null fuera de rango o con decimales", () => {
    expect(midiToNote(11)).toBeNull();
    expect(midiToNote(108)).toBeNull();
    expect(midiToNote(60.5)).toBeNull();
  });
});

describe("compareNotes", () => {
  it("es negativo si la primera es más grave", () => {
    expect(compareNotes("D3", "G4")).toBeLessThan(0);
  });

  it("es positivo si la primera es más aguda", () => {
    expect(compareNotes("A5", "A4")).toBe(12);
  });

  it("es 0 entre enarmónicos", () => {
    expect(compareNotes("F#4", "Gb4")).toBe(0);
  });

  it("devuelve null si alguna nota no es válida", () => {
    expect(compareNotes("C4", "nota")).toBeNull();
  });
});

describe("rangeSpan", () => {
  it("cuenta semitonos de grave a aguda", () => {
    expect(rangeSpan("C4", "C5")).toBe(12);
    expect(rangeSpan("D3", "G4")).toBe(17);
  });

  it("es 0 con una sola nota", () => {
    expect(rangeSpan("E4", "E4")).toBe(0);
  });

  it("devuelve null con notas inválidas", () => {
    expect(rangeSpan("C4", "")).toBeNull();
  });
});

describe("rangeToPercent", () => {
  it("coloca el tramo sobre la pauta C2–C6 por defecto", () => {
    expect(rangeToPercent("C2", "C6")).toEqual({ left: 0, width: 100 });
    expect(rangeToPercent("C4", "C5")).toEqual({ left: 50, width: 25 });
  });

  it("calcula tramos parciales", () => {
    const result = rangeToPercent("D3", "G4");
    expect(result?.left).toBeCloseTo((14 / 48) * 100);
    expect(result?.width).toBeCloseTo((17 / 48) * 100);
  });

  it("acepta otra pauta", () => {
    expect(rangeToPercent("C4", "C5", "C3", "C5")).toEqual({ left: 50, width: 50 });
  });

  it("recorta las notas que salen de la pauta", () => {
    expect(rangeToPercent("A1", "E6")).toEqual({ left: 0, width: 100 });
    expect(rangeToPercent("C6", "G6")).toEqual({ left: 100, width: 0 });
  });

  it("devuelve null con notas inválidas, rango invertido o pauta vacía", () => {
    expect(rangeToPercent("Z4", "C5")).toBeNull();
    expect(rangeToPercent("C5", "C4")).toBeNull();
    expect(rangeToPercent("C4", "C5", "C6", "C2")).toBeNull();
  });
});

describe("statusLabel", () => {
  it("traduce cada estado", () => {
    expect(statusLabel("por_aprender")).toBe("Por aprender");
    expect(statusLabel("en_estudio")).toBe("En estudio");
    expect(statusLabel("listo")).toBe("Listo para escenario");
  });
});

describe("statusShortLabel", () => {
  it("da la etiqueta corta de cada estado", () => {
    expect(statusShortLabel("por_aprender")).toBe("Por aprender");
    expect(statusShortLabel("en_estudio")).toBe("En estudio");
    expect(statusShortLabel("listo")).toBe("Listo");
  });
});

describe("RULER_MARKS", () => {
  it("marca cada Do de C2 a C6", () => {
    expect(RULER_MARKS).toEqual(["C2", "C3", "C4", "C5", "C6"]);
  });
});

describe("tesituraLabel", () => {
  it("describe la tesitura", () => {
    expect(tesituraLabel("D3", "G4")).toBe("Tesitura D3 a G4");
  });

  it("devuelve null si falta una nota o el ámbito no es válido", () => {
    expect(tesituraLabel(null, "G4")).toBeNull();
    expect(tesituraLabel("D3", null)).toBeNull();
    expect(tesituraLabel("G4", "D3")).toBeNull();
    expect(tesituraLabel("H3", "G4")).toBeNull();
  });
});
