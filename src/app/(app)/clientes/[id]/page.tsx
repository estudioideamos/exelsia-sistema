import Link from "next/link";
import { notFound } from "next/navigation";
import { AppTopbar } from "@/components/app-topbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientePerfilForm } from "@/components/cliente-perfil-form";
import { ArchivosCliente } from "@/components/archivos-cliente";
import { AlertasCliente } from "@/components/alertas-cliente";
import { ESTADOS } from "@/lib/mock-data";
import {
  getAlertasCliente,
  getArchivosCliente,
  getCliente,
  getDestinatariosCliente,
  getOperacionesPagina,
  ORDEN_OPERACIONES_DEFAULT,
} from "@/lib/data";
import { formatFecha } from "@/lib/utils";

// Las más recientes; el listado completo (con paginación) está en Operaciones.
const OPERACIONES_VISIBLES = 20;

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await getCliente(id);
  if (!cliente) notFound();

  const [operacionesPagina, archivosCliente, destinatarios, alertas] = await Promise.all([
    getOperacionesPagina(1, OPERACIONES_VISIBLES, ORDEN_OPERACIONES_DEFAULT, id),
    getArchivosCliente(id),
    getDestinatariosCliente(id),
    getAlertasCliente(id),
  ]);

  return (
    <>
      <AppTopbar title="Perfil de cliente" description={cliente.nombre} />
      <div className="flex-1 space-y-6 p-6">
        <Card className="border-border/60">
          <CardContent className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
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
            </div>
            <Badge variant="secondary" className="w-fit">
              {operacionesPagina.total} operaciones
            </Badge>
          </CardContent>
        </Card>

        <Tabs defaultValue="perfil" className="space-y-4">
          <TabsList>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="operaciones">
              Operaciones ({operacionesPagina.total})
            </TabsTrigger>
            <TabsTrigger value="archivos">Archivos ({archivosCliente.length})</TabsTrigger>
            <TabsTrigger value="avisos">Avisos ({destinatarios.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Datos de contacto</CardTitle>
              </CardHeader>
              <CardContent>
                <ClientePerfilForm cliente={cliente} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operaciones">
            <Card className="border-border/60 overflow-hidden py-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Orden</TableHead>
                      <TableHead>Exportador</TableHead>
                      <TableHead>Origen</TableHead>
                      <TableHead>Arribo</TableHead>
                      <TableHead className="text-right">FOB</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operacionesPagina.total === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                          Este cliente no tiene operaciones registradas todavía.
                        </TableCell>
                      </TableRow>
                    ) : (
                      operacionesPagina.rows.map((op) => (
                        <TableRow key={op.id}>
                          <TableCell>
                            <Link href={`/operaciones/${op.id}`} className="font-medium hover:text-primary">
                              {op.orden}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{op.exportador?.nombre ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{op.pais_origen?.nombre ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{formatFecha(op.fecha_arribo)}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {op.divisa?.nombre} {Number(op.fob ?? 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={ESTADOS[op.estado].className}>
                              {ESTADOS[op.estado].label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {operacionesPagina.total > operacionesPagina.rows.length ? (
                <div className="border-t border-border/60 px-4 py-3 text-sm text-muted-foreground">
                  Mostrando las {operacionesPagina.rows.length} más recientes de{" "}
                  {operacionesPagina.total}.{" "}
                  <Link
                    href={`/operaciones?cliente=${cliente.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    Ver todas las operaciones de este cliente
                  </Link>
                </div>
              ) : null}
            </Card>
          </TabsContent>

          <TabsContent value="archivos">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Documentación del cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <ArchivosCliente clienteId={cliente.id} archivosIniciales={archivosCliente} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="avisos">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Avisos por cambio de etapa</CardTitle>
              </CardHeader>
              <CardContent>
                <AlertasCliente
                  clienteId={cliente.id}
                  emailContacto={cliente.email_contacto}
                  destinatarios={destinatarios}
                  alertas={alertas}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
