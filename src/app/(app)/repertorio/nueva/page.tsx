import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import { PieceForm } from "@/components/PieceForm";
import { HOME_PATH } from "@/lib/auth-routes";
import { createPiece } from "../actions";

export const metadata: Metadata = { title: "Nueva pieza · Repertorio Vocal" };

export default function NuevaPiezaPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <BackLink href={HOME_PATH}>Repertorio</BackLink>
      <h1 className="font-display text-display text-fg">Nueva pieza</h1>
      <PieceForm action={createPiece} cancelHref={HOME_PATH} />
    </div>
  );
}
