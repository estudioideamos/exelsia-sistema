import type { SupabaseClient } from "@supabase/supabase-js";
import type { ArchivoAviso } from "@/lib/email-variables";
import { urlOperacionPortal } from "@/lib/site";

// Devuelve los archivos de la operación cuya categoría está marcada para esta etapa,
// y el link al portal, donde el cliente (con su sesión) los descarga sin vencimiento.
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
    .select("nombre_archivo, tipo")
    .eq("operacion_id", operacionId)
    .in("tipo", tipos)
    .order("created_at");

  const url = urlOperacionPortal(operacionId);
  return (archivos ?? []).map((archivo) => ({
    nombre: archivo.nombre_archivo as string,
    tipo: (archivo.tipo as string | null) ?? null,
    url,
  }));
}
