"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { EliminarSeleccionadosButton } from "@/components/eliminar-seleccionados-button";
import { HorizontalScrollArea } from "@/components/horizontal-scroll-area";
import { TablePagination } from "@/components/table-pagination";
import { SortableTableHead, type SortDir } from "@/components/sortable-header";
import { ESTADOS } from "@/lib/mock-data";
import type { OperacionRow, ResumenMensajes } from "@/lib/data";
import { formatFecha } from "@/lib/utils";
import { eliminarOperaciones, obtenerFilasExportOperaciones } from "@/app/(app)/operaciones/actions";
import { Plane, Ship as ShipIcon, Truck, MessageCircle } from "lucide-react";

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

export function OperacionesTable({
  operaciones,
  total,
  page,
  pageSize,
  sortKey,
  sortDir,
  clienteId,
  mensajesPorOperacion = {},
  accionesExtra,
}: {
  operaciones: OperacionRow[];
  total: number;
  page: number;
  pageSize: number;
  sortKey: string;
  sortDir: SortDir;
  clienteId?: string;
  mensajesPorOperacion?: Record<string, ResumenMensajes>;
  accionesExtra?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const todasSeleccionadas =
    operaciones.length > 0 && operaciones.every((o) => seleccionadas.has(o.id));

  function irA(cambios: { page?: number; size?: number; sort?: string; dir?: SortDir }) {
    const params = new URLSearchParams({
      page: String(cambios.page ?? page),
      size: String(cambios.size ?? pageSize),
      sort: cambios.sort ?? sortKey,
      dir: cambios.dir ?? sortDir,
    });
    if (clienteId) params.set("cliente", clienteId);
    setSeleccionadas(new Set());
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function toggleSort(key: string) {
    if (key === sortKey) irA({ page: 1, dir: sortDir === "asc" ? "desc" : "asc" });
    else irA({ page: 1, sort: key, dir: "asc" });
  }

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

  const filasSeleccionadas = useMemo(
    () =>
      operaciones
        .filter((o) => seleccionadas.has(o.id))
        .map((op) => ({
          orden: op.orden,
          cliente: op.cliente?.nombre ?? "",
          exportador: op.exportador?.nombre ?? "",
          origen: op.pais_origen?.nombre ?? "",
          via: op.via?.nombre ?? "",
          awb_bl: op.awb_bl ?? "",
          fecha_arribo: formatFecha(op.fecha_arribo),
          fob: op.fob ?? "",
          estado: ESTADOS[op.estado]?.label ?? op.estado,
        })),
    [operaciones, seleccionadas]
  );

  const paginacion = {
    page,
    setPage: (p: number) => irA({ page: p }),
    pageSize,
    setPageSize: (size: number) => irA({ page: 1, size }),
    pageCount,
    total,
    mostrarTodo: false,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {seleccionadas.size > 0
            ? `${seleccionadas.size} seleccionada(s)`
            : `${total} operaciones`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <EliminarSeleccionadosButton
            ids={[...seleccionadas]}
            onEliminar={eliminarOperaciones}
            entidadLabel="operación"
          />
          <ExportMenu
            cantidad={seleccionadas.size}
            nombreArchivo="operaciones"
            titulo="Operaciones"
            columnas={COLUMNAS_EXPORT}
            filas={seleccionadas.size > 0 ? filasSeleccionadas : undefined}
            obtenerFilas={() => obtenerFilasExportOperaciones(sortKey, sortDir, clienteId)}
            disabled={total === 0}
          />
          {accionesExtra}
        </div>
      </div>

      <Card
        className={`border-border/60 overflow-hidden py-0 transition-opacity ${isPending ? "opacity-60" : ""}`}
      >
        <TablePagination position="top" {...paginacion} />
        <HorizontalScrollArea>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-10">
                  <Checkbox checked={todasSeleccionadas} onCheckedChange={toggleTodas} />
                </TableHead>
                <SortableTableHead label="Orden" sortKey="orden" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <TableHead className="w-10 text-center">
                  <MessageCircle className="mx-auto h-3.5 w-3.5" />
                </TableHead>
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
              {total === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="py-10 text-center text-muted-foreground">
                    Todavía no hay operaciones cargadas.
                  </TableCell>
                </TableRow>
              ) : (
                operaciones.map((op) => {
                  const Icon = (op.via?.nombre && viaIcon[op.via.nombre]) || ShipIcon;
                  const resumenMsjs = mensajesPorOperacion[op.id];
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
                      <TableCell className="text-center">
                        {resumenMsjs ? (
                          <span
                            className={
                              resumenMsjs.ultimoAutorEsCliente
                                ? "inline-flex items-center gap-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary"
                                : "inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                            }
                            title={
                              resumenMsjs.ultimoAutorEsCliente
                                ? "El cliente escribió, esperando respuesta"
                                : "Sin mensajes nuevos del cliente"
                            }
                          >
                            <MessageCircle className="h-3 w-3" />
                            {resumenMsjs.cantidad}
                          </span>
                        ) : null}
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
        </HorizontalScrollArea>
        <TablePagination {...paginacion} />
      </Card>
    </div>
  );
}
