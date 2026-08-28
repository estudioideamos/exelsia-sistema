import { redirect } from "next/navigation";
import { AppTopbar } from "@/components/app-topbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArchivoDescargaButton } from "@/components/archivo-descarga-button";
import { Mail, Phone, MapPin, FileText } from "lucide-react";
import { getArchivosCliente, getCliente, getPerfilActual } from "@/lib/data";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default async function PortalPerfilPage() {
  const { profile } = await getPerfilActual();
  if (!profile?.cliente_id) redirect("/login");

  const [cliente, archivos] = await Promise.all([
    getCliente(profile.cliente_id),
    getArchivosCliente(profile.cliente_id),
  ]);

  if (!cliente) redirect("/login");

  return (
    <>
      <AppTopbar
        title="Mi perfil"
        description={cliente.nombre}
        notificationsBasePath="/portal/operaciones"
        includeClientesInSearch={false}
      />
      <div className="flex-1 space-y-6 p-6">
        <Card className="border-border/60">
          <CardContent className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-center">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {initials(cliente.nombre)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{cliente.nombre}</h2>
              <p className="text-sm text-muted-foreground">
                CUIT {cliente.cuit ?? "—"} · Cód. Import {cliente.cod_import ?? "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Datos de contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {cliente.email_contacto ?? "Sin email"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              {cliente.telefono ?? "Sin teléfono"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {cliente.direccion ?? "Sin dirección"}
            </div>
            <p className="pt-2 text-xs text-muted-foreground">
              Si algún dato está desactualizado, contactá a tu asesor de Exelsia para
              corregirlo.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Mis archivos</CardTitle>
          </CardHeader>
          <CardContent>
            {archivos.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Todavía no hay archivos disponibles.
              </p>
            ) : (
              <div className="divide-y divide-border/60">
                {archivos.map((archivo) => (
                  <div key={archivo.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{archivo.nombre_archivo}</p>
                          {(() => {
                            const op = Array.isArray(archivo.operaciones)
                              ? archivo.operaciones[0]
                              : archivo.operaciones;
                            return (
                              <Badge
                                variant="outline"
                                className={
                                  op
                                    ? "shrink-0 border-primary/30 bg-primary/5 text-[10px] text-primary"
                                    : "shrink-0 text-[10px] text-muted-foreground"
                                }
                              >
                                {op ? op.orden : "General"}
                              </Badge>
                            );
                          })()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(archivo.created_at).toLocaleDateString("es-AR")}
                        </p>
                      </div>
                    </div>
                    <ArchivoDescargaButton storagePath={archivo.storage_path} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
