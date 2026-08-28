"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
