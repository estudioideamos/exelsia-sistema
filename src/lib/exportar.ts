import * as XLSX from "xlsx";

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
  <p class="meta">${filas.length} registro(s) · ${new Date().toLocaleDateString("es-AR")}</p>
  <table>
    <thead><tr>${columnas.map((c) => `<th>${c.label}</th>`).join("")}</tr></thead>
    <tbody>${filasHtml}</tbody>
  </table>
  <script>window.onload = () => window.print();</script>
</body>
</html>`);
  ventana.document.close();
}
