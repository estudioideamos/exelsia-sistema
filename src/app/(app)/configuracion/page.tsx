import { AppTopbar } from "@/components/app-topbar";
import { EmailTemplateEditor } from "@/components/email-template-editor";
import { createClient } from "@/lib/supabase/server";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const { data: plantilla } = await supabase
    .from("configuracion_email")
    .select("id, asunto, cuerpo")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <>
      <AppTopbar title="Configuración" description="Ajustes generales del sistema" />
      <div className="flex-1 space-y-6 p-6">
        {plantilla ? (
          <EmailTemplateEditor
            id={plantilla.id}
            asuntoInicial={plantilla.asunto}
            cuerpoInicial={plantilla.cuerpo}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            No se encontró una plantilla de email configurada.
          </p>
        )}
      </div>
    </>
  );
}
