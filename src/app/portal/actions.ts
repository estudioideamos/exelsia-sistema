"use server";

import { getPerfilActual, getTodasOperaciones, ORDEN_OPERACIONES_DEFAULT } from "@/lib/data";

// El cliente sale siempre de la sesión: nunca se recibe por parámetro.
export async function obtenerOperacionesEstadoCuenta() {
  const { profile } = await getPerfilActual();
  if (!profile?.cliente_id) return [];

  const operaciones = await getTodasOperaciones(ORDEN_OPERACIONES_DEFAULT, profile.cliente_id);
  return operaciones.map((op) => ({
    orden: op.orden,
    exportador: op.exportador?.nombre ?? "—",
    origen: op.pais_origen?.nombre ?? "—",
    via: op.via?.nombre ?? "—",
    fecha_arribo: op.fecha_arribo,
    divisa: op.divisa?.nombre ?? "",
    fob: op.fob,
    estado: op.estado,
  }));
}
