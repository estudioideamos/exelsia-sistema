import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS, type EstadoOperacion } from "@/lib/mock-data";
import { interpolarPlantilla } from "@/lib/email-variables";
import { formatFecha } from "@/lib/utils";

export type DatosAvisoOperacion = {
  email: string;
  cliente: string;
  orden: string;
  nuevoEstado: EstadoOperacion;
  exportador?: string | null;
  origen?: string | null;
  via?: string | null;
  incoterm?: string | null;
  divisa?: string | null;
  fob?: number | null;
  awbBl?: string | null;
  fechaArribo?: string | null;
  forwarder?: string | null;
  factura?: string | null;
  fechaOrden?: string | null;
  pesoKg?: number | null;
  tc?: number | null;
  gastosFob?: number | null;
  flete?: number | null;
  seguro?: number | null;
  ajuste?: number | null;
  baseImponible?: number | null;
  ordenCompra?: string | null;
  envioTerminal?: string | null;
  ncm?: string | null;
  intervinientes?: string | null;
  oficializacionDua?: string | null;
  numeroOficializacion?: string | null;
  fechaOficializacion?: string | null;
  fechaEntrega?: string | null;
  despacho?: string | null;
  facturasExelsia?: string | null;
  fechaFactura?: string | null;
  fechaFacturaExelsia?: string | null;
  anticipoSolicitado?: number | null;
  fechaAnticipo?: string | null;
  anticipoDepositado?: number | null;
  pendiente?: number | null;
  fechaDepositoAnticipo?: string | null;
  mafiaSolicitado?: number | null;
  fechaMafiaDeposito?: string | null;
  mafiaDepositado?: number | null;
  fechaDepositoMafia?: string | null;
};

const PLANTILLA_DEFAULT = {
  asunto: "Actualización de tu operación {{orden}}: {{estado}}",
  cuerpo:
    '<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;"><h2 style="color: #E02B20;">Exelsia</h2><p>Hola {{cliente}},</p><p>Tu operación <strong>{{orden}}</strong> cambió de estado a:</p><p style="font-size: 18px; font-weight: bold;">{{estado}}</p><p>Podés ver el detalle completo ingresando al portal de Exelsia.</p></div>',
};

function num(n: number | null | undefined) {
  return n != null ? n.toLocaleString("es-AR", { minimumFractionDigits: 2 }) : "";
}

export async function enviarAvisoCambioEstado(datos: DatosAvisoOperacion) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY no configurada — se omite el envío de email.");
    return false;
  }

  const supabase = await createClient();
  const { data: plantilla } = await supabase
    .from("configuracion_email")
    .select("asunto, cuerpo")
    .eq("estado", datos.nuevoEstado)
    .maybeSingle();

  const { asunto, cuerpo } = plantilla ?? PLANTILLA_DEFAULT;
  const estadoLabel = ESTADOS[datos.nuevoEstado]?.label ?? datos.nuevoEstado;

  const valores: Record<string, string> = {
    "{{cliente}}": datos.cliente,
    "{{orden}}": datos.orden,
    "{{estado}}": estadoLabel,
    "{{exportador}}": datos.exportador ?? "",
    "{{origen}}": datos.origen ?? "",
    "{{via}}": datos.via ?? "",
    "{{incoterm}}": datos.incoterm ?? "",
    "{{divisa}}": datos.divisa ?? "",
    "{{fob}}": num(datos.fob),
    "{{awb_bl}}": datos.awbBl ?? "",
    "{{fecha_arribo}}": formatFecha(datos.fechaArribo),
    "{{forwarder}}": datos.forwarder ?? "",
    "{{factura}}": datos.factura ?? "",
    "{{fecha_orden}}": formatFecha(datos.fechaOrden),
    "{{peso_kg}}": num(datos.pesoKg),
    "{{tc}}": num(datos.tc),
    "{{gastos_fob}}": num(datos.gastosFob),
    "{{flete}}": num(datos.flete),
    "{{seguro}}": num(datos.seguro),
    "{{ajuste}}": num(datos.ajuste),
    "{{base_imponible}}": num(datos.baseImponible),
    "{{orden_compra}}": datos.ordenCompra ?? "",
    "{{envio_terminal}}": datos.envioTerminal ?? "",
    "{{ncm}}": datos.ncm ?? "",
    "{{intervinientes}}": datos.intervinientes ?? "",
    "{{oficializacion_dua}}": datos.oficializacionDua ?? "",
    "{{numero_oficializacion}}": datos.numeroOficializacion ?? "",
    "{{fecha_oficializacion}}": formatFecha(datos.fechaOficializacion),
    "{{fecha_entrega}}": formatFecha(datos.fechaEntrega),
    "{{despacho}}": datos.despacho ?? "",
    "{{facturas_exelsia}}": datos.facturasExelsia ?? "",
    "{{fecha_factura}}": formatFecha(datos.fechaFactura),
    "{{fecha_factura_exelsia}}": formatFecha(datos.fechaFacturaExelsia),
    "{{anticipo_solicitado}}": num(datos.anticipoSolicitado),
    "{{fecha_anticipo}}": formatFecha(datos.fechaAnticipo),
    "{{anticipo_depositado}}": num(datos.anticipoDepositado),
    "{{pendiente}}": num(datos.pendiente),
    "{{fecha_deposito_anticipo}}": formatFecha(datos.fechaDepositoAnticipo),
    "{{mafia_solicitado}}": num(datos.mafiaSolicitado),
    "{{fecha_mafia_deposito}}": formatFecha(datos.fechaMafiaDeposito),
    "{{mafia_depositado}}": num(datos.mafiaDepositado),
    "{{fecha_deposito_mafia}}": formatFecha(datos.fechaDepositoMafia),
  };

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Exelsia <onboarding@resend.dev>",
    to: datos.email,
    subject: interpolarPlantilla(asunto, valores),
    html: interpolarPlantilla(cuerpo, valores),
  });

  if (error) {
    console.error("Error enviando email de aviso:", error);
    return false;
  }

  return true;
}
