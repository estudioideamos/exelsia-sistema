"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS } from "@/lib/mock-data";
import { TIPOS_ARCHIVO } from "@/lib/tipos-archivo";

export async function guardarPlantillaEmail(id: string, asunto: string, cuerpo: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("configuracion_email")
    .update({ asunto, cuerpo, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/configuracion");
}

export async function setDocumentoEtapa(estado: string, tipo: string, activo: boolean) {
  if (!(estado in ESTADOS)) throw new Error("Etapa inválida.");
  if (!(TIPOS_ARCHIVO as readonly string[]).includes(tipo)) throw new Error("Tipo de archivo inválido.");

  const supabase = await createClient();

  if (activo) {
    const { error } = await supabase
      .from("etapa_documentos")
      .upsert({ estado, tipo }, { onConflict: "estado,tipo" });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("etapa_documentos")
      .delete()
      .eq("estado", estado)
      .eq("tipo", tipo);
    if (error) throw error;
  }

  revalidatePath("/configuracion");
}
