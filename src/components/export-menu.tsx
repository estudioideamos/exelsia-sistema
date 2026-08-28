"use client";

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
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { exportarExcel, exportarCsv, imprimirSeleccionados, type ColumnaExport } from "@/lib/exportar";

export function ExportMenu({
  disabled,
  cantidad,
  nombreArchivo,
  titulo,
  columnas,
  filas,
}: {
  disabled?: boolean;
  cantidad: number;
  nombreArchivo: string;
  titulo: string;
  columnas: ColumnaExport[];
  filas: Record<string, unknown>[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" disabled={disabled}>
            <Download className="h-4 w-4" />
            Exportar{cantidad > 0 ? ` (${cantidad})` : ""}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Formato</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => exportarExcel(nombreArchivo, columnas, filas)}>
            <FileSpreadsheet className="h-4 w-4" />
            Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportarCsv(nombreArchivo, columnas, filas)}>
            <FileText className="h-4 w-4" />
            CSV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => imprimirSeleccionados(titulo, columnas, filas)}>
            <Printer className="h-4 w-4" />
            Imprimir
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
