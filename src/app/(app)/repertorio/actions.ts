"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { HOME_PATH, LOGIN_PATH } from "@/lib/auth-routes";
import { createClient } from "@/lib/supabase/server";
import type { ActionState, PieceFormState, RehearsalFormState } from "@/lib/types";
import {
  firstFieldErrors,
  idSchema,
  pieceSchema,
  readPieceValues,
  rehearsalSchema,
} from "@/lib/validation";

const NETWORK_ERROR =
  "No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.";
const SAVE_PIECE_ERROR = "No se pudo guardar la pieza. Inténtalo de nuevo en unos segundos.";
const PIECE_NOT_FOUND =
  "No encontramos esa pieza en tu repertorio. Puede que ya se haya borrado; vuelve al listado.";
const DELETE_PIECE_ERROR = "No se pudo borrar la pieza. Inténtalo de nuevo en unos segundos.";
const SAVE_REHEARSAL_ERROR = "No se pudo registrar el ensayo. Inténtalo de nuevo en unos segundos.";
const DELETE_REHEARSAL_ERROR = "No se pudo borrar el ensayo. Inténtalo de nuevo en unos segundos.";

const piecePath = (id: string) => `${HOME_PATH}/${id}`;

/** Cliente y usuario de la sesión; sin sesión corta y manda a /login (D-12a). */
async function requireSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect(LOGIN_PATH);
  return { supabase, user: data.user };
}

export async function createPiece(
  _prev: PieceFormState,
  formData: FormData,
): Promise<PieceFormState> {
  const { supabase, user } = await requireSession();
  const values = readPieceValues(formData);
  const parsed = pieceSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: firstFieldErrors(parsed.error), values };

  let id: string;
  try {
    const { data, error } = await supabase
      .from("pieces")
      .insert({ ...parsed.data, user_id: user.id })
      .select("id")
      .single<{ id: string }>();
    if (error || !data) return { error: SAVE_PIECE_ERROR, values };
    id = data.id;
  } catch {
    return { error: NETWORK_ERROR, values };
  }

  revalidatePath(HOME_PATH);
  redirect(piecePath(id));
}

export async function updatePiece(
  pieceId: string,
  _prev: PieceFormState,
  formData: FormData,
): Promise<PieceFormState> {
  const { supabase, user } = await requireSession();
  const values = readPieceValues(formData);
  const id = idSchema.safeParse(pieceId);
  if (!id.success) return { error: PIECE_NOT_FOUND, values };
  const parsed = pieceSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: firstFieldErrors(parsed.error), values };

  try {
    const { data, error } = await supabase
      .from("pieces")
      .update(parsed.data)
      .eq("id", id.data)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle<{ id: string }>();
    if (error) return { error: SAVE_PIECE_ERROR, values };
    if (!data) return { error: PIECE_NOT_FOUND, values };
  } catch {
    return { error: NETWORK_ERROR, values };
  }

  revalidatePath(HOME_PATH);
  revalidatePath(piecePath(id.data));
  redirect(piecePath(id.data));
}

export async function deletePiece(pieceId: string): Promise<ActionState> {
  const { supabase, user } = await requireSession();
  const id = idSchema.safeParse(pieceId);
  if (!id.success) return { error: PIECE_NOT_FOUND };

  try {
    const { data, error } = await supabase
      .from("pieces")
      .delete()
      .eq("id", id.data)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle<{ id: string }>();
    if (error) return { error: DELETE_PIECE_ERROR };
    if (!data) return { error: PIECE_NOT_FOUND };
  } catch {
    return { error: NETWORK_ERROR };
  }

  revalidatePath(HOME_PATH);
  redirect(HOME_PATH);
}

function readRehearsalValues(formData: FormData) {
  const read = (field: string) => {
    const value = formData.get(field);
    return typeof value === "string" ? value : undefined;
  };
  return {
    piece_id: read("piece_id"),
    practiced_on: read("practiced_on"),
    minutes: read("minutes"),
    note: read("note"),
  };
}

export async function addRehearsal(
  _prev: RehearsalFormState,
  formData: FormData,
): Promise<RehearsalFormState> {
  const { supabase, user } = await requireSession();
  const input = readRehearsalValues(formData);
  const values = { practiced_on: input.practiced_on, minutes: input.minutes, note: input.note };
  const parsed = rehearsalSchema.safeParse(input);
  if (!parsed.success) {
    const { piece_id: pieceError, ...fieldErrors } = firstFieldErrors(parsed.error);
    return pieceError ? { error: pieceError, values } : { fieldErrors, values };
  }

  try {
    const { error } = await supabase
      .from("rehearsals")
      .insert({ ...parsed.data, user_id: user.id });
    if (error) return { error: SAVE_REHEARSAL_ERROR, values };
  } catch {
    return { error: NETWORK_ERROR, values };
  }

  revalidatePath(HOME_PATH);
  revalidatePath(piecePath(parsed.data.piece_id));
  return { savedAt: Date.now() };
}

export async function deleteRehearsal(
  pieceId: string,
  rehearsalId: string,
): Promise<ActionState> {
  const { supabase, user } = await requireSession();
  const piece = idSchema.safeParse(pieceId);
  const rehearsal = idSchema.safeParse(rehearsalId);
  if (!piece.success || !rehearsal.success) {
    return { error: "No encontramos ese ensayo. Recarga la página e inténtalo de nuevo." };
  }

  try {
    const { error } = await supabase
      .from("rehearsals")
      .delete()
      .eq("id", rehearsal.data)
      .eq("piece_id", piece.data)
      .eq("user_id", user.id);
    if (error) return { error: DELETE_REHEARSAL_ERROR };
  } catch {
    return { error: NETWORK_ERROR };
  }

  revalidatePath(HOME_PATH);
  revalidatePath(piecePath(piece.data));
  return {};
}
