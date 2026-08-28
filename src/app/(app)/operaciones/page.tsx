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
import { ESTADOS, operaciones } from "@/lib/mock-data";
import { Plane, Ship as ShipIcon, Truck, Plus } from "lucide-react";

const viaIcon = {
  Aéreo: Plane,
  Marítimo: ShipIcon,
  Terrestre: Truck,
};

export default function OperacionesPage() {
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
                {operaciones.map((op) => {
                  const Icon = viaIcon[op.via];
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
                        <Link href={`/clientes/${op.clienteId}`} className="hover:text-primary hover:underline">
                          {op.cliente}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {op.exportador}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{op.origen}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Icon className="h-3.5 w-3.5" />
                          {op.via}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {op.awbBl}
                      </TableCell>
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
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </>
  );
}
