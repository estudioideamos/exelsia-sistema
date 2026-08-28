import Link from "next/link";
import { notFound } from "next/navigation";
import { AppTopbar } from "@/components/app-topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EstadoSelector } from "@/components/estado-selector";
import { ESTADOS, operaciones } from "@/lib/mock-data";
import { FileText, Download, UploadCloud } from "lucide-react";

const campos = (op: (typeof operaciones)[number]) => [
  { label: "Cliente", value: op.cliente },
  { label: "Exportador", value: op.exportador },
  { label: "Origen", value: op.origen },
  { label: "Vía", value: op.via },
  { label: "Incoterm", value: op.incoterm },
  { label: "Divisa", value: op.divisa },
  { label: "AWB / BL", value: op.awbBl },
  { label: "Fecha de arribo", value: op.fechaArribo },
  { label: "Forwarder", value: op.forwarder },
  { label: "Factura", value: op.factura },
  { label: "FOB", value: `${op.divisa} ${op.fob.toLocaleString("es-AR", { minimumFractionDigits: 2 })}` },
];

const archivosDemo = [
  { nombre: "Factura_comercial.pdf", tamano: "412 KB" },
  { nombre: "AWB_original.pdf", tamano: "210 KB" },
];

export default async function OperacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const operacion = operaciones.find((o) => o.id === id);
  if (!operacion) notFound();

  return (
    <>
      <AppTopbar title={`Operación ${operacion.orden}`} description={operacion.descripcion} />
      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={ESTADOS[operacion.estado].className}>
              {ESTADOS[operacion.estado].label}
            </Badge>
            <Link href={`/clientes/${operacion.clienteId}`} className="text-sm text-primary hover:underline">
              Ver perfil del cliente →
            </Link>
          </div>
          <EstadoSelector estadoActual={operacion.estado} cliente={operacion.cliente} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="border-border/60 xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Datos de la operación</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                {campos(operacion).map(({ label, value }) => (
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
              {archivosDemo.map((archivo) => (
                <div key={archivo.nombre} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-accent/40">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="truncate text-sm">{archivo.nombre}</p>
                      <p className="text-xs text-muted-foreground">{archivo.tamano}</p>
                    </div>
                  </div>
                  <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              ))}
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
