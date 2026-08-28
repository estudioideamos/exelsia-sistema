"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ExportMenu } from "@/components/export-menu";
import { TablePagination, usePagination } from "@/components/table-pagination";
import { Mail, Phone } from "lucide-react";

type Cliente = {
  id: string;
  nombre: string;
  cuit: string | null;
  email_contacto: string | null;
  telefono: string | null;
  direccion?: string | null;
  cod_import?: string | null;
  operaciones?: { count: number }[] | null;
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const COLUMNAS_EXPORT = [
  { label: "Nombre", key: "nombre" },
  { label: "CUIT", key: "cuit" },
  { label: "Cód. Import", key: "cod_import" },
  { label: "Email", key: "email" },
  { label: "Teléfono", key: "telefono" },
  { label: "Dirección", key: "direccion" },
];

export function ClientesGrid({ clientes }: { clientes: Cliente[] }) {
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const pagination = usePagination(clientes);

  function toggle(id: string) {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filasExport = useMemo(() => {
    const base =
      seleccionados.size > 0 ? clientes.filter((c) => seleccionados.has(c.id)) : clientes;
    return base.map((c) => ({
      nombre: c.nombre,
      cuit: c.cuit ?? "",
      cod_import: c.cod_import ?? "",
      email: c.email_contacto ?? "",
      telefono: c.telefono ?? "",
      direccion: c.direccion ?? "",
    }));
  }, [clientes, seleccionados]);

  if (clientes.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Todavía no hay clientes cargados.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {seleccionados.size > 0 ? `${seleccionados.size} seleccionado(s)` : `${clientes.length} clientes`}
        </p>
        <ExportMenu
          cantidad={seleccionados.size}
          nombreArchivo="clientes"
          titulo="Clientes"
          columnas={COLUMNAS_EXPORT}
          filas={filasExport}
        />
      </div>

      <div className="rounded-lg border border-border/60">
        <TablePagination
          position="top"
          page={pagination.page}
          setPage={pagination.setPage}
          pageSize={pagination.pageSize}
          setPageSize={pagination.setPageSize}
          pageCount={pagination.pageCount}
          total={pagination.total}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pagination.paginated.map((cliente) => {
          const operacionesActivas = Array.isArray(cliente.operaciones)
            ? (cliente.operaciones[0]?.count ?? 0)
            : 0;
          const marcado = seleccionados.has(cliente.id);
          return (
            <Card
              key={cliente.id}
              className={
                marcado
                  ? "relative h-full border-primary/50 bg-accent/20 transition-colors"
                  : "relative h-full border-border/60 transition-colors hover:border-primary/40 hover:bg-accent/30"
              }
            >
              <div
                className="absolute right-3 top-3 z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Checkbox checked={marcado} onCheckedChange={() => toggle(cliente.id)} />
              </div>
              <Link href={`/clientes/${cliente.id}`}>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-start justify-between gap-3 pr-8">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {initials(cliente.nombre)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{cliente.nombre}</p>
                        <p className="text-xs text-muted-foreground">CUIT {cliente.cuit ?? "—"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{cliente.email_contacto ?? "Sin email"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        {cliente.telefono ?? "Sin teléfono"}
                      </div>
                    </div>
                    <Badge variant="secondary">{operacionesActivas} activas</Badge>
                  </div>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      <div className="rounded-lg border border-border/60">
        <TablePagination
          page={pagination.page}
          setPage={pagination.setPage}
          pageSize={pagination.pageSize}
          setPageSize={pagination.setPageSize}
          pageCount={pagination.pageCount}
          total={pagination.total}
        />
      </div>
    </div>
  );
}
