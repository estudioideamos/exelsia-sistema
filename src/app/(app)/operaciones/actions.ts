"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function optionalId(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "");
  return value || null;
}

function datosDeFormulario(formData: FormData) {
  const fob = String(formData.get("fob") ?? "");
  const fechaArribo = String(formData.get("fecha_arribo") ?? "");

  return {
    orden: String(formData.get("orden") ?? ""),
    cliente_id: String(formData.get("cliente_id") ?? ""),
    exportador_id: optionalId(formData, "exportador_id"),
    pais_origen_id: optionalId(formData, "pais_origen_id"),
    via_id: optionalId(formData, "via_id"),
    incoterm_id: optionalId(formData, "incoterm_id"),
    divisa_id: optionalId(formData, "divisa_id"),
    awb_bl: String(formData.get("awb_bl") ?? "") || null,
    fecha_arribo: fechaArribo || null,
    forwarder: String(formData.get("forwarder") ?? "") || null,
    factura: String(formData.get("factura") ?? "") || null,
    fob: fob ? Number(fob) : null,
    descripcion: String(formData.get("descripcion") ?? "") || null,
  };
}

export async function crearOperacion(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("operaciones")
    .insert(datosDeFormulario(formData))
    .select("id")
    .single();

  if (error) throw error;

  revalidatePath("/operaciones");
  revalidatePath("/dashboard");
  return data.id as string;
}

export async function actualizarOperacion(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("operaciones")
    .update(datosDeFormulario(formData))
    .eq("id", id);

  if (error) throw error;

  revalidatePath(`/operaciones/${id}`);
  revalidatePath("/operaciones");
  revalidatePath("/dashboard");
}
