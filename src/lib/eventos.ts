// Avisos por evento de la carpeta (importación y exportación). Cada evento sale cuando se
// carga o cambia un dato puntual de la operación, a diferencia de los avisos por estado.

export type TipoOperacion = "importacion" | "exportacion";

export const TIPOS_OPERACION: { value: TipoOperacion; label: string }[] = [
  { value: "importacion", label: "Importación" },
  { value: "exportacion", label: "Exportación" },
];

export type EventoKey =
  | "creacion"
  | "fecha_transporte"
  | "anticipos"
  | "oficializacion"
  | "entrega"
  | "facturacion";

export type EventoConfig = {
  key: EventoKey;
  label: string;
  descripcion: string;
  // Categorías de archivo que viajan en el aviso cuando el contacto tiene "Adjunto" tildado.
  // Vacío = este evento no lleva documentos.
  tipos: string[];
  // Si está definido, el evento solo existe para ese tipo de operación.
  soloTipo?: TipoOperacion;
};

export const EVENTOS: EventoConfig[] = [
  {
    key: "creacion",
    label: "Apertura de carpeta",
    descripcion: "Al crear la carpeta. Se envía una sola vez.",
    tipos: ["Carátula"],
  },
  {
    key: "fecha_transporte",
    label: "Fecha de arribo / salida",
    descripcion: "Cada vez que cambia la fecha de arribo (importación) o de salida (exportación).",
    tipos: [],
  },
  {
    key: "anticipos",
    label: "Anticipos",
    descripcion: "Al cargar el anticipo de gastos y el importe SIM, y ante cambios en ellos.",
    tipos: ["Presupuesto"],
  },
  {
    key: "oficializacion",
    label: "Oficialización",
    descripcion: "Al cargar el N° de oficialización o permiso de embarque.",
    tipos: ["Despacho PDF", "Despacho Digitalizado", "Despacho XML", "Permiso de embarque"],
  },
  {
    key: "entrega",
    label: "Fecha de entrega",
    descripcion: "Al cargar o cambiar la fecha de entrega (solo importación).",
    tipos: [],
    soloTipo: "importacion",
  },
  {
    key: "facturacion",
    label: "Cierre y factura",
    descripcion: "Al cargar o cambiar las facturas de Exelsia.",
    tipos: ["Factura Exelsia", "Legajo"],
  },
];

export const claveAvisoEvento = (key: string) => `evento:${key}`;
export const claveAdjuntoEvento = (key: string) => `adjunto:${key}`;

export function esClaveEvento(valor: string) {
  const [prefijo, key] = valor.split(":");
  return (
    (prefijo === "evento" || prefijo === "adjunto") && EVENTOS.some((e) => e.key === key)
  );
}

export function eventoPorKey(key: string) {
  return EVENTOS.find((e) => e.key === key);
}
