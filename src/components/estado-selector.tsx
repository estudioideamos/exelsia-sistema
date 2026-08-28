"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Mail, MailWarning } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESTADOS, type EstadoOperacion } from "@/lib/mock-data";
import { actualizarEstadoOperacion } from "@/app/(app)/operaciones/[id]/actions";

export function EstadoSelector({
  operacionId,
  estadoActual,
  cliente,
}: {
  operacionId: string;
  estadoActual: EstadoOperacion;
  cliente: string;
}) {
  const [estado, setEstado] = useState(estadoActual);
  const [isPending, startTransition] = useTransition();

  function handleChange(value: EstadoOperacion | null) {
    if (!value || value === estado) return;
    const anterior = estado;
    setEstado(value);

    startTransition(async () => {
      try {
        const { emailEnviado, tieneEmailContacto } = await actualizarEstadoOperacion(
          operacionId,
          value
        );

        if (emailEnviado) {
          toast.success(`Estado actualizado a "${ESTADOS[value].label}"`, {
            description: `Se envió un email a ${cliente} avisando el cambio de estado.`,
            icon: <Mail className="h-4 w-4" />,
          });
        } else {
          toast.success(`Estado actualizado a "${ESTADOS[value].label}"`, {
            description: tieneEmailContacto
              ? "No se pudo enviar el email (falta configurar Resend)."
              : "El cliente no tiene un email de contacto cargado.",
            icon: <MailWarning className="h-4 w-4" />,
          });
        }
      } catch (err) {
        setEstado(anterior);
        toast.error("No se pudo actualizar el estado", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  return (
    <Select value={estado} onValueChange={handleChange} disabled={isPending}>
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
