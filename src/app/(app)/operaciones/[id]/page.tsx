import Link from "next/link";
import { notFound } from "next/navigation";
import { AppTopbar } from "@/components/app-topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EstadoSelector } from "@/components/estado-selector";
import { ArchivosCliente } from "@/components/archivos-cliente";
import { OperacionDialog } from "@/components/operacion-dialog";
import { OperacionTimeline } from "@/components/operacion-timeline";
import { NotasInternas } from "@/components/notas-internas";
import { ESTADOS } from "@/lib/mock-data";
import { getArchivosOperacion, getOperacion, getHistorialOperacion } from "@/lib/data";
import { formatFecha } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { Pencil } from "lucide-react";

export default async function OperacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [operacion, archivos, historial, clientesRes, exportadoresRes, paisesRes, viasRes, incotermsRes, divisasRes] =
    await Promise.all([
      getOperacion(id),
      getArchivosOperacion(id),
      getHistorialOperacion(id),
      supabase.from("clientes").select("id, nombre").order("nombre"),
      supabase.from("exportadores").select("id, nombre").order("nombre"),
      supabase.from("paises").select("id, nombre").order("nombre"),
      supabase.from("vias").select("id, nombre").order("nombre"),
      supabase.from("incoterms").select("id, nombre").order("nombre"),
      supabase.from("divisas").select("id, nombre").order("nombre"),
    ]);
  if (!operacion) notFound();

  const campos = [
    { label: "Cliente", value: operacion.cliente?.nombre ?? "—" },
    { label: "Exportador", value: operacion.exportador?.nombre ?? "—" },
    { label: "Origen", value: operacion.pais_origen?.nombre ?? "—" },
    { label: "Vía", value: operacion.via?.nombre ?? "—" },
    { label: "Incoterm", value: operacion.incoterm?.nombre ?? "—" },
    { label: "Divisa", value: operacion.divisa?.nombre ?? "—" },
    { label: "AWB / BL", value: operacion.awb_bl ?? "—" },
    { label: "Fecha de arribo", value: formatFecha(operacion.fecha_arribo) },
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
          <div className="flex items-center gap-2">
            <OperacionDialog
              operacionId={operacion.id}
              trigger={
                <Button size="sm" variant="outline">
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
              }
              clientes={clientesRes.data ?? []}
              exportadores={exportadoresRes.data ?? []}
              paises={paisesRes.data ?? []}
              vias={viasRes.data ?? []}
              incoterms={incotermsRes.data ?? []}
              divisas={divisasRes.data ?? []}
              valoresIniciales={{
                orden: operacion.orden,
                cliente_id: operacion.cliente_id,
                exportador_id: operacion.exportador_id,
                pais_origen_id: operacion.pais_origen_id,
                via_id: operacion.via_id,
                incoterm_id: operacion.incoterm_id,
                divisa_id: operacion.divisa_id,
                fob: operacion.fob,
                awb_bl: operacion.awb_bl,
                fecha_arribo: operacion.fecha_arribo,
                forwarder: operacion.forwarder,
                factura: operacion.factura,
                descripcion: operacion.descripcion,
              }}
            />
            <EstadoSelector
              operacionId={operacion.id}
              estadoActual={operacion.estado}
              cliente={operacion.cliente?.nombre ?? "el cliente"}
            />
          </div>
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
            <CardHeader>
              <CardTitle className="text-base">Archivos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ArchivosCliente
                clienteId={operacion.cliente_id}
                operacionId={operacion.id}
                archivosIniciales={archivos}
              />
              <Separator />
              <p className="px-1 text-xs text-muted-foreground">
                Los archivos subidos acá también quedan visibles en el perfil del cliente.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="border-border/60 xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Historial</CardTitle>
            </CardHeader>
            <CardContent>
              <OperacionTimeline eventos={historial} creadaEn={operacion.created_at} />
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Notas internas</CardTitle>
            </CardHeader>
            <CardContent>
              <NotasInternas operacionId={operacion.id} notasIniciales={operacion.comentarios} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
