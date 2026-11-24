import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ActionState } from "@/lib/types";
import { ConfirmDelete } from "./ConfirmDelete";

type Action = (state: ActionState) => Promise<ActionState>;

function setup(action: Action, compact = false) {
  const user = userEvent.setup();
  render(
    <ConfirmDelete
      action={action}
      triggerLabel="Borrar pieza"
      prompt="¿Borrar «Ombra mai fù» y sus ensayos? No se puede deshacer."
      confirmLabel="Sí, borrar pieza"
      pendingLabel="Borrando…"
      compact={compact}
    />,
  );
  return { user };
}

describe("ConfirmDelete", () => {
  it("el primer clic solo pide confirmación; el segundo borra", async () => {
    const action = vi.fn<Action>(async () => ({}));
    const { user } = setup(action);

    await user.click(screen.getByRole("button", { name: "Borrar pieza" }));

    expect(action).not.toHaveBeenCalled();
    expect(screen.getByText(/No se puede deshacer/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Sí, borrar pieza" }));

    await waitFor(() => expect(action).toHaveBeenCalledOnce());
  });

  it("no usa window.confirm", async () => {
    const confirmSpy = vi.spyOn(window, "confirm");
    const { user } = setup(vi.fn<Action>(async () => ({})));

    await user.click(screen.getByRole("button", { name: "Borrar pieza" }));

    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("cancelar vuelve al primer paso y devuelve el foco", async () => {
    const action = vi.fn<Action>();
    const { user } = setup(action);

    await user.click(screen.getByRole("button", { name: "Borrar pieza" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(action).not.toHaveBeenCalled();
    expect(screen.queryByText(/No se puede deshacer/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Borrar pieza" })).toHaveFocus();
  });

  it("Escape también cancela", async () => {
    const { user } = setup(vi.fn<Action>(), true);

    await user.click(screen.getByRole("button", { name: "Borrar pieza" }));
    await user.keyboard("{Escape}");

    expect(screen.getByRole("button", { name: "Borrar pieza" })).toBeInTheDocument();
  });

  it("muestra el error legible y deshabilita mientras borra", async () => {
    let finish: (state: ActionState) => void = () => {};
    const action = vi.fn<Action>(
      () =>
        new Promise<ActionState>((resolve) => {
          finish = resolve;
        }),
    );
    const { user } = setup(action);

    await user.click(screen.getByRole("button", { name: "Borrar pieza" }));
    await user.click(screen.getByRole("button", { name: "Sí, borrar pieza" }));

    expect(await screen.findByRole("button", { name: "Borrando…" })).toBeDisabled();
    finish({ error: "No se pudo borrar la pieza. Inténtalo de nuevo en unos segundos." });
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo borrar la pieza");
  });
});
