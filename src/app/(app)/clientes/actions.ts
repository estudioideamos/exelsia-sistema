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

export type FilaImportCliente = {
  nombre: string;
  cuit?: string;
  cod_import?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
};

export async function importarClientes(filas: Record<string, string>[]) {
  const supabase = await createClient();

  const { data: existentes } = await supabase
    .from("clientes")
    .select("id, nombre, cod_import");

  const porCod = new Map(
    (existentes ?? []).filter((c) => c.cod_import).map((c) => [String(c.cod_import), c])
  );
  const porNombre = new Map((existentes ?? []).map((c) => [c.nombre.toLowerCase(), c]));

  let creados = 0;
  let actualizados = 0;
  const errores: string[] = [];

  for (const [i, fila] of filas.entries()) {
    const nombre = (fila.nombre ?? "").trim();
    if (!nombre) {
      errores.push(`Fila ${i + 2}: falta el nombre.`);
      continue;
    }

    const codImport = fila.cod_import?.trim() || null;
    const registro = {
      nombre,
      cuit: fila.cuit?.trim() || null,
      cod_import: codImport,
      email_contacto: fila.email?.trim() || null,
      telefono: fila.telefono?.trim() || null,
      direccion: fila.direccion?.trim() || null,
    };

    const existente = (codImport && porCod.get(codImport)) || porNombre.get(nombre.toLowerCase());

    if (existente) {
      const { error } = await supabase.from("clientes").update(registro).eq("id", existente.id);
      if (error) errores.push(`Fila ${i + 2} (${nombre}): ${error.message}`);
      else actualizados++;
    } else {
      const { error } = await supabase.from("clientes").insert(registro);
      if (error) errores.push(`Fila ${i + 2} (${nombre}): ${error.message}`);
      else creados++;
    }
  }

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
  return { creados, actualizados, errores };
}

export async function eliminarClientes(ids: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.from("clientes").delete().in("id", ids);
  if (error) throw error;

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
}
