import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Enlace de vuelta a la pantalla anterior, con objetivo táctil de 44 px. */
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="-ml-2 inline-flex min-h-11 items-center gap-1.5 self-start rounded-ui px-2 text-small font-medium text-fg-muted no-underline transition-colors hover:text-fg"
    >
      <ArrowLeft aria-hidden size={18} strokeWidth={1.75} />
      {children}
    </Link>
  );
}
