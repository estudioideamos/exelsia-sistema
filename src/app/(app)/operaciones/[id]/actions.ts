"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EstadoOperacion } from "@/lib/mock-data";
import { enviarAvisoCambioEstado } from "@/lib/email";

export async function actualizarEstadoOperacion(operacionId: string, nuevoEstado: EstadoOperacion) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: operacionAnterior } = await supabase
    .from("operaciones")
    .select(
      `estado, orden, cliente_id, awb_bl, fecha_arribo, forwarder, factura, fob,
       clientes(nombre, email_contacto),
       exportadores(nombre),
       paises(nombre),
       vias(nombre),
       incoterms(nombre),
       divisas(nombre)`
    )
    .eq("id", operacionId)
    .maybeSingle();

  const { error } = await supabase
    .from("operaciones")
    .update({ estado: nuevoEstado })
    .eq("id", operacionId);

  if (error) throw error;

  await supabase.from("operacion_estado_historial").insert({
    operacion_id: operacionId,
    estado_anterior: operacionAnterior?.estado ?? null,
    estado_nuevo: nuevoEstado,
    changed_by: user?.id ?? null,
  });

  const cliente = operacionAnterior?.clientes as unknown as
    | { nombre: string; email_contacto: string | null }
    | null;
  const exportador = operacionAnterior?.exportadores as unknown as { nombre: string } | null;
  const origen = operacionAnterior?.paises as unknown as { nombre: string } | null;
  const via = operacionAnterior?.vias as unknown as { nombre: string } | null;
  const incoterm = operacionAnterior?.incoterms as unknown as { nombre: string } | null;
  const divisa = operacionAnterior?.divisas as unknown as { nombre: string } | null;

  let emailEnviado = false;
  if (cliente?.email_contacto) {
    emailEnviado = await enviarAvisoCambioEstado({
      email: cliente.email_contacto,
      cliente: cliente.nombre,
      orden: operacionAnterior?.orden ?? "",
      nuevoEstado,
      exportador: exportador?.nombre,
      origen: origen?.nombre,
      via: via?.nombre,
      incoterm: incoterm?.nombre,
      divisa: divisa?.nombre,
      fob: operacionAnterior?.fob,
      awbBl: operacionAnterior?.awb_bl,
      fechaArribo: operacionAnterior?.fecha_arribo,
      forwarder: operacionAnterior?.forwarder,
      factura: operacionAnterior?.factura,
    });
  }

  revalidatePath(`/operaciones/${operacionId}`);
  revalidatePath("/operaciones");
  revalidatePath("/dashboard");

  return { emailEnviado, tieneEmailContacto: Boolean(cliente?.email_contacto) };
}

export async function guardarNotasInternas(operacionId: string, comentarios: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("operaciones")
    .update({ comentarios: comentarios.trim() || null })
    .eq("id", operacionId);
  if (error) throw error;
  revalidatePath(`/operaciones/${operacionId}`);
}
