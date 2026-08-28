import { AppTopbar } from "@/components/app-topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfiguracionPage() {
  return (
    <>
      <AppTopbar title="Configuración" description="Ajustes generales del sistema" />
      <div className="flex-1 p-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Próximamente</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Gestión de usuarios, roles y notificaciones por email se configura acá en una
            próxima etapa.
          </CardContent>
        </Card>
      </div>
    </>
  );
}
