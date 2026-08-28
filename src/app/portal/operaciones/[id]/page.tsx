import { notFound, redirect } from "next/navigation";
import { AppTopbar } from "@/components/app-topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { ArchivoDescargaButton } from "@/components/archivo-descarga-button";
import { ESTADOS } from "@/lib/mock-data";
import { getArchivosOperacion, getOperacion, getPerfilActual } from "@/lib/data";

export default async function PortalOperacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await getPerfilActual();
  if (!profile?.cliente_id) redirect("/login");

  const operacion = await getOperacion(id);
  if (!operacion || operacion.cliente_id !== profile.cliente_id) notFound();

  const archivos = await getArchivosOperacion(id);

  const campos = [
    { label: "Exportador", value: operacion.exportador?.nombre ?? "—" },
    { label: "Origen", value: operacion.pais_origen?.nombre ?? "—" },
    { label: "Vía", value: operacion.via?.nombre ?? "—" },
    { label: "Incoterm", value: operacion.incoterm?.nombre ?? "—" },
    { label: "AWB / BL", value: operacion.awb_bl ?? "—" },
    { label: "Fecha de arribo", value: operacion.fecha_arribo ?? "—" },
    { label: "Forwarder", value: operacion.forwarder ?? "—" },
    { label: "Factura", value: operacion.factura ?? "—" },
    {
      label: "FOB",
      value: `${operacion.divisa?.nombre ?? ""} ${Number(operacion.fob ?? 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
    },
  ];

  return (
    <>
      <AppTopbar
        title={`Operación ${operacion.orden}`}
        description={operacion.descripcion ?? undefined}
      />
      <div className="flex-1 space-y-6 p-6">
        <Badge variant="outline" className={ESTADOS[operacion.estado].className}>
          {ESTADOS[operacion.estado].label}
        </Badge>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="border-border/60 xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Datos de la operación</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                {campos.map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Archivos</CardTitle>
            </CardHeader>
            <CardContent>
              {archivos.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Todavía no hay archivos para esta operación.
                </p>
              ) : (
                <div className="divide-y divide-border/60">
                  {archivos.map((archivo) => (
                    <div key={archivo.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <p className="truncate text-sm font-medium">{archivo.nombre_archivo}</p>
                      </div>
                      <ArchivoDescargaButton storagePath={archivo.storage_path} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
