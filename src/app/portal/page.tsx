import Link from "next/link";
import { AppTopbar } from "@/components/app-topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ESTADOS } from "@/lib/mock-data";
import { getOperacionesPorCliente, getPerfilActual } from "@/lib/data";
import { Plane, Ship as ShipIcon, Truck } from "lucide-react";

const viaIcon: Record<string, typeof Plane> = {
  Aéreo: Plane,
  Marítimo: ShipIcon,
  "Terrestre camión": Truck,
  "Terrestre tren": Truck,
};

export default async function PortalHomePage() {
  const { profile } = await getPerfilActual();
  const operaciones = profile?.cliente_id
    ? await getOperacionesPorCliente(profile.cliente_id)
    : [];

  const enCurso = operaciones.filter((o) => o.estado !== "completada").length;

  return (
    <>
      <AppTopbar
        title="Mis operaciones"
        description="Seguimiento en tiempo real de tus envíos"
        notificationsBasePath="/portal/operaciones"
        includeClientesInSearch={false}
      />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="border-border/60">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Operaciones en curso</p>
              <p className="text-2xl font-semibold tracking-tight">{enCurso}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total de operaciones</p>
              <p className="text-2xl font-semibold tracking-tight">{operaciones.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 overflow-hidden py-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Orden</TableHead>
                  <TableHead>Exportador</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Vía</TableHead>
                  <TableHead>Arribo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Todavía no tenés operaciones registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  operaciones.map((op) => {
                    const Icon = (op.via?.nombre && viaIcon[op.via.nombre]) || ShipIcon;
                    return (
                      <TableRow key={op.id} className="group">
                        <TableCell>
                          <Link
                            href={`/portal/operaciones/${op.id}`}
                            className="font-medium text-foreground group-hover:text-primary"
                          >
                            {op.orden}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {op.exportador?.nombre ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {op.pais_origen?.nombre ?? "—"}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            <Icon className="h-3.5 w-3.5" />
                            {op.via?.nombre ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {op.fecha_arribo ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={ESTADOS[op.estado].className}>
                            {ESTADOS[op.estado].label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </>
  );
}
