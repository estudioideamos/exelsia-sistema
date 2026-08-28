"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExportMenu } from "@/components/export-menu";
import { TablePagination, usePagination } from "@/components/table-pagination";
import { useSort, SortableTableHead } from "@/components/sortable-header";
import { ESTADOS } from "@/lib/mock-data";
import type { OperacionRow } from "@/lib/data";
import { formatFecha } from "@/lib/utils";
import { Plane, Ship as ShipIcon, Truck } from "lucide-react";

const viaIcon: Record<string, typeof Plane> = {
  Aéreo: Plane,
  Marítimo: ShipIcon,
  "Terrestre camión": Truck,
  "Terrestre tren": Truck,
};

const COLUMNAS_EXPORT = [
  { label: "Orden", key: "orden" },
  { label: "Cliente", key: "cliente" },
  { label: "Exportador", key: "exportador" },
  { label: "Origen", key: "origen" },
  { label: "Vía", key: "via" },
  { label: "AWB/BL", key: "awb_bl" },
  { label: "Arribo", key: "fecha_arribo" },
  { label: "FOB", key: "fob" },
  { label: "Estado", key: "estado" },
];

const SORT_ACCESSORS: Record<string, (op: OperacionRow) => string | number | null> = {
  orden: (op) => op.orden,
  cliente: (op) => op.cliente?.nombre ?? null,
  exportador: (op) => op.exportador?.nombre ?? null,
  origen: (op) => op.pais_origen?.nombre ?? null,
  via: (op) => op.via?.nombre ?? null,
  fecha_arribo: (op) => op.fecha_arribo,
  fob: (op) => op.fob,
  estado: (op) => ESTADOS[op.estado]?.label ?? op.estado,
};

export function OperacionesTable({ operaciones }: { operaciones: OperacionRow[] }) {
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());
  const { sorted, sortKey, sortDir, toggleSort } = useSort(operaciones, SORT_ACCESSORS);
  const pagination = usePagination(sorted);

  const todasSeleccionadas = operaciones.length > 0 && seleccionadas.size === operaciones.length;

  function toggleTodas() {
    setSeleccionadas(todasSeleccionadas ? new Set() : new Set(operaciones.map((o) => o.id)));
  }

  function toggleUna(id: string) {
    setSeleccionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filasExport = useMemo(() => {
    const base = seleccionadas.size > 0 ? sorted.filter((o) => seleccionadas.has(o.id)) : sorted;
    return base.map((op) => ({
      orden: op.orden,
      cliente: op.cliente?.nombre ?? "",
      exportador: op.exportador?.nombre ?? "",
      origen: op.pais_origen?.nombre ?? "",
      via: op.via?.nombre ?? "",
      awb_bl: op.awb_bl ?? "",
      fecha_arribo: formatFecha(op.fecha_arribo),
      fob: op.fob ?? "",
      estado: ESTADOS[op.estado]?.label ?? op.estado,
    }));
  }, [sorted, seleccionadas]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {seleccionadas.size > 0
            ? `${seleccionadas.size} seleccionada(s)`
            : `${operaciones.length} operaciones`}
        </p>
        <ExportMenu
          cantidad={seleccionadas.size}
          nombreArchivo="operaciones"
          titulo="Operaciones"
          columnas={COLUMNAS_EXPORT}
          filas={filasExport}
          disabled={operaciones.length === 0}
        />
      </div>

      <Card className="border-border/60 overflow-hidden py-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-10">
                  <Checkbox checked={todasSeleccionadas} onCheckedChange={toggleTodas} />
                </TableHead>
                <SortableTableHead label="Orden" sortKey="orden" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableTableHead label="Cliente" sortKey="cliente" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableTableHead label="Exportador" sortKey="exportador" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableTableHead label="Origen" sortKey="origen" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableTableHead label="Vía" sortKey="via" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <TableHead>AWB / BL</TableHead>
                <SortableTableHead label="Arribo" sortKey="fecha_arribo" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableTableHead label="FOB" sortKey="fob" activeKey={sortKey} dir={sortDir} onSort={toggleSort} className="text-right" />
                <SortableTableHead label="Estado" sortKey="estado" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {operaciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                    Todavía no hay operaciones cargadas.
                  </TableCell>
                </TableRow>
              ) : (
                pagination.paginated.map((op) => {
                  const Icon = (op.via?.nombre && viaIcon[op.via.nombre]) || ShipIcon;
                  return (
                    <TableRow key={op.id} className="group" data-state={seleccionadas.has(op.id) ? "selected" : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={seleccionadas.has(op.id)}
                          onCheckedChange={() => toggleUna(op.id)}
                        />
                      </TableCell>
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
                      <TableCell className="text-muted-foreground">{formatFecha(op.fecha_arribo)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {op.divisa?.nombre}{" "}
                        {Number(op.fob ?? 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
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
        <TablePagination
          page={pagination.page}
          setPage={pagination.setPage}
          pageSize={pagination.pageSize}
          setPageSize={pagination.setPageSize}
          pageCount={pagination.pageCount}
          total={pagination.total}
        />
      </Card>
    </div>
  );
}
