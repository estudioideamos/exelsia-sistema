import { AppTopbar } from "@/components/app-topbar";
import { DocumentosPorEtapa } from "@/components/documentos-por-etapa";
import { EmailTemplatesManager } from "@/components/email-templates-manager";
import { getDocumentosPorEtapa } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const [{ data: plantillas }, documentos] = await Promise.all([
    supabase.from("configuracion_email").select("id, estado, asunto, cuerpo"),
    getDocumentosPorEtapa(),
  ]);

  return (
    <>
      <AppTopbar title="Configuración" description="Ajustes generales del sistema" />
      <div className="flex-1 space-y-6 p-6">
        <EmailTemplatesManager plantillas={plantillas ?? []} />
        <DocumentosPorEtapa documentos={documentos} />
      </div>
    </>
  );
}
