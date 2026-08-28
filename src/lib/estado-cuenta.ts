import { formatFecha } from "@/lib/utils";
import { ESTADOS, type EstadoOperacion } from "@/lib/mock-data";

type OperacionResumen = {
  orden: string;
  exportador: string;
  origen: string;
  via: string;
  fecha_arribo: string | null;
  divisa: string;
  fob: number | null;
  estado: EstadoOperacion;
};

export function exportarEstadoCuenta(clienteNombre: string, operaciones: OperacionResumen[]) {
  const ventana = window.open("", "_blank");
  if (!ventana) return;

  const fobTotal = operaciones.reduce((acc, o) => acc + Number(o.fob ?? 0), 0);

  const filas = operaciones
    .map(
      (op) => `<tr>
        <td>${op.orden}</td>
        <td>${op.exportador}</td>
        <td>${op.origen}</td>
        <td>${op.via}</td>
        <td>${formatFecha(op.fecha_arribo)}</td>
        <td>${op.divisa} ${Number(op.fob ?? 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
        <td>${ESTADOS[op.estado].label}</td>
      </tr>`
    )
    .join("");

  ventana.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Estado de cuenta — ${clienteNombre}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #111; margin: 32px; }
  .header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
  .header img { height: 44px; }
  h1 { font-size: 20px; margin: 24px 0 4px; }
  .meta { color: #666; font-size: 12px; margin-bottom: 16px; }
  .total { font-size: 14px; font-weight: 700; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
  th { background: #f2f2f2; font-weight: 600; }
  @media print { body { margin: 12px; } }
</style>
</head>
<body>
  <div class="header">
    <img src="https://exelsia-sistema.vercel.app/exelsia-logo.png" alt="Exelsia" />
  </div>
  <h1>Estado de cuenta</h1>
  <p class="meta">${clienteNombre} · ${operaciones.length} operación(es) · ${formatFecha(new Date().toISOString())}</p>
  <p class="total">FOB total: USD ${fobTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
  <table>
    <thead><tr><th>Orden</th><th>Exportador</th><th>Origen</th><th>Vía</th><th>Arribo</th><th>FOB</th><th>Estado</th></tr></thead>
    <tbody>${filas}</tbody>
  </table>
  <script>window.onload = () => window.print();</script>
</body>
</html>`);
  ventana.document.close();
}
