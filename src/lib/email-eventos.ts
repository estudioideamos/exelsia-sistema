import { Resend } from "resend";
import { bloqueArchivosHtml, type ArchivoAviso } from "@/lib/email-variables";
import { formatFecha } from "@/lib/utils";
import { urlOperacionPortal } from "@/lib/site";
import type { EventoKey, TipoOperacion } from "@/lib/eventos";

// Datos de la carpeta que usan los mails. Todo puede venir vacío: en ese caso se
// muestra "Pendiente".
export type OperacionAviso = {
  id: string;
  tipo: TipoOperacion;
  orden: string;
  cliente: string;
  orden_compra: string | null;
  awb_bl: string | null;
  contraparte: string | null; // exportador (importación) o importador (exportación)
  factura: string | null;
  fecha_arribo: string | null;
  fecha_salida: string | null;
  forwarder: string | null;
  descripcion: string | null;
  intervinientes: string | null;
  numero_oficializacion: string | null;
  fecha_entrega: string | null;
  facturas_exelsia: string | null;
  anticipo_solicitado: number | null;
  fecha_deposito_anticipo: string | null;
  mafia_solicitado: number | null;
  fecha_deposito_mafia: string | null;
};

function esc(texto: unknown) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const pend = (v: string | null | undefined) => (v && v.trim() ? v : "Pendiente");
const fecha = (v: string | null) => (v ? formatFecha(v) : "Pendiente");
const ars = (n: number | null) =>
  n == null
    ? "Pendiente"
    : `ARS ${n.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;

function identificacion(op: OperacionAviso) {
  return [
    `carpeta ${op.orden}`,
    op.orden_compra ? `OC ${op.orden_compra}` : null,
    op.awb_bl ? `doc. de transporte ${op.awb_bl}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

const TD = "padding:8px 10px;border:1px solid #e5e5e5;";

function tabla(filas: [string, string][]) {
  const cuerpo = filas
    .map(
      ([k, v]) =>
        `<tr><td style="${TD}font-weight:bold;width:45%;">${esc(k)}</td><td style="${TD}">${esc(v)}</td></tr>`
    )
    .join("");
  return `<table style="border-collapse:collapse;width:100%;font-size:14px;margin:14px 0;"><tbody>${cuerpo}</tbody></table>`;
}

function botonPortal(url: string) {
  return `<p style="margin:18px 0 0;"><a href="${esc(url)}" style="display:inline-block;background:#E02B20;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:14px;font-weight:bold;">Ver la carpeta en el portal</a></p>`;
}

function marco(op: OperacionAviso, cuerpo: string, archivos: ArchivoAviso[]) {
  const docs = archivos.length > 0 ? bloqueArchivosHtml(archivos) : botonPortal(urlOperacionPortal(op.id));
  return `<div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;"><h2 style="color: #E02B20;">Exelsia</h2><p>Hola ${esc(op.cliente)},</p>${cuerpo}${docs}</div>`;
}

export function armarAviso(
  evento: EventoKey,
  op: OperacionAviso,
  archivos: ArchivoAviso[]
): { asunto: string; html: string } {
  const impo = op.tipo === "importacion";
  const id = esc(identificacion(op));

  switch (evento) {
    case "creacion":
      return {
        asunto: `Nueva carpeta ${op.orden}`,
        html: marco(
          op,
          `<p>Se ha generado una nueva carpeta a su nombre con el siguiente detalle:</p>${tabla([
            ["Interno Exelsia", op.orden],
            ["OC cliente", pend(op.orden_compra)],
            [impo ? "Exportador / Proveedor" : "Importador / Proveedor", pend(op.contraparte)],
            ["Factura", pend(op.factura)],
            ["BL", pend(op.awb_bl)],
            [impo ? "Fecha de arribo" : "Fecha de salida", fecha(impo ? op.fecha_arribo : op.fecha_salida)],
            ["Forwarder", pend(op.forwarder)],
            ["Descripción", pend(op.descripcion)],
            ["Intervenciones", pend(op.intervinientes)],
          ])}`,
          archivos
        ),
      };

    case "fecha_transporte": {
      const que = impo ? "arribo" : "salida";
      const valor = fecha(impo ? op.fecha_arribo : op.fecha_salida);
      return {
        asunto: `Carpeta ${op.orden}: nueva fecha de ${que}`,
        html: marco(
          op,
          `<p>La ${id} ha actualizado su fecha de ${que} a <strong>${esc(valor)}</strong>.</p>`,
          archivos
        ),
      };
    }

    case "anticipos":
      return {
        asunto: `Carpeta ${op.orden}: solicitud de anticipo`,
        html: marco(
          op,
          `<p>Para la ${id} será necesaria la acreditación de los siguientes fondos:</p>${tabla([
            ["Anticipo de gastos", ars(op.anticipo_solicitado)],
            ["Fecha de acreditación de gastos", fecha(op.fecha_deposito_anticipo)],
            ["Fondos de aduana", ars(op.mafia_solicitado)],
            ["Fecha de acreditación de fondos de aduana", fecha(op.fecha_deposito_mafia)],
          ])}`,
          archivos
        ),
      };

    case "oficializacion":
      return {
        asunto: impo
          ? `Carpeta ${op.orden}: despacho oficializado`
          : `Carpeta ${op.orden}: permiso de embarque oficializado`,
        html: marco(
          op,
          impo
            ? `<p>La ${id} cuenta con despacho <strong>${esc(pend(op.numero_oficializacion))}</strong>.</p>`
            : `<p>La ${id} cuenta con permiso de embarque n° <strong>${esc(pend(op.numero_oficializacion))}</strong>.</p>`,
          archivos
        ),
      };

    case "entrega":
      return {
        asunto: `Carpeta ${op.orden}: fecha de entrega`,
        html: marco(
          op,
          `<p>La ${id} tiene prevista su entrega para el <strong>${esc(fecha(op.fecha_entrega))}</strong>.</p>`,
          archivos
        ),
      };

    case "facturacion":
      return {
        asunto: `Carpeta ${op.orden}: facturas disponibles`,
        html: marco(
          op,
          `<p>Para la ${id} hay facturas disponibles: <strong>${esc(pend(op.facturas_exelsia))}</strong>.</p>`,
          archivos
        ),
      };
  }
}

export async function enviarAvisoEvento(datos: {
  evento: EventoKey;
  operacion: OperacionAviso;
  email: string[];
  archivos: ArchivoAviso[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY no configurada — se omite el envío de email.");
    return false;
  }
  if (datos.email.length === 0) return false;

  const { asunto, html } = armarAviso(datos.evento, datos.operacion, datos.archivos);
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Exelsia <onboarding@resend.dev>",
    to: datos.email,
    subject: asunto,
    html,
  });

  if (error) {
    console.error(`Error enviando aviso "${datos.evento}":`, error);
    return false;
  }
  return true;
}
