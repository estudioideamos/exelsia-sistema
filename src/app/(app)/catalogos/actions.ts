"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const TABLAS_PERMITIDAS = ["paises", "divisas", "incoterms", "vias", "exportadores"] as const;
type TablaCatalogo = (typeof TABLAS_PERMITIDAS)[number];

function assertTabla(tabla: string): asserts tabla is TablaCatalogo {
  if (!(TABLAS_PERMITIDAS as readonly string[]).includes(tabla)) {
    throw new Error("Tabla no permitida");
  }
}

export async function crearItemCatalogo(tabla: string, datos: Record<string, string>) {
  assertTabla(tabla);
  const supabase = await createClient();
  const { error } = await supabase.from(tabla).insert(datos);
  if (error) throw error;
  revalidatePath(`/catalogos/${tabla}`);
}

export async function actualizarItemCatalogo(
  tabla: string,
  id: string,
  datos: Record<string, string>
) {
  assertTabla(tabla);
  const supabase = await createClient();
  const { error } = await supabase.from(tabla).update(datos).eq("id", id);
  if (error) throw error;
  revalidatePath(`/catalogos/${tabla}`);
}

export async function eliminarItemCatalogo(tabla: string, id: string) {
  assertTabla(tabla);
  const supabase = await createClient();
  const { error } = await supabase.from(tabla).delete().eq("id", id);
  if (error) throw error;
  revalidatePath(`/catalogos/${tabla}`);
}
