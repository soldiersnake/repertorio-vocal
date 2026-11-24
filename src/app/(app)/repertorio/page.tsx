import type { Metadata } from "next";
import { requireUser } from "@/lib/supabase/require-user";

export const metadata: Metadata = { title: "Repertorio · Repertorio Vocal" };

export default async function RepertorioPage() {
  await requireUser();

  return <h1 className="font-display text-display text-fg">Repertorio</h1>;
}
