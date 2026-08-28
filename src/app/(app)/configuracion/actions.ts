"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function guardarPlantillaEmail(id: string, asunto: string, cuerpo: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("configuracion_email")
    .update({ asunto, cuerpo, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/configuracion");
}
