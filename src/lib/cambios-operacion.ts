import { formatFecha } from "@/lib/utils";

type TipoCampo = "fecha" | "texto" | "numero";

// Datos de la operación cuyo cambio se le avisa al cliente. Quedan afuera los importes
// internos (costos, anticipos, facturación) y las notas internas.
export const CAMPOS_CON_AVISO: { key: string; label: string; tipo: TipoCampo }[] = [
  { key: "fecha_orden", label: "Fecha de la orden", tipo: "fecha" },
  { key: "orden_compra", label: "Orden de compra", tipo: "texto" },
  { key: "awb_bl", label: "AWB / BL", tipo: "texto" },
  { key: "forwarder", label: "Forwarder", tipo: "texto" },
  { key: "fecha_arribo", label: "Fecha de arribo", tipo: "fecha" },
  { key: "envio_terminal", label: "Envío de orden / Terminal", tipo: "texto" },
  { key: "oficializacion_dua", label: "Oficialización DJAI", tipo: "texto" },
  { key: "numero_oficializacion", label: "N° de oficialización", tipo: "texto" },
  { key: "fecha_oficializacion", label: "Fecha de oficialización", tipo: "fecha" },
  { key: "fecha_entrega", label: "Fecha de entrega", tipo: "fecha" },
  { key: "despacho", label: "Despacho", tipo: "texto" },
  { key: "factura", label: "Factura", tipo: "texto" },
  { key: "fecha_factura", label: "Fecha de factura", tipo: "fecha" },
  { key: "peso_kg", label: "Peso (Kg)", tipo: "numero" },
  { key: "ncm", label: "NCM", tipo: "texto" },
];

export type CambioOperacion = { campo: string; antes: string; despues: string };

function normalizar(valor: unknown, tipo: TipoCampo) {
  if (valor === null || valor === undefined || valor === "") return null;
  if (tipo === "numero") return Number(valor);
  return String(valor).trim();
}

function mostrar(valor: string | number | null, tipo: TipoCampo) {
  if (valor === null) return "sin dato";
  if (tipo === "fecha") return formatFecha(String(valor));
  if (tipo === "numero") {
    return Number(valor).toLocaleString("es-AR", { minimumFractionDigits: 2 });
  }
  return String(valor);
}

export function detectarCambios(
  antes: Record<string, unknown> | null,
  despues: Record<string, unknown>
): CambioOperacion[] {
  if (!antes) return [];
  const cambios: CambioOperacion[] = [];
  for (const { key, label, tipo } of CAMPOS_CON_AVISO) {
    const a = normalizar(antes[key], tipo);
    const d = normalizar(despues[key], tipo);
    if (a !== d) cambios.push({ campo: label, antes: mostrar(a, tipo), despues: mostrar(d, tipo) });
  }
  return cambios;
}
