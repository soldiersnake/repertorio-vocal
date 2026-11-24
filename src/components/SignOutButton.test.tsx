import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AuthFormState } from "@/lib/types";
import { SignOutButton } from "./SignOutButton";

describe("SignOutButton", () => {
  it("cierra sesión y muestra el error legible si falla", async () => {
    const action = vi.fn<() => Promise<AuthFormState>>(async () => ({
      error: "No se pudo cerrar la sesión. Inténtalo de nuevo.",
    }));
    render(<SignOutButton action={action} />);

    await userEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(action).toHaveBeenCalledOnce();
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo cerrar la sesión");
  });

  it("deshabilita el botón mientras se cierra la sesión", async () => {
    const action = vi.fn<() => Promise<AuthFormState>>(() => new Promise(() => {}));
    render(<SignOutButton action={action} />);

    await userEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(await screen.findByRole("button", { name: "Cerrando sesión…" })).toBeDisabled();
  });
});
