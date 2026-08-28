"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESTADOS, type EstadoOperacion } from "@/lib/mock-data";

export function EstadoSelector({
  estadoActual,
  cliente,
}: {
  estadoActual: EstadoOperacion;
  cliente: string;
}) {
  const [estado, setEstado] = useState(estadoActual);

  function handleChange(value: string) {
    const nuevo = value as EstadoOperacion;
    setEstado(nuevo);
    // TODO: server action -> actualizarEstadoOperacion() + envío de email vía Resend.
    toast.success(`Estado actualizado a "${ESTADOS[nuevo].label}"`, {
      description: `Se envió un email a ${cliente} avisando el cambio de estado.`,
      icon: <Mail className="h-4 w-4" />,
    });
  }

  return (
    <Select value={estado} onValueChange={handleChange}>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Cambiar estado">
          {(value: EstadoOperacion) => ESTADOS[value]?.label ?? "Cambiar estado"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ESTADOS).map(([key, { label }]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
