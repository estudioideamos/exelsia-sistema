import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS, type EstadoOperacion } from "@/lib/mock-data";
import { interpolarPlantilla } from "@/lib/email-variables";

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
};

const PLANTILLA_DEFAULT = {
  asunto: "Actualización de tu operación {{orden}}: {{estado}}",
  cuerpo:
    '<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;"><h2 style="color: #E02B20;">Exelsia</h2><p>Hola {{cliente}},</p><p>Tu operación <strong>{{orden}}</strong> cambió de estado a:</p><p style="font-size: 18px; font-weight: bold;">{{estado}}</p><p>Podés ver el detalle completo ingresando al portal de Exelsia.</p></div>',
};

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
    "{{fob}}": datos.fob != null ? datos.fob.toLocaleString("es-AR", { minimumFractionDigits: 2 }) : "",
    "{{awb_bl}}": datos.awbBl ?? "",
    "{{fecha_arribo}}": datos.fechaArribo ?? "",
    "{{forwarder}}": datos.forwarder ?? "",
    "{{factura}}": datos.factura ?? "",
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
