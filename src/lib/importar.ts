import * as XLSX from "xlsx";

export async function parseArchivoImport(file: File): Promise<Record<string, string>[]> {
  const buffer = await file.arrayBuffer();
  const libro = XLSX.read(buffer, { type: "array" });
  const hoja = libro.Sheets[libro.SheetNames[0]];
  const filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja, { defval: "" });
  return filas.map((fila) => {
    const normalizada: Record<string, string> = {};
    for (const [key, value] of Object.entries(fila)) {
      normalizada[key.trim()] = value === null || value === undefined ? "" : String(value).trim();
    }
    return normalizada;
  });
}
