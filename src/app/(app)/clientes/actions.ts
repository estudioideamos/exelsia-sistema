"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function crearCliente(formData: FormData) {
  const supabase = await createClient();

  const paisId = String(formData.get("pais_id") ?? "");

  const { data, error } = await supabase
    .from("clientes")
    .insert({
      nombre: String(formData.get("nombre") ?? ""),
      cuit: String(formData.get("cuit") ?? "") || null,
      cod_import: String(formData.get("cod_import") ?? "") || null,
      pais_id: paisId || null,
      email_contacto: String(formData.get("email_contacto") ?? "") || null,
      telefono: String(formData.get("telefono") ?? "") || null,
      direccion: String(formData.get("direccion") ?? "") || null,
    })
    .select("id")
    .single();

  if (error) throw error;

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
  return data.id as string;
}
