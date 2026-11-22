"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS, type EstadoOperacion } from "@/lib/mock-data";
import { getTodasOperaciones, normalizarOrden } from "@/lib/data";
import { formatFecha } from "@/lib/utils";
import type { SupabaseClient } from "@supabase/supabase-js";
import { detectarEventos, enviarEventos } from "@/lib/eventos-operacion";
import type { OperacionAviso } from "@/lib/email-eventos";
import type { TipoOperacion } from "@/lib/eventos";

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
    tipo: (String(formData.get("tipo") ?? "") === "exportacion"
      ? "exportacion"
      : "importacion") as TipoOperacion,
    procedencia: texto(formData, "procedencia"),
    destino: texto(formData, "destino"),
    nombre_transporte: texto(formData, "nombre_transporte"),
    vto_forzoso: fecha(formData, "vto_forzoso"),
    fecha_salida: fecha(formData, "fecha_salida"),
    cutoff_documental: fecha(formData, "cutoff_documental"),
    cutoff_fisico: fecha(formData, "cutoff_fisico"),
    cuit_ata: texto(formData, "cuit_ata"),
    fecha_precumplido: fecha(formData, "fecha_precumplido"),
    fecha_cumplido: fecha(formData, "fecha_cumplido"),
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

// Lee la carpeta ya guardada, detecta qué avisos por evento corresponden y los envía.
async function avisarEventos(
  supabase: SupabaseClient,
  id: string,
  anterior: Record<string, unknown> | null
) {
  const vacio = { eventos: 0, mails: 0 };
  try {
    const { data: actual } = await supabase
      .from("operaciones")
      .select("*, cliente:clientes(nombre, email_contacto), exportador:exportadores(nombre)")
      .eq("id", id)
      .maybeSingle();
    if (!actual) return vacio;

    const eventos = detectarEventos(anterior, actual);
    if (eventos.length === 0) return vacio;

    const cliente = actual.cliente as { nombre: string; email_contacto: string | null } | null;
    if (!cliente) return vacio;

    const exportador = actual.exportador as { nombre: string } | null;
    const operacion: OperacionAviso = {
      id,
      tipo: (actual.tipo as TipoOperacion) ?? "importacion",
      orden: actual.orden,
      cliente: cliente.nombre,
      orden_compra: actual.orden_compra,
      awb_bl: actual.awb_bl,
      contraparte: exportador?.nombre ?? null,
      factura: actual.factura,
      fecha_arribo: actual.fecha_arribo,
      fecha_salida: actual.fecha_salida ?? null,
      forwarder: actual.forwarder,
      descripcion: actual.descripcion,
      intervinientes: actual.intervinientes,
      numero_oficializacion: actual.numero_oficializacion,
      fecha_entrega: actual.fecha_entrega,
      facturas_exelsia: actual.facturas_exelsia,
      anticipo_solicitado: actual.anticipo_solicitado,
      fecha_deposito_anticipo: actual.fecha_deposito_anticipo,
      mafia_solicitado: actual.mafia_solicitado,
      fecha_deposito_mafia: actual.fecha_deposito_mafia,
    };

    const resultado = await enviarEventos(
      supabase,
      operacion,
      actual.cliente_id as string,
      cliente.email_contacto,
      eventos
    );
    return { eventos: resultado.eventos.length, mails: resultado.mails };
  } catch (err) {
    console.error("No se pudieron enviar los avisos de la carpeta:", err);
    return vacio;
  }
}

export async function crearOperacion(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("operaciones")
    .insert(datosDeFormulario(formData))
    .select("id")
    .single();

  if (error) throw error;

  await avisarEventos(supabase, data.id as string, null);

  revalidatePath("/operaciones");
  revalidatePath("/dashboard");
  return data.id as string;
}

export async function actualizarOperacion(id: string, formData: FormData) {
  const supabase = await createClient();

  const { data: anterior } = await supabase.from("operaciones").select("*").eq("id", id).maybeSingle();

  const { error } = await supabase.from("operaciones").update(datosDeFormulario(formData)).eq("id", id);
  if (error) throw error;

  const avisos = anterior ? await avisarEventos(supabase, id, anterior) : { eventos: 0, mails: 0 };

  revalidatePath(`/operaciones/${id}`);
  revalidatePath("/operaciones");
  revalidatePath("/dashboard");

  return avisos;
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

export async function eliminarOperaciones(ids: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.from("operaciones").delete().in("id", ids);
  if (error) throw error;

  revalidatePath("/operaciones");
  revalidatePath("/dashboard");
  revalidatePath("/historial");
}

export async function obtenerFilasExportOperaciones(sort: string, dir: string, clienteId?: string) {
  const operaciones = await getTodasOperaciones(normalizarOrden(sort, dir), clienteId);
  return operaciones.map((op) => ({
    orden: op.orden,
    cliente: op.cliente?.nombre ?? "",
    exportador: op.exportador?.nombre ?? "",
    origen: op.pais_origen?.nombre ?? "",
    via: op.via?.nombre ?? "",
    awb_bl: op.awb_bl ?? "",
    fecha_arribo: formatFecha(op.fecha_arribo),
    fob: op.fob ?? "",
    estado: ESTADOS[op.estado]?.label ?? op.estado,
  }));
}
