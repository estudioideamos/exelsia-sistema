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
import { ESTADOS } from "@/lib/mock-data";
import { getArchivosCliente, getCliente, getOperacionesPorCliente } from "@/lib/data";

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

  const [operacionesCliente, archivosCliente] = await Promise.all([
    getOperacionesPorCliente(id),
    getArchivosCliente(id),
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
              {operacionesCliente.length} operaciones
            </Badge>
          </CardContent>
        </Card>

        <Tabs defaultValue="perfil" className="space-y-4">
          <TabsList>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="operaciones">
              Operaciones ({operacionesCliente.length})
            </TabsTrigger>
            <TabsTrigger value="archivos">Archivos ({archivosCliente.length})</TabsTrigger>
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
                    {operacionesCliente.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                          Este cliente no tiene operaciones registradas todavía.
                        </TableCell>
                      </TableRow>
                    ) : (
                      operacionesCliente.map((op) => (
                        <TableRow key={op.id}>
                          <TableCell>
                            <Link href={`/operaciones/${op.id}`} className="font-medium hover:text-primary">
                              {op.orden}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{op.exportador?.nombre ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{op.pais_origen?.nombre ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{op.fecha_arribo ?? "—"}</TableCell>
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
        </Tabs>
      </div>
    </>
  );
}
