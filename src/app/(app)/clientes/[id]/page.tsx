import Link from "next/link";
import { notFound } from "next/navigation";
import { AppTopbar } from "@/components/app-topbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ESTADOS, clientes, operaciones } from "@/lib/mock-data";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  UploadCloud,
  FileText,
  Download,
  Save,
} from "lucide-react";

const archivosDemo = [
  { nombre: "Factura_comercial_I1106.pdf", tipo: "Factura", fecha: "07/03/2015", tamano: "412 KB" },
  { nombre: "Packing_list_I1106.pdf", tipo: "Packing list", fecha: "07/03/2015", tamano: "180 KB" },
  { nombre: "Certificado_origen.pdf", tipo: "Certificado", fecha: "02/03/2015", tamano: "96 KB" },
];

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = clientes.find((c) => c.id === id);
  if (!cliente) notFound();

  const operacionesCliente = operaciones.filter((o) => o.clienteId === id);

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
                  CUIT {cliente.cuit} · Cód. Import {cliente.codImport} · {cliente.pais}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit">
              {cliente.operacionesActivas} operaciones activas
            </Badge>
          </CardContent>
        </Card>

        <Tabs defaultValue="perfil" className="space-y-4">
          <TabsList>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="operaciones">
              Operaciones ({operacionesCliente.length})
            </TabsTrigger>
            <TabsTrigger value="archivos">Archivos ({archivosDemo.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Datos de contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Razón social</Label>
                    <Input defaultValue={cliente.nombre} />
                  </div>
                  <div className="space-y-2">
                    <Label>CUIT</Label>
                    <Input defaultValue={cliente.cuit} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Email de contacto
                    </Label>
                    <Input defaultValue={cliente.emailContacto} />
                    <p className="text-xs text-muted-foreground">
                      A esta dirección se envían los avisos automáticos de cambio de estado.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> Teléfono
                    </Label>
                    <Input defaultValue={cliente.telefono} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Dirección
                    </Label>
                    <Input defaultValue={cliente.direccion} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" /> Notas internas
                    </Label>
                    <Input defaultValue={cliente.notas ?? ""} placeholder="Sin notas" />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button size="sm">
                    <Save className="h-4 w-4" />
                    Guardar cambios
                  </Button>
                </div>
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
                          <TableCell className="text-muted-foreground">{op.exportador}</TableCell>
                          <TableCell className="text-muted-foreground">{op.origen}</TableCell>
                          <TableCell className="text-muted-foreground">{op.fechaArribo}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {op.divisa} {op.fob.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Documentación del cliente</CardTitle>
                <Button size="sm" variant="outline">
                  <UploadCloud className="h-4 w-4" />
                  Subir archivo
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center justify-center rounded-xl border-2 border-dashed border-border/70 px-6 py-8 text-center">
                  <div className="space-y-1">
                    <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Arrastrá archivos acá o hacé click en &quot;Subir archivo&quot;
                    </p>
                  </div>
                </div>
                <div className="divide-y divide-border/60">
                  {archivosDemo.map((archivo) => (
                    <div key={archivo.nombre} className="flex items-center justify-between gap-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{archivo.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {archivo.tipo} · {archivo.fecha} · {archivo.tamano}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
