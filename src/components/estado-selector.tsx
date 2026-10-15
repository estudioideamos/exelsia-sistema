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
        const { emailEnviado, destinatarios, modo, archivos } = await actualizarEstadoOperacion(
          operacionId,
          value
        );

        if (emailEnviado) {
          toast.success(`Estado actualizado a "${ESTADOS[value].label}"`, {
            description:
              (destinatarios > 1
                ? `Se envió el aviso a ${destinatarios} casillas de ${cliente}`
                : `Se envió un email a ${cliente} avisando el cambio de estado`) +
              (archivos > 0 ? ` con ${archivos} documento${archivos > 1 ? "s" : ""}.` : "."),
            icon: <Mail className="h-4 w-4" />,
          });
        } else {
          toast.success(`Estado actualizado a "${ESTADOS[value].label}"`, {
            description:
              destinatarios > 0
                ? "No se pudo enviar el email (falta configurar Resend)."
                : modo === "configurado"
                  ? "Este cliente no tiene avisos activados para esta etapa."
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
