import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AuthFormState } from "@/lib/types";
import { AuthForm } from "./AuthForm";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

type Action = (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;

function setup(mode: "login" | "registro", action: Action) {
  const user = userEvent.setup();
  render(<AuthForm mode={mode} action={action} />);
  return {
    user,
    email: screen.getByLabelText("Correo electrónico"),
    password: screen.getByLabelText("Contraseña"),
  };
}

describe("AuthForm (login)", () => {
  it("muestra los campos con su etiqueta y el botón que nombra la acción", () => {
    setup("login", vi.fn<Action>());
    expect(screen.getByLabelText("Correo electrónico")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "Crear cuenta" })).toHaveAttribute("href", "/registro");
  });

  it("valida en el cliente y enlaza el error al campo con aria-describedby", async () => {
    const action = vi.fn<Action>();
    const { user, email, password } = setup("login", action);

    await user.type(email, "no-es-un-correo");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(action).not.toHaveBeenCalled();
    const emailError = screen.getByText(/Escribe un correo válido/);
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAttribute("aria-describedby", emailError.id);
    expect(email).toHaveAccessibleDescription(emailError.textContent ?? "");
    expect(password).toHaveAccessibleDescription("Escribe tu contraseña.");
    expect(email).toHaveFocus();
  });

  it("envía los datos válidos y muestra el error legible del servidor", async () => {
    const action = vi.fn<Action>(async () => ({
      error: "El correo o la contraseña no coinciden. Revísalos e inténtalo de nuevo.",
    }));
    const { user, email, password } = setup("login", action);

    await user.type(email, "demo@repertorio.app");
    await user.type(password, "secreta");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/no coinciden/);
    const formData = action.mock.calls[0][1];
    expect(formData.get("email")).toBe("demo@repertorio.app");
    expect(formData.get("password")).toBe("secreta");
    expect(email).toHaveValue("demo@repertorio.app");
  });

  it("deshabilita el botón mientras se envía", async () => {
    let finish: (state: AuthFormState) => void = () => {};
    const action = vi.fn<Action>(
      () =>
        new Promise<AuthFormState>((resolve) => {
          finish = resolve;
        }),
    );
    const { user, email, password } = setup("login", action);

    await user.type(email, "demo@repertorio.app");
    await user.type(password, "secreta");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    const pending = await screen.findByRole("button", { name: "Entrando…" });
    expect(pending).toBeDisabled();
    finish({});
    await waitFor(() => expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled());
  });

  it("muestra los errores de campo que devuelve el servidor", async () => {
    const action = vi.fn<Action>(async () => ({
      fieldErrors: { email: "Escribe un correo válido, por ejemplo nombre@dominio.com." },
    }));
    const { user, email, password } = setup("login", action);

    await user.type(email, "demo@repertorio.app");
    await user.type(password, "x");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(email).toHaveAccessibleDescription(/correo válido/));
  });
});

describe("AuthForm (registro)", () => {
  it("indica el mínimo de la contraseña y lo valida", async () => {
    const action = vi.fn<Action>();
    const { user, email, password } = setup("registro", action);
    expect(password).toHaveAccessibleDescription("Mínimo 8 caracteres.");

    await user.type(email, "nueva@repertorio.app");
    await user.type(password, "corta");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(action).not.toHaveBeenCalled();
    expect(password).toHaveAccessibleDescription(
      "Mínimo 8 caracteres. La contraseña debe tener al menos 8 caracteres.",
    );
    expect(password).toHaveFocus();
  });

  it("tras registrarse pide revisar el correo", async () => {
    const action = vi.fn<Action>(async () => ({
      message: "Revisa tu correo para confirmar la cuenta.",
    }));
    const { user, email, password } = setup("registro", action);

    await user.type(email, "nueva@repertorio.app");
    await user.type(password, "contraseña-larga");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Revisa tu correo para confirmar la cuenta.");
    expect(status).toHaveTextContent("nueva@repertorio.app");
  });
});
