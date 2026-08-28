"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS, type EstadoOperacion } from "@/lib/mock-data";

function optionalId(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "");
  return value || null;
}

function texto(formData: FormData, key: string) {
  return String(formData.get(key) ?? "") || null;
}

function numero(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "");
  return v ? Number(v) : null;
}

function fecha(formData: FormData, key: string) {
  return texto(formData, key);
}

function datosDeFormulario(formData: FormData) {
  return {
    orden: String(formData.get("orden") ?? ""),
    cliente_id: String(formData.get("cliente_id") ?? ""),
    exportador_id: optionalId(formData, "exportador_id"),
    pais_origen_id: optionalId(formData, "pais_origen_id"),
    via_id: optionalId(formData, "via_id"),
    incoterm_id: optionalId(formData, "incoterm_id"),
    divisa_id: optionalId(formData, "divisa_id"),
    awb_bl: texto(formData, "awb_bl"),
    fecha_arribo: fecha(formData, "fecha_arribo"),
    forwarder: texto(formData, "forwarder"),
    factura: texto(formData, "factura"),
    fob: numero(formData, "fob"),
    descripcion: texto(formData, "descripcion"),
    fecha_orden: fecha(formData, "fecha_orden"),
    peso_kg: numero(formData, "peso_kg"),
    fecha_factura: fecha(formData, "fecha_factura"),
    orden_compra: texto(formData, "orden_compra"),
    envio_terminal: texto(formData, "envio_terminal"),
    oficializacion_dua: texto(formData, "oficializacion_dua"),
    tc: numero(formData, "tc"),
    gastos_fob: numero(formData, "gastos_fob"),
    flete: numero(formData, "flete"),
    seguro: numero(formData, "seguro"),
    ajuste: numero(formData, "ajuste"),
    base_imponible: numero(formData, "base_imponible"),
    ncm: texto(formData, "ncm"),
    intervinientes: texto(formData, "intervinientes"),
    numero_oficializacion: texto(formData, "numero_oficializacion"),
    fecha_oficializacion: fecha(formData, "fecha_oficializacion"),
    fecha_entrega: fecha(formData, "fecha_entrega"),
    anticipo_solicitado: numero(formData, "anticipo_solicitado"),
    fecha_anticipo: fecha(formData, "fecha_anticipo"),
    anticipo_depositado: numero(formData, "anticipo_depositado"),
    pendiente: numero(formData, "pendiente"),
    fecha_deposito_anticipo: fecha(formData, "fecha_deposito_anticipo"),
    mafia_solicitado: numero(formData, "mafia_solicitado"),
    fecha_mafia_deposito: fecha(formData, "fecha_mafia_deposito"),
    mafia_depositado: numero(formData, "mafia_depositado"),
    fecha_deposito_mafia: fecha(formData, "fecha_deposito_mafia"),
    despacho: texto(formData, "despacho"),
    facturas_exelsia: texto(formData, "facturas_exelsia"),
    fecha_factura_exelsia: fecha(formData, "fecha_factura_exelsia"),
    comentarios: texto(formData, "comentarios"),
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

export type FilaImportOperacion = {
  orden: string;
  cliente?: string;
  exportador?: string;
  origen?: string;
  via?: string;
  awb_bl?: string;
  fecha_arribo?: string;
  fob?: string;
  estado?: string;
};

const ESTADO_POR_LABEL = new Map(
  (Object.entries(ESTADOS) as [EstadoOperacion, (typeof ESTADOS)[EstadoOperacion]][]).map(
    ([key, v]) => [v.label.toLowerCase(), key]
  )
);

export async function importarOperaciones(filas: Record<string, string>[]) {
  const supabase = await createClient();

  const [{ data: clientes }, { data: exportadores }, { data: paises }, { data: vias }, { data: existentes }] =
    await Promise.all([
      supabase.from("clientes").select("id, nombre"),
      supabase.from("exportadores").select("id, nombre"),
      supabase.from("paises").select("id, nombre"),
      supabase.from("vias").select("id, nombre"),
      supabase.from("operaciones").select("id, orden"),
    ]);

  const clientePorNombre = new Map((clientes ?? []).map((c) => [c.nombre.toLowerCase(), c.id]));
  const exportadorPorNombre = new Map(
    (exportadores ?? []).map((e) => [e.nombre.toLowerCase(), e.id])
  );
  const paisPorNombre = new Map((paises ?? []).map((p) => [p.nombre.toLowerCase(), p.id]));
  const viaPorNombre = new Map((vias ?? []).map((v) => [v.nombre.toLowerCase(), v.id]));
  const operacionPorOrden = new Map((existentes ?? []).map((o) => [o.orden, o.id]));

  let creadas = 0;
  let actualizadas = 0;
  const errores: string[] = [];

  for (const [i, fila] of filas.entries()) {
    const orden = (fila.orden ?? "").trim();
    if (!orden) {
      errores.push(`Fila ${i + 2}: falta el número de orden.`);
      continue;
    }

    const nombreCliente = fila.cliente?.trim().toLowerCase();
    const clienteId = nombreCliente ? clientePorNombre.get(nombreCliente) : undefined;

    let exportadorId: string | null = null;
    const nombreExportador = fila.exportador?.trim();
    if (nombreExportador) {
      exportadorId = exportadorPorNombre.get(nombreExportador.toLowerCase()) ?? null;
      if (!exportadorId) {
        const { data, error } = await supabase
          .from("exportadores")
          .insert({ nombre: nombreExportador })
          .select("id")
          .single();
        if (!error && data) {
          exportadorId = data.id;
          exportadorPorNombre.set(nombreExportador.toLowerCase(), data.id);
        }
      }
    }

    const paisOrigenId = fila.origen
      ? (paisPorNombre.get(fila.origen.trim().toLowerCase()) ?? null)
      : null;
    const viaId = fila.via ? (viaPorNombre.get(fila.via.trim().toLowerCase()) ?? null) : null;
    const estado = fila.estado
      ? (ESTADO_POR_LABEL.get(fila.estado.trim().toLowerCase()) ?? "en_curso")
      : "en_curso";
    const fob = fila.fob ? Number(String(fila.fob).replace(/[^0-9.-]/g, "")) : null;

    const registro = {
      orden,
      exportador_id: exportadorId,
      pais_origen_id: paisOrigenId,
      via_id: viaId,
      awb_bl: fila.awb_bl?.trim() || null,
      fecha_arribo: fila.fecha_arribo?.trim() || null,
      fob: Number.isFinite(fob) ? fob : null,
      estado,
    };

    const existenteId = operacionPorOrden.get(orden);

    if (existenteId) {
      const { error } = await supabase.from("operaciones").update(registro).eq("id", existenteId);
      if (error) errores.push(`Fila ${i + 2} (${orden}): ${error.message}`);
      else actualizadas++;
    } else {
      if (!clienteId) {
        errores.push(`Fila ${i + 2} (${orden}): no se encontró el cliente "${fila.cliente ?? ""}".`);
        continue;
      }
      const { error } = await supabase
        .from("operaciones")
        .insert({ ...registro, cliente_id: clienteId });
      if (error) errores.push(`Fila ${i + 2} (${orden}): ${error.message}`);
      else creadas++;
    }
  }

  revalidatePath("/operaciones");
  revalidatePath("/dashboard");
  return { creadas, actualizadas, errores };
}
