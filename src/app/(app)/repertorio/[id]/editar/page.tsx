import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { PieceForm } from "@/components/PieceForm";
import { HOME_PATH } from "@/lib/auth-routes";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/require-user";
import type { Piece } from "@/lib/types";
import { idSchema } from "@/lib/validation";
import { updatePiece } from "../../actions";

export const metadata: Metadata = { title: "Editar pieza · Repertorio Vocal" };

type EditarPiezaPageProps = { params: Promise<{ id: string }> };

export default async function EditarPiezaPage({ params }: EditarPiezaPageProps) {
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();

  const user = await requireUser();
  const supabase = await createClient();
  const { data: piece, error } = await supabase
    .from("pieces")
    .select("*")
    .eq("id", id.data)
    .eq("user_id", user.id)
    .maybeSingle<Piece>();
  if (error) throw new Error("No se pudo cargar la pieza.");
  if (!piece) notFound();

  const detailHref = `${HOME_PATH}/${piece.id}`;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <BackLink href={detailHref}>{piece.title}</BackLink>
      <h1 className="font-display text-display text-fg">Editar pieza</h1>
      <PieceForm action={updatePiece.bind(null, piece.id)} piece={piece} cancelHref={detailHref} />
    </div>
  );
}
