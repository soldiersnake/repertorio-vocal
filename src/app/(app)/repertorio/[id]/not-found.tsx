import { BackLink } from "@/components/BackLink";
import { HOME_PATH } from "@/lib/auth-routes";

export default function PiezaNotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <BackLink href={HOME_PATH}>Repertorio</BackLink>
      <h1 className="font-display text-display text-fg">No encontramos esa pieza</h1>
      <p className="max-w-prose text-body text-fg-muted">
        Puede que se haya borrado o que el enlace no sea correcto. Vuelve a tu repertorio para
        abrirla desde el listado.
      </p>
    </div>
  );
}
