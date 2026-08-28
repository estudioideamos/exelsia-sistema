"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { exportarEstadoCuenta } from "@/lib/estado-cuenta";
import type { EstadoOperacion } from "@/lib/mock-data";

type OperacionResumen = {
  orden: string;
  exportador: string;
  origen: string;
  via: string;
  fecha_arribo: string | null;
  divisa: string;
  fob: number | null;
  estado: EstadoOperacion;
};

export function EstadoCuentaButton({
  clienteNombre,
  operaciones,
}: {
  clienteNombre: string;
  operaciones: OperacionResumen[];
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => exportarEstadoCuenta(clienteNombre, operaciones)}
      disabled={operaciones.length === 0}
    >
      <FileDown className="h-4 w-4" />
      Estado de cuenta
    </Button>
  );
}
