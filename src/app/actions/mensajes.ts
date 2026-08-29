"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function enviarMensajeOperacion(operacionId: string, texto: string, pathARevalidar: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("operacion_mensajes").insert({
    operacion_id: operacionId,
    autor_id: user.id,
    texto: texto.trim(),
  });
  if (error) throw error;

  revalidatePath(pathARevalidar);
}

export async function editarMensajeOperacion(mensajeId: string, texto: string, pathARevalidar: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("operacion_mensajes")
    .update({ texto: texto.trim() })
    .eq("id", mensajeId);
  if (error) throw error;

  revalidatePath(pathARevalidar);
}

export async function borrarMensajeOperacion(mensajeId: string, pathARevalidar: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("operacion_mensajes").delete().eq("id", mensajeId);
  if (error) throw error;

  revalidatePath(pathARevalidar);
}
