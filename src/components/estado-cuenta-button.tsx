"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { exportarEstadoCuenta } from "@/lib/estado-cuenta";
import { obtenerOperacionesEstadoCuenta } from "@/app/portal/actions";

export function EstadoCuentaButton({
  clienteNombre,
  disabled,
}: {
  clienteNombre: string;
  disabled?: boolean;
}) {
  const [cargando, setCargando] = useState(false);

  async function generar() {
    // Se abre en el clic para que el navegador no la bloquee mientras se piden los datos.
    const ventana = window.open("", "_blank");
    setCargando(true);
    try {
      const operaciones = await obtenerOperacionesEstadoCuenta();
      exportarEstadoCuenta(clienteNombre, operaciones, ventana);
    } catch (err) {
      ventana?.close();
      toast.error("No se pudo generar el estado de cuenta", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setCargando(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={generar} disabled={disabled || cargando}>
      {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      <span className="hidden sm:inline">Estado de cuenta</span>
      <span className="sr-only sm:hidden">Estado de cuenta</span>
    </Button>
  );
}
