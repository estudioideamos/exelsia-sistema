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
import { ImprimirTapaButton } from "@/components/imprimir-tapa-button";
import { OperacionTimeline } from "@/components/operacion-timeline";
import { NotasInternas } from "@/components/notas-internas";
import { OperacionMensajes } from "@/components/operacion-mensajes";
import { ESTADOS } from "@/lib/mock-data";
import { getArchivosOperacion, getOperacion, getHistorialOperacion, getMensajesOperacion } from "@/lib/data";
import { formatFecha } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { Pencil } from "lucide-react";

function GrupoCampos({ titulo, campos }: { titulo: string; campos: { label: string; value: string }[] }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{titulo}</p>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {campos.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default async function OperacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [operacion, archivos, historial, mensajes, clientesRes, exportadoresRes, paisesRes, viasRes, incotermsRes, divisasRes] =
    await Promise.all([
      getOperacion(id),
      getArchivosOperacion(id),
      getHistorialOperacion(id),
      getMensajesOperacion(id),
      supabase.from("clientes").select("id, nombre").order("nombre"),
      supabase.from("exportadores").select("id, nombre").order("nombre"),
      supabase.from("paises").select("id, nombre").order("nombre"),
      supabase.from("vias").select("id, nombre").order("nombre"),
      supabase.from("incoterms").select("id, nombre").order("nombre"),
      supabase.from("divisas").select("id, nombre").order("nombre"),
    ]);
  if (!operacion) notFound();

  const numeroFmt = (n: number | null | undefined) =>
    n == null ? "—" : n.toLocaleString("es-AR", { minimumFractionDigits: 2 });

  const impo = (operacion.tipo ?? "importacion") === "importacion";
  const ars = (n: number | null | undefined) => (n == null ? "—" : `ARS ${numeroFmt(n)}`);

  const camposGeneral = [
    { label: "Cliente", value: operacion.cliente?.nombre ?? "—" },
    { label: "Fecha", value: formatFecha(operacion.fecha_orden) },
    { label: impo ? "Exportador / Proveedor" : "Importador / Proveedor", value: operacion.exportador?.nombre ?? "—" },
    { label: "Origen", value: operacion.pais_origen?.nombre ?? "—" },
    impo
      ? { label: "Procedencia", value: operacion.procedencia ?? "—" }
      : { label: "Destino", value: operacion.destino ?? "—" },
    { label: "Orden de compra", value: operacion.orden_compra ?? "—" },
    { label: "Vía", value: operacion.via?.nombre ?? "—" },
    { label: "Doc. de transporte (AWB / BL)", value: operacion.awb_bl ?? "—" },
    { label: "Nombre del transporte", value: operacion.nombre_transporte ?? "—" },
    ...(impo
      ? [{ label: "ETA (fecha de arribo)", value: formatFecha(operacion.fecha_arribo) }]
      : [
          { label: "Cutoff documental", value: formatFecha(operacion.cutoff_documental) },
          { label: "Cutoff físico", value: formatFecha(operacion.cutoff_fisico) },
          { label: "ETD (fecha de salida)", value: formatFecha(operacion.fecha_salida) },
        ]),
    { label: "Forwarder", value: operacion.forwarder ?? "—" },
    ...(impo ? [] : [{ label: "CUIT del ATA", value: operacion.cuit_ata ?? "—" }]),
    { label: "Peso bruto (Kg)", value: numeroFmt(operacion.peso_kg) },
  ];

  const camposComercial = [
    { label: "Incoterm", value: operacion.incoterm?.nombre ?? "—" },
    { label: "Divisa", value: operacion.divisa?.nombre ?? "—" },
    { label: "TC", value: numeroFmt(operacion.tc) },
    { label: "Gastos hasta FOB", value: numeroFmt(operacion.gastos_fob) },
    { label: "FOB", value: numeroFmt(operacion.fob) },
    ...(impo
      ? [
          { label: "Flete", value: numeroFmt(operacion.flete) },
          { label: "Seguro", value: numeroFmt(operacion.seguro) },
          { label: "Ajuste", value: numeroFmt(operacion.ajuste) },
        ]
      : []),
    { label: "Base imponible", value: numeroFmt(operacion.base_imponible) },
    { label: impo ? "Factura de importación" : "Factura de exportación", value: operacion.factura ?? "—" },
    { label: "Fecha de factura", value: formatFecha(operacion.fecha_factura) },
    { label: "Facturas Exelsia", value: operacion.facturas_exelsia ?? "—" },
    { label: "Fecha de factura Exelsia", value: formatFecha(operacion.fecha_factura_exelsia) },
  ];

  const camposAduana = [
    { label: "Fiscal / Terminal", value: operacion.envio_terminal ?? "—" },
    { label: "NCM", value: operacion.ncm ?? "—" },
    { label: "Oficialización DJAI", value: operacion.oficializacion_dua ?? "—" },
    {
      label: impo ? "N° de oficialización" : "N° de permiso de embarque",
      value: operacion.numero_oficializacion ?? "—",
    },
    { label: "Fecha de oficialización", value: formatFecha(operacion.fecha_oficializacion) },
    ...(impo
      ? [
          { label: "Vencimiento de forzoso", value: formatFecha(operacion.vto_forzoso) },
          { label: "Fecha de entrega", value: formatFecha(operacion.fecha_entrega) },
        ]
      : [
          { label: "Fecha de precumplido", value: formatFecha(operacion.fecha_precumplido) },
          { label: "Fecha de cumplido", value: formatFecha(operacion.fecha_cumplido) },
        ]),
    { label: "Despacho", value: operacion.despacho ?? "—" },
    { label: "Intervenciones", value: operacion.intervinientes ?? "—" },
  ];

  const camposAnticipos = [
    { label: "Anticipo de gastos solicitado", value: ars(operacion.anticipo_solicitado) },
    { label: "Fecha de anticipo", value: formatFecha(operacion.fecha_anticipo) },
    { label: "Anticipo depositado", value: ars(operacion.anticipo_depositado) },
    { label: "Pendiente / Refuerzo", value: ars(operacion.pendiente) },
    { label: "Fecha de acreditación de gastos", value: formatFecha(operacion.fecha_deposito_anticipo) },
    { label: "Importe SIM solicitado", value: ars(operacion.mafia_solicitado) },
    { label: "Fecha depósito SIM", value: formatFecha(operacion.fecha_mafia_deposito) },
    { label: "SIM depositado", value: ars(operacion.mafia_depositado) },
    { label: "Fecha de acreditación de fondos de aduana (SIM)", value: formatFecha(operacion.fecha_deposito_mafia) },
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
            <Badge variant="secondary">{impo ? "Importación" : "Exportación"}</Badge>
            <Badge variant="outline" className={ESTADOS[operacion.estado].className}>
              {ESTADOS[operacion.estado].label}
            </Badge>
            <Link href={`/clientes/${operacion.cliente_id}`} className="text-sm text-primary hover:underline">
              Ver perfil del cliente →
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ImprimirTapaButton
              datos={{
                tipo: operacion.tipo ?? "importacion",
                orden: operacion.orden,
                cliente: operacion.cliente?.nombre ?? "",
                contraparte: operacion.exportador?.nombre ?? "",
                ordenCompra: operacion.orden_compra ?? "",
                docTransporte: operacion.awb_bl ?? "",
                fechaTransporte: impo ? operacion.fecha_arribo : (operacion.fecha_salida ?? null),
                forwarder: operacion.forwarder ?? "",
                descripcion: operacion.descripcion ?? "",
                intervenciones: operacion.intervinientes ?? "",
              }}
            />
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
                tipo: operacion.tipo ?? "importacion",
                procedencia: operacion.procedencia,
                destino: operacion.destino,
                nombre_transporte: operacion.nombre_transporte,
                vto_forzoso: operacion.vto_forzoso,
                fecha_salida: operacion.fecha_salida,
                cutoff_documental: operacion.cutoff_documental,
                cutoff_fisico: operacion.cutoff_fisico,
                cuit_ata: operacion.cuit_ata,
                fecha_precumplido: operacion.fecha_precumplido,
                fecha_cumplido: operacion.fecha_cumplido,
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
                fecha_orden: operacion.fecha_orden,
                peso_kg: operacion.peso_kg,
                fecha_factura: operacion.fecha_factura,
                orden_compra: operacion.orden_compra,
                envio_terminal: operacion.envio_terminal,
                oficializacion_dua: operacion.oficializacion_dua,
                tc: operacion.tc,
                gastos_fob: operacion.gastos_fob,
                flete: operacion.flete,
                seguro: operacion.seguro,
                ajuste: operacion.ajuste,
                base_imponible: operacion.base_imponible,
                ncm: operacion.ncm,
                intervinientes: operacion.intervinientes,
                numero_oficializacion: operacion.numero_oficializacion,
                fecha_oficializacion: operacion.fecha_oficializacion,
                fecha_entrega: operacion.fecha_entrega,
                anticipo_solicitado: operacion.anticipo_solicitado,
                fecha_anticipo: operacion.fecha_anticipo,
                anticipo_depositado: operacion.anticipo_depositado,
                pendiente: operacion.pendiente,
                fecha_deposito_anticipo: operacion.fecha_deposito_anticipo,
                mafia_solicitado: operacion.mafia_solicitado,
                fecha_mafia_deposito: operacion.fecha_mafia_deposito,
                mafia_depositado: operacion.mafia_depositado,
                fecha_deposito_mafia: operacion.fecha_deposito_mafia,
                despacho: operacion.despacho,
                facturas_exelsia: operacion.facturas_exelsia,
                fecha_factura_exelsia: operacion.fecha_factura_exelsia,
                comentarios: operacion.comentarios,
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
            <CardContent className="space-y-6">
              <GrupoCampos titulo="General" campos={camposGeneral} />
              <Separator />
              <GrupoCampos titulo="Comercial" campos={camposComercial} />
              <Separator />
              <GrupoCampos titulo="Aduana" campos={camposAduana} />
              <Separator />
              <GrupoCampos titulo="Anticipos / SIM" campos={camposAnticipos} />
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

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Mensajes con el cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <OperacionMensajes
              operacionId={operacion.id}
              mensajesIniciales={mensajes}
              usuarioActualId={user?.id ?? ""}
              pathARevalidar={`/operaciones/${operacion.id}`}
              permiteEditar
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
