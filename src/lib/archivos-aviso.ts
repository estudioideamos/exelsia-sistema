import type { SupabaseClient } from "@supabase/supabase-js";
import type { ArchivoAviso } from "@/lib/email-variables";

const VIGENCIA_LINK_SEGUNDOS = 60 * 60 * 24 * 7;

// Devuelve los archivos de la operación cuya categoría está marcada para esta etapa,
// con un link de descarga temporal para cada uno.
export async function archivosParaAviso(
  supabase: SupabaseClient,
  operacionId: string,
  estado: string
): Promise<ArchivoAviso[]> {
  const { data: tiposRows } = await supabase
    .from("etapa_documentos")
    .select("tipo")
    .eq("estado", estado);

  const tipos = (tiposRows ?? []).map((r) => r.tipo as string);
  if (tipos.length === 0) return [];

  const { data: archivos } = await supabase
    .from("archivos_cliente")
    .select("nombre_archivo, storage_path, tipo")
    .eq("operacion_id", operacionId)
    .in("tipo", tipos)
    .order("created_at");

  const resultado: ArchivoAviso[] = [];
  for (const archivo of archivos ?? []) {
    const { data } = await supabase.storage
      .from("archivos-clientes")
      .createSignedUrl(archivo.storage_path as string, VIGENCIA_LINK_SEGUNDOS);
    if (data?.signedUrl) {
      resultado.push({
        nombre: archivo.nombre_archivo as string,
        tipo: (archivo.tipo as string | null) ?? null,
        url: data.signedUrl,
      });
    }
  }

  return resultado;
}
