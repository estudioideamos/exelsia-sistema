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
      `*,
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
      fechaOrden: operacionAnterior?.fecha_orden,
      pesoKg: operacionAnterior?.peso_kg,
      tc: operacionAnterior?.tc,
      gastosFob: operacionAnterior?.gastos_fob,
      flete: operacionAnterior?.flete,
      seguro: operacionAnterior?.seguro,
      ajuste: operacionAnterior?.ajuste,
      baseImponible: operacionAnterior?.base_imponible,
      ordenCompra: operacionAnterior?.orden_compra,
      envioTerminal: operacionAnterior?.envio_terminal,
      ncm: operacionAnterior?.ncm,
      intervinientes: operacionAnterior?.intervinientes,
      oficializacionDua: operacionAnterior?.oficializacion_dua,
      numeroOficializacion: operacionAnterior?.numero_oficializacion,
      fechaOficializacion: operacionAnterior?.fecha_oficializacion,
      fechaEntrega: operacionAnterior?.fecha_entrega,
      despacho: operacionAnterior?.despacho,
      facturasExelsia: operacionAnterior?.facturas_exelsia,
      fechaFactura: operacionAnterior?.fecha_factura,
      fechaFacturaExelsia: operacionAnterior?.fecha_factura_exelsia,
      anticipoSolicitado: operacionAnterior?.anticipo_solicitado,
      fechaAnticipo: operacionAnterior?.fecha_anticipo,
      anticipoDepositado: operacionAnterior?.anticipo_depositado,
      pendiente: operacionAnterior?.pendiente,
      fechaDepositoAnticipo: operacionAnterior?.fecha_deposito_anticipo,
      mafiaSolicitado: operacionAnterior?.mafia_solicitado,
      fechaMafiaDeposito: operacionAnterior?.fecha_mafia_deposito,
      mafiaDepositado: operacionAnterior?.mafia_depositado,
      fechaDepositoMafia: operacionAnterior?.fecha_deposito_mafia,
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
