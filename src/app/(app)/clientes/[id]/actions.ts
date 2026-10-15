"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS } from "@/lib/mock-data";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function actualizarCliente(clienteId: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("clientes")
    .update({
      nombre: String(formData.get("nombre") ?? ""),
      cuit: String(formData.get("cuit") ?? ""),
      email_contacto: String(formData.get("email_contacto") ?? ""),
      telefono: String(formData.get("telefono") ?? ""),
      direccion: String(formData.get("direccion") ?? ""),
      notas: String(formData.get("notas") ?? "") || null,
    })
    .eq("id", clienteId);

  if (error) throw error;

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/clientes");
}

export async function agregarDestinatario(clienteId: string, email: string, etiqueta: string) {
  const limpio = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(limpio)) throw new Error("El email no es válido.");

  const supabase = await createClient();

  const { count } = await supabase
    .from("cliente_destinatarios")
    .select("id", { count: "exact", head: true })
    .eq("cliente_id", clienteId);
  const esPrimero = (count ?? 0) === 0;

  const { data, error } = await supabase
    .from("cliente_destinatarios")
    .insert({ cliente_id: clienteId, email: limpio, etiqueta: etiqueta.trim() || null })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("Esa casilla ya está cargada para este cliente.");
    throw error;
  }

  // La primera casilla arranca recibiendo todas las etapas, para no cortar los avisos que ya salían.
  if (esPrimero) {
    const { error: alertasError } = await supabase.from("cliente_alertas").insert(
      Object.keys(ESTADOS).map((estado) => ({
        cliente_id: clienteId,
        estado,
        destinatario_id: data.id,
      }))
    );
    if (alertasError) throw alertasError;
  }

  revalidatePath(`/clientes/${clienteId}`);
}

export async function eliminarDestinatario(clienteId: string, destinatarioId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cliente_destinatarios")
    .delete()
    .eq("id", destinatarioId)
    .eq("cliente_id", clienteId);
  if (error) throw error;

  revalidatePath(`/clientes/${clienteId}`);
}

export async function setAlertaCliente(
  clienteId: string,
  estado: string,
  destinatarioId: string,
  activo: boolean
) {
  if (!(estado in ESTADOS)) throw new Error("Etapa inválida.");

  const supabase = await createClient();

  if (activo) {
    const { error } = await supabase
      .from("cliente_alertas")
      .upsert(
        { cliente_id: clienteId, estado, destinatario_id: destinatarioId },
        { onConflict: "cliente_id,estado,destinatario_id" }
      );
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("cliente_alertas")
      .delete()
      .eq("cliente_id", clienteId)
      .eq("estado", estado)
      .eq("destinatario_id", destinatarioId);
    if (error) throw error;
  }

  revalidatePath(`/clientes/${clienteId}`);
}
