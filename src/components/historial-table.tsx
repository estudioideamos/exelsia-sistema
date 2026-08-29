"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination, usePagination } from "@/components/table-pagination";
import { HorizontalScrollArea } from "@/components/horizontal-scroll-area";
import { ArrowRight } from "lucide-react";
import { ESTADOS } from "@/lib/mock-data";
import type { HistorialRow } from "@/lib/data";
import { formatFechaHora } from "@/lib/utils";

type Fila = HistorialRow & { changed_by_nombre: string };

export function HistorialTable({ historial }: { historial: Fila[] }) {
  const pagination = usePagination(historial);

  return (
    <Card className="animate-fade-in-up overflow-hidden border-border/60 py-0">
      <TablePagination
        position="top"
        page={pagination.page}
        setPage={pagination.setPage}
        pageSize={pagination.pageSize}
        setPageSize={pagination.setPageSize}
        pageCount={pagination.pageCount}
        total={pagination.total}
      />
      <HorizontalScrollArea>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Fecha</TableHead>
              <TableHead>Operación</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Cambio de estado</TableHead>
              <TableHead>Usuario</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historial.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Todavía no hay cambios de estado registrados.
                </TableCell>
              </TableRow>
            ) : (
              pagination.paginated.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatFechaHora(h.changed_at)}
                  </TableCell>
                  <TableCell>
                    {h.operacion ? (
                      <Link
                        href={`/operaciones/${h.operacion.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {h.operacion.orden}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {h.operacion?.cliente?.nombre ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {h.estado_anterior ? (
                        <Badge variant="outline" className={ESTADOS[h.estado_anterior].className}>
                          {ESTADOS[h.estado_anterior].label}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Creación</span>
                      )}
                      {h.estado_anterior ? (
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : null}
                      <Badge variant="outline" className={ESTADOS[h.estado_nuevo].className}>
                        {ESTADOS[h.estado_nuevo].label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{h.changed_by_nombre}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </HorizontalScrollArea>
      <TablePagination
        page={pagination.page}
        setPage={pagination.setPage}
        pageSize={pagination.pageSize}
        setPageSize={pagination.setPageSize}
        pageCount={pagination.pageCount}
        total={pagination.total}
      />
    </Card>
  );
}
