export const EMAIL_VARIABLES = [
  { token: "{{cliente}}", label: "Nombre del cliente" },
  { token: "{{orden}}", label: "Número de orden" },
  { token: "{{estado}}", label: "Nuevo estado de la operación" },
  { token: "{{exportador}}", label: "Exportador" },
  { token: "{{origen}}", label: "País de origen" },
  { token: "{{via}}", label: "Vía (aéreo, marítimo, etc.)" },
  { token: "{{incoterm}}", label: "Incoterm" },
  { token: "{{divisa}}", label: "Divisa" },
  { token: "{{fob}}", label: "Valor FOB" },
  { token: "{{awb_bl}}", label: "AWB / BL" },
  { token: "{{fecha_arribo}}", label: "Fecha de arribo" },
  { token: "{{forwarder}}", label: "Forwarder" },
  { token: "{{factura}}", label: "Número de factura" },
  { token: "{{fecha_orden}}", label: "Fecha de la orden" },
  { token: "{{peso_kg}}", label: "Peso (Kg)" },
  { token: "{{tc}}", label: "Tipo de cambio" },
  { token: "{{gastos_fob}}", label: "Gastos hasta FOB" },
  { token: "{{flete}}", label: "Flete" },
  { token: "{{seguro}}", label: "Seguro" },
  { token: "{{ajuste}}", label: "Ajuste" },
  { token: "{{base_imponible}}", label: "Base imponible" },
  { token: "{{orden_compra}}", label: "Orden de compra" },
  { token: "{{envio_terminal}}", label: "Envío de orden / Terminal" },
  { token: "{{ncm}}", label: "NCM" },
  { token: "{{intervinientes}}", label: "Intervinientes" },
  { token: "{{oficializacion_dua}}", label: "Oficialización DJAI" },
  { token: "{{numero_oficializacion}}", label: "N° de oficialización" },
  { token: "{{fecha_oficializacion}}", label: "Fecha de oficialización" },
  { token: "{{fecha_entrega}}", label: "Fecha de entrega" },
  { token: "{{despacho}}", label: "Despacho" },
  { token: "{{facturas_exelsia}}", label: "Facturas Exelsia" },
  { token: "{{fecha_factura}}", label: "Fecha de factura" },
  { token: "{{fecha_factura_exelsia}}", label: "Fecha de factura Exelsia" },
  { token: "{{anticipo_solicitado}}", label: "Anticipo solicitado" },
  { token: "{{fecha_anticipo}}", label: "Fecha de anticipo" },
  { token: "{{anticipo_depositado}}", label: "Anticipo depositado" },
  { token: "{{pendiente}}", label: "Pendiente" },
  { token: "{{fecha_deposito_anticipo}}", label: "Fecha de depósito" },
  { token: "{{mafia_solicitado}}", label: "MAFIA solicitado" },
  { token: "{{fecha_mafia_deposito}}", label: "Fecha dep. MAFIA" },
  { token: "{{mafia_depositado}}", label: "MAFIA depositado" },
  { token: "{{fecha_deposito_mafia}}", label: "Fecha de depósito MAFIA" },
  { token: "{{archivos}}", label: "Documentos de la etapa (links de descarga)" },
] as const;

export type ArchivoAviso = { nombre: string; tipo: string | null; url: string };

function escaparHtml(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function bloqueArchivosHtml(archivos: ArchivoAviso[]) {
  if (archivos.length === 0) return "";

  const items = archivos
    .map(
      (a) =>
        `<li style="margin:0 0 6px;"><a href="${escaparHtml(a.url)}" style="color:#E02B20;text-decoration:underline;">${escaparHtml(a.nombre)}</a>${
          a.tipo ? ` <span style="color:#777777;">(${escaparHtml(a.tipo)})</span>` : ""
        }</li>`
    )
    .join("");

  return `<div style="margin:20px 0;padding:14px 18px;border:1px solid #e5e5e5;border-radius:8px;font-family:sans-serif;">
<p style="margin:0 0 10px;font-size:14px;font-weight:bold;">Documentación de tu operación</p>
<ul style="margin:0;padding-left:18px;font-size:14px;">${items}</ul>
<p style="margin:10px 0 0;font-size:12px;color:#888888;">Los links de descarga estarán disponibles durante 7 días.</p>
</div>`;
}

export function interpolarPlantilla(texto: string, datos: Record<string, string>) {
  return EMAIL_VARIABLES.reduce(
    (acc, { token }) => acc.split(token).join(datos[token] ?? ""),
    texto
  );
}
