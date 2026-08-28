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
] as const;

export function interpolarPlantilla(texto: string, datos: Record<string, string>) {
  return EMAIL_VARIABLES.reduce(
    (acc, { token }) => acc.split(token).join(datos[token] ?? ""),
    texto
  );
}
