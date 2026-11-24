import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RepertoireFilters } from "./RepertoireFilters";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

beforeEach(() => {
  replace.mockClear();
});

describe("RepertoireFilters", () => {
  it("muestra el control segmentado con el estado activo", () => {
    render(<RepertoireFilters filters={{ estado: "en_estudio", q: "" }} />);
    const group = screen.getByRole("group", { name: "Estado" });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "En estudio" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Todas" })).not.toBeChecked();
  });

  it("al elegir un estado actualiza la URL conservando la búsqueda", async () => {
    const user = userEvent.setup();
    render(<RepertoireFilters filters={{ estado: null, q: "verdi" }} />);

    await user.click(screen.getByRole("radio", { name: "Listo" }));

    expect(replace).toHaveBeenCalledWith("/repertorio?estado=listo&q=verdi", { scroll: false });
  });

  it("'Todas' quita el filtro de estado", async () => {
    const user = userEvent.setup();
    render(<RepertoireFilters filters={{ estado: "listo", q: "" }} />);

    await user.click(screen.getByRole("radio", { name: "Todas" }));

    expect(replace).toHaveBeenCalledWith("/repertorio", { scroll: false });
  });

  it("buscar actualiza la URL con el texto escrito", async () => {
    const user = userEvent.setup();
    render(<RepertoireFilters filters={{ estado: "por_aprender", q: "" }} />);

    await user.type(screen.getByLabelText("Buscar por título o compositor"), "Don Giovanni");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(replace).toHaveBeenCalledWith("/repertorio?estado=por_aprender&q=Don+Giovanni", {
      scroll: false,
    });
  });

  it("buscar con Enter también filtra", async () => {
    const user = userEvent.setup();
    render(<RepertoireFilters filters={{ estado: null, q: "" }} />);

    await user.type(screen.getByLabelText("Buscar por título o compositor"), "rossini{Enter}");

    expect(replace).toHaveBeenCalledWith("/repertorio?q=rossini", { scroll: false });
  });
});
