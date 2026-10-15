"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2, Printer } from "lucide-react";
import { exportarExcel, exportarCsv, imprimirSeleccionados, type ColumnaExport } from "@/lib/exportar";

export function ExportMenu({
  disabled,
  cantidad,
  nombreArchivo,
  titulo,
  columnas,
  filas,
  obtenerFilas,
}: {
  disabled?: boolean;
  cantidad: number;
  nombreArchivo: string;
  titulo: string;
  columnas: ColumnaExport[];
  filas?: Record<string, unknown>[];
  obtenerFilas?: () => Promise<Record<string, unknown>[]>;
}) {
  const [cargando, setCargando] = useState(false);

  async function exportar(accion: (filas: Record<string, unknown>[]) => void | Promise<void>) {
    setCargando(true);
    try {
      const datos = filas ?? (obtenerFilas ? await obtenerFilas() : []);
      await accion(datos);
    } catch (err) {
      toast.error("No se pudo exportar", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setCargando(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" disabled={disabled || cargando}>
            {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportar{cantidad > 0 ? ` (${cantidad})` : ""}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Formato</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => exportar((f) => exportarExcel(nombreArchivo, columnas, f))}>
            <FileSpreadsheet className="h-4 w-4" />
            Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportar((f) => exportarCsv(nombreArchivo, columnas, f))}>
            <FileText className="h-4 w-4" />
            CSV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => exportar((f) => imprimirSeleccionados(titulo, columnas, f))}>
            <Printer className="h-4 w-4" />
            Imprimir
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
