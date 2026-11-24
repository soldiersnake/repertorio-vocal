import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Piece, PieceFormState } from "@/lib/types";
import { PieceForm } from "./PieceForm";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

type Action = (state: PieceFormState, formData: FormData) => Promise<PieceFormState>;

const PIECE: Piece = {
  id: "6f1c2a3e-8b4d-4c5e-9f10-123456789abc",
  user_id: "u1",
  title: "Largo al factotum",
  composer: "Rossini",
  work: "Il barbiere di Siviglia",
  role: "Figaro",
  language: "Italiano",
  key: "Do mayor",
  range_low: "D3",
  range_high: "G4",
  status: "en_estudio",
  difficulty: 5,
  notes: null,
  created_at: "2026-11-01T00:00:00Z",
  updated_at: "2026-11-01T00:00:00Z",
};

function setup(action: Action, piece?: Piece) {
  const user = userEvent.setup();
  render(<PieceForm action={action} piece={piece} cancelHref="/repertorio" />);
  return { user };
}

describe("PieceForm", () => {
  it("todos los campos tienen etiqueta y el botón nombra la acción", () => {
    setup(vi.fn<Action>());
    for (const label of [
      "Título",
      "Compositor",
      "Obra",
      "Rol",
      "Idioma",
      "Tonalidad",
      "Nota grave",
      "Nota aguda",
      "Notas",
    ]) {
      expect(screen.getByLabelText(new RegExp(`^${label}`))).toBeInTheDocument();
    }
    expect(screen.getByRole("group", { name: "Estado" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Dificultad" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Por aprender" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "3" })).toBeChecked();
    expect(screen.getByLabelText("Nota grave")).toHaveAccessibleDescription(
      "Notación anglosajona: C4 = Do central.",
    );
    expect(screen.getByRole("button", { name: "Guardar pieza" })).toBeEnabled();
  });

  it("rechaza una nota grave más alta que la aguda sin llamar al servidor", async () => {
    const action = vi.fn<Action>();
    const { user } = setup(action);

    await user.type(screen.getByLabelText(/^Título/), "Ombra mai fù");
    await user.type(screen.getByLabelText(/^Compositor/), "Händel");
    await user.type(screen.getByLabelText("Nota grave"), "G4");
    await user.type(screen.getByLabelText("Nota aguda"), "D3");
    await user.click(screen.getByRole("button", { name: "Guardar pieza" }));

    expect(action).not.toHaveBeenCalled();
    const high = screen.getByLabelText("Nota aguda");
    expect(high).toHaveAttribute("aria-invalid", "true");
    expect(high).toHaveAccessibleDescription(
      "Notación anglosajona: C4 = Do central. La nota aguda debe ser igual o más alta que la grave (p. ej. D3–G4).",
    );
    expect(high).toHaveFocus();
  });

  it("marca los obligatorios vacíos y enfoca el primero", async () => {
    const action = vi.fn<Action>();
    const { user } = setup(action);

    await user.click(screen.getByRole("button", { name: "Guardar pieza" }));

    expect(action).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/^Título/)).toHaveAccessibleDescription("Escribe el título de la pieza.");
    expect(screen.getByLabelText(/^Compositor/)).toHaveAccessibleDescription("Escribe el compositor.");
    expect(screen.getByLabelText(/^Título/)).toHaveFocus();
  });

  it("al editar rellena los datos y envía los valores", async () => {
    const action = vi.fn<Action>(async () => ({ error: "No se pudo guardar la pieza." }));
    const { user } = setup(action, PIECE);

    expect(screen.getByLabelText(/^Título/)).toHaveValue("Largo al factotum");
    expect(screen.getByRole("radio", { name: "En estudio" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "5" })).toBeChecked();

    await user.click(screen.getByRole("radio", { name: "Listo para escenario" }));
    await user.click(screen.getByRole("button", { name: "Guardar pieza" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo guardar la pieza.");
    const formData = action.mock.calls[0][1];
    expect(formData.get("status")).toBe("listo");
    expect(formData.get("range_low")).toBe("D3");
  });

  it("deshabilita el botón mientras guarda", async () => {
    const action = vi.fn<Action>(() => new Promise<PieceFormState>(() => {}));
    const { user } = setup(action, PIECE);

    await user.click(screen.getByRole("button", { name: "Guardar pieza" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Guardando pieza…" })).toBeDisabled(),
    );
  });
});
