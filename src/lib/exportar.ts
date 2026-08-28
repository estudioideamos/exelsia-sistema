import * as XLSX from "xlsx";
import { formatFecha } from "@/lib/utils";

export type ColumnaExport = { label: string; key: string };

function filasAObjetos(columnas: ColumnaExport[], filas: Record<string, unknown>[]) {
  return filas.map((fila) => {
    const obj: Record<string, unknown> = {};
    columnas.forEach((col) => {
      obj[col.label] = fila[col.key] ?? "";
    });
    return obj;
  });
}

export function exportarExcel(
  nombreArchivo: string,
  columnas: ColumnaExport[],
  filas: Record<string, unknown>[]
) {
  const datos = filasAObjetos(columnas, filas);
  const hoja = XLSX.utils.json_to_sheet(datos);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Datos");
  XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);
}

export function exportarCsv(
  nombreArchivo: string,
  columnas: ColumnaExport[],
  filas: Record<string, unknown>[]
) {
  const datos = filasAObjetos(columnas, filas);
  const hoja = XLSX.utils.json_to_sheet(datos);
  const csv = XLSX.utils.sheet_to_csv(hoja);
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nombreArchivo}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export type DashboardReporteData = {
  kpis: { label: string; value: string; hint: string }[];
  estadoDistribucion: { label: string; cantidad: number; porcentaje: number }[];
  clientesConActividad: { nombre: string; cuit: string; operacionesActivas: number }[];
  operacionesRecientes: { orden: string; cliente: string; estado: string }[];
};

export function exportarDashboardPdf(data: DashboardReporteData) {
  const ventana = window.open("", "_blank");
  if (!ventana) return;

  const filaKpi = (k: (typeof data.kpis)[number]) => `
    <div class="kpi">
      <p class="kpi-label">${k.label}</p>
      <p class="kpi-value">${k.value}</p>
      <p class="kpi-hint">${k.hint}</p>
    </div>`;

  const filaEstado = (e: (typeof data.estadoDistribucion)[number]) => `
    <tr><td>${e.label}</td><td>${e.cantidad}</td><td>${e.porcentaje}%</td></tr>`;

  const filaCliente = (c: (typeof data.clientesConActividad)[number]) => `
    <tr><td>${c.nombre}</td><td>${c.cuit}</td><td>${c.operacionesActivas}</td></tr>`;

  const filaOperacion = (o: (typeof data.operacionesRecientes)[number]) => `
    <tr><td>${o.orden}</td><td>${o.cliente}</td><td>${o.estado}</td></tr>`;

  ventana.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Dashboard — Exelsia</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #111; margin: 32px; }
  .header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
  .header img { height: 44px; }
  h1 { font-size: 20px; margin: 24px 0 4px; }
  h2 { font-size: 15px; margin: 28px 0 10px; }
  .meta { color: #666; font-size: 12px; margin-bottom: 16px; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 8px; }
  .kpi { border: 1px solid #ddd; border-radius: 8px; padding: 12px 14px; }
  .kpi-label { font-size: 11px; color: #666; margin: 0; }
  .kpi-value { font-size: 20px; font-weight: 700; margin: 4px 0; }
  .kpi-hint { font-size: 10px; color: #888; margin: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
  th { background: #f2f2f2; font-weight: 600; }
  @media print {
    body { margin: 12px; }
    .kpis { grid-template-columns: repeat(4, 1fr); }
  }
</style>
</head>
<body>
  <div class="header">
    <img src="https://exelsia-sistema.vercel.app/exelsia-logo.png" alt="Exelsia" />
  </div>
  <h1>Reporte de dashboard</h1>
  <p class="meta">${formatFecha(new Date().toISOString())}</p>

  <div class="kpis">${data.kpis.map(filaKpi).join("")}</div>

  <h2>Operaciones por estado</h2>
  <table>
    <thead><tr><th>Estado</th><th>Cantidad</th><th>%</th></tr></thead>
    <tbody>${data.estadoDistribucion.map(filaEstado).join("")}</tbody>
  </table>

  <h2>Clientes con más actividad</h2>
  <table>
    <thead><tr><th>Cliente</th><th>CUIT</th><th>Operaciones activas</th></tr></thead>
    <tbody>${data.clientesConActividad.map(filaCliente).join("")}</tbody>
  </table>

  <h2>Operaciones recientes</h2>
  <table>
    <thead><tr><th>Orden</th><th>Cliente</th><th>Estado</th></tr></thead>
    <tbody>${data.operacionesRecientes.map(filaOperacion).join("")}</tbody>
  </table>

  <script>window.onload = () => window.print();</script>
</body>
</html>`);
  ventana.document.close();
}

export function imprimirSeleccionados(
  titulo: string,
  columnas: ColumnaExport[],
  filas: Record<string, unknown>[]
) {
  const ventana = window.open("", "_blank");
  if (!ventana) return;

  const filasHtml = filas
    .map(
      (fila) =>
        `<tr>${columnas
          .map((col) => `<td>${String(fila[col.key] ?? "")}</td>`)
          .join("")}</tr>`
    )
    .join("");

  ventana.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>${titulo}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #111; margin: 32px; }
  .header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
  .header img { height: 44px; }
  h1 { font-size: 20px; margin: 24px 0 4px; }
  .meta { color: #666; font-size: 12px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; white-space: nowrap; }
  th { background: #f2f2f2; font-weight: 600; }
  @media print {
    body { margin: 12px; }
  }
</style>
</head>
<body>
  <div class="header">
    <img src="https://exelsia-sistema.vercel.app/exelsia-logo.png" alt="Exelsia" />
  </div>
  <h1>${titulo}</h1>
  <p class="meta">${filas.length} registro(s) · ${formatFecha(new Date().toISOString())}</p>
  <table>
    <thead><tr>${columnas.map((c) => `<th>${c.label}</th>`).join("")}</tr></thead>
    <tbody>${filasHtml}</tbody>
  </table>
  <script>window.onload = () => window.print();</script>
</body>
</html>`);
  ventana.document.close();
}
