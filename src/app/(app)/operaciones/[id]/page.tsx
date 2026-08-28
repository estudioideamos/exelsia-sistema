import Link from "next/link";
import { notFound } from "next/navigation";
import { AppTopbar } from "@/components/app-topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EstadoSelector } from "@/components/estado-selector";
import { ESTADOS } from "@/lib/mock-data";
import { getOperacion } from "@/lib/data";
import { UploadCloud } from "lucide-react";

export default async function OperacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const operacion = await getOperacion(id);
  if (!operacion) notFound();

  const campos = [
    { label: "Cliente", value: operacion.cliente?.nombre ?? "—" },
    { label: "Exportador", value: operacion.exportador?.nombre ?? "—" },
    { label: "Origen", value: operacion.pais_origen?.nombre ?? "—" },
    { label: "Vía", value: operacion.via?.nombre ?? "—" },
    { label: "Incoterm", value: operacion.incoterm?.nombre ?? "—" },
    { label: "Divisa", value: operacion.divisa?.nombre ?? "—" },
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={ESTADOS[operacion.estado].className}>
              {ESTADOS[operacion.estado].label}
            </Badge>
            <Link href={`/clientes/${operacion.cliente_id}`} className="text-sm text-primary hover:underline">
              Ver perfil del cliente →
            </Link>
          </div>
          <EstadoSelector
            operacionId={operacion.id}
            estadoActual={operacion.estado}
            cliente={operacion.cliente?.nombre ?? "el cliente"}
          />
        </div>

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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Archivos</CardTitle>
              <UploadCloud className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                Todavía no se subieron archivos para esta operación.
              </p>
              <Separator className="my-2" />
              <p className="px-2 text-xs text-muted-foreground">
                Los archivos subidos acá también quedan visibles en el perfil del cliente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
