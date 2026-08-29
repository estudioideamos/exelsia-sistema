import * as XLSX from "xlsx";

const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024;

export async function parseArchivoImport(file: File): Promise<Record<string, string>[]> {
  if (file.size > TAMANO_MAXIMO_BYTES) {
    throw new Error("El archivo es demasiado grande (máximo 10 MB).");
  }
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
