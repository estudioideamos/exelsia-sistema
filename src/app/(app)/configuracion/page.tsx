import { AppTopbar } from "@/components/app-topbar";
import { EmailTemplatesManager } from "@/components/email-templates-manager";
import { createClient } from "@/lib/supabase/server";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const { data: plantillas } = await supabase
    .from("configuracion_email")
    .select("id, estado, asunto, cuerpo");

  return (
    <>
      <AppTopbar title="Configuración" description="Ajustes generales del sistema" />
      <div className="flex-1 space-y-6 p-6">
        <EmailTemplatesManager plantillas={plantillas ?? []} />
      </div>
    </>
  );
}
