import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { RehearsalFormState } from "@/lib/types";
import { RehearsalForm } from "./RehearsalForm";

type Action = (state: RehearsalFormState, formData: FormData) => Promise<RehearsalFormState>;

const PIECE_ID = "6f1c2a3e-8b4d-4c5e-9f10-123456789abc";

function setup(action: Action) {
  const user = userEvent.setup();
  render(<RehearsalForm action={action} pieceId={PIECE_ID} today="2026-11-24" maxDate="2026-11-25" />);
  return { user };
}

describe("RehearsalForm", () => {
  it("propone la fecha de hoy", () => {
    setup(vi.fn<Action>());
    expect(screen.getByLabelText("Fecha")).toHaveValue("2026-11-24");
    expect(screen.getByRole("button", { name: "Registrar ensayo" })).toBeEnabled();
  });

  it("valida los minutos en el cliente", async () => {
    const action = vi.fn<Action>();
    const { user } = setup(action);

    await user.click(screen.getByRole("button", { name: "Registrar ensayo" }));

    expect(action).not.toHaveBeenCalled();
    const minutes = screen.getByLabelText("Minutos");
    expect(minutes).toHaveAccessibleDescription(/minutos/);
    expect(minutes).toHaveFocus();
  });

  it("envía el ensayo y confirma que se registró", async () => {
    const action = vi.fn<Action>(async () => ({ savedAt: 1 }));
    const { user } = setup(action);

    await user.type(screen.getByLabelText("Minutos"), "45");
    await user.type(screen.getByLabelText("Nota (opcional)"), "Fiato en el da capo");
    await user.click(screen.getByRole("button", { name: "Registrar ensayo" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Ensayo registrado.");
    const formData = action.mock.calls[0][1];
    expect(formData.get("piece_id")).toBe(PIECE_ID);
    expect(formData.get("practiced_on")).toBe("2026-11-24");
    expect(formData.get("minutes")).toBe("45");
    expect(formData.get("note")).toBe("Fiato en el da capo");
  });

  it("muestra el error del servidor sin perder lo escrito", async () => {
    const action = vi.fn<Action>(async () => ({
      error: "No se pudo registrar el ensayo. Inténtalo de nuevo en unos segundos.",
      values: { practiced_on: "2026-11-24", minutes: "45", note: "" },
    }));
    const { user } = setup(action);

    await user.type(screen.getByLabelText("Minutos"), "45");
    await user.click(screen.getByRole("button", { name: "Registrar ensayo" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo registrar el ensayo");
    expect(screen.getByLabelText("Minutos")).toHaveValue(45);
  });
});
