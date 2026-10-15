import type { SupabaseClient } from "@supabase/supabase-js";

export type ResolucionAviso = {
  emails: string[];
  modo: "contacto" | "configurado";
};

// Sin casillas cargadas el cliente sigue recibiendo todo en su mail de contacto.
// Con casillas cargadas, solo reciben las etapas que tienen tildadas.
export async function resolverDestinatariosAviso(
  supabase: SupabaseClient,
  clienteId: string,
  estado: string,
  emailContacto: string | null
): Promise<ResolucionAviso> {
  const { data: destinatarios } = await supabase
    .from("cliente_destinatarios")
    .select("id, email")
    .eq("cliente_id", clienteId);

  if (!destinatarios || destinatarios.length === 0) {
    return { emails: emailContacto ? [emailContacto] : [], modo: "contacto" };
  }

  const { data: alertas } = await supabase
    .from("cliente_alertas")
    .select("destinatario_id")
    .eq("cliente_id", clienteId)
    .eq("estado", estado);

  const ids = new Set((alertas ?? []).map((a) => a.destinatario_id as string));
  const emails = destinatarios.filter((d) => ids.has(d.id as string)).map((d) => d.email as string);

  return { emails, modo: "configurado" };
}
