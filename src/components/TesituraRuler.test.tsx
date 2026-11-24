import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TesituraRuler } from "./TesituraRuler";

describe("TesituraRuler", () => {
  it("expone la tesitura con una etiqueta accesible", () => {
    render(<TesituraRuler low="D3" high="G4" />);
    expect(screen.getByRole("img", { name: "Tesitura D3 a G4" })).toBeInTheDocument();
  });

  it("etiqueta cada Do de la pauta de C2 a C6", () => {
    render(<TesituraRuler low="D3" high="G4" />);
    for (const mark of ["C2", "C3", "C4", "C5", "C6"]) {
      expect(screen.getByText(mark)).toBeInTheDocument();
    }
  });

  it("coloca el tramo desde la nota grave hasta la aguda", () => {
    render(<TesituraRuler low="C3" high="C5" />);
    const span = screen.getByTestId("tesitura-span");
    expect(span).toHaveClass("tesitura-span");
    expect(span).toHaveStyle({ left: "25%", width: "50%" });
  });

  it("muestra 'Sin tesitura' si falta alguna nota", () => {
    render(<TesituraRuler low="D3" high={null} />);
    expect(screen.getByText("Sin tesitura")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("muestra 'Sin tesitura' si el ámbito no es válido", () => {
    render(<TesituraRuler low="G4" high="D3" size="lg" />);
    expect(screen.getByText("Sin tesitura")).toBeInTheDocument();
  });
});
