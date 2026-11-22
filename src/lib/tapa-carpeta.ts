import { esc } from "@/lib/html";
import { formatFecha } from "@/lib/utils";

export type DatosTapa = {
  tipo: "importacion" | "exportacion";
  orden: string;
  cliente: string;
  contraparte: string;
  ordenCompra: string;
  docTransporte: string;
  fechaTransporte: string | null;
  forwarder: string;
  descripcion: string;
  intervenciones: string;
};

// Tapa imprimible de la carpeta. Las intervenciones se cargan separadas por "/" y acá
// salen una debajo de la otra.
export function imprimirTapaCarpeta(d: DatosTapa, ventanaAbierta?: Window | null) {
  const ventana = ventanaAbierta ?? window.open("", "_blank");
  if (!ventana) return;

  const impo = d.tipo === "importacion";
  const intervenciones = d.intervenciones
    .split("/")
    .map((x) => x.trim())
    .filter(Boolean);

  const fila = (k: string, v: string) =>
    `<tr><th>${esc(k)}</th><td>${esc(v || "—")}</td></tr>`;

  ventana.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Carpeta ${esc(d.orden)}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #111; margin: 40px; }
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
  .header img { height: 48px; }
  .tipo { font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #666; }
  h1 { font-size: 34px; margin: 0 0 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 16px; }
  th, td { border: 1px solid #ccc; padding: 10px 12px; text-align: left; vertical-align: top; }
  th { width: 32%; background: #f2f2f2; font-weight: 600; }
  ul { margin: 0; padding-left: 18px; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <img src="https://exelsia-sistema.vercel.app/exelsia-logo.png" alt="Exelsia" />
    <span class="tipo">${impo ? "Importación" : "Exportación"}</span>
  </div>
  <h1>Carpeta ${esc(d.orden)}</h1>
  <table>
    ${fila("Cliente", d.cliente)}
    ${fila("Orden de compra", d.ordenCompra)}
    ${fila(impo ? "Exportador / Proveedor" : "Importador / Proveedor", d.contraparte)}
    ${fila("Doc. de transporte", d.docTransporte)}
    ${fila(impo ? "ETA" : "ETD", d.fechaTransporte ? formatFecha(d.fechaTransporte) : "")}
    ${fila("Forwarder", d.forwarder)}
    ${fila("Descripción", d.descripcion)}
    <tr><th>Intervenciones</th><td>${
      intervenciones.length > 0
        ? `<ul>${intervenciones.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
        : "—"
    }</td></tr>
  </table>
  <script>window.onload = () => window.print();</script>
</body>
</html>`);
  ventana.document.close();
}
