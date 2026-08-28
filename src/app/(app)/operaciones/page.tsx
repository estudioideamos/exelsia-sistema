import Link from "next/link";
import { AppTopbar } from "@/components/app-topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ESTADOS } from "@/lib/mock-data";
import { getOperaciones } from "@/lib/data";
import { Plane, Ship as ShipIcon, Truck, Plus } from "lucide-react";

const viaIcon: Record<string, typeof Plane> = {
  Aéreo: Plane,
  Marítimo: ShipIcon,
  "Terrestre camión": Truck,
  "Terrestre tren": Truck,
};

export default async function OperacionesPage() {
  const operaciones = await getOperaciones();

  return (
    <>
      <AppTopbar
        title="Operaciones"
        description={`${operaciones.length} operaciones registradas`}
      />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-end">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nueva operación
          </Button>
        </div>

        <Card className="border-border/60 overflow-hidden py-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Orden</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Exportador</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Vía</TableHead>
                  <TableHead>AWB / BL</TableHead>
                  <TableHead>Arribo</TableHead>
                  <TableHead className="text-right">FOB</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                      Todavía no hay operaciones cargadas.
                    </TableCell>
                  </TableRow>
                ) : (
                  operaciones.map((op) => {
                    const Icon = (op.via?.nombre && viaIcon[op.via.nombre]) || ShipIcon;
                    return (
                      <TableRow key={op.id} className="group">
                        <TableCell>
                          <Link
                            href={`/operaciones/${op.id}`}
                            className="font-medium text-foreground group-hover:text-primary"
                          >
                            {op.orden}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[220px] truncate">
                          <Link
                            href={`/clientes/${op.cliente_id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {op.cliente?.nombre ?? "—"}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
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
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {op.awb_bl ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {op.fecha_arribo ?? "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {op.divisa?.nombre} {Number(op.fob ?? 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
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
