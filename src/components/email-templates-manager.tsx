"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmailTemplateEditor } from "@/components/email-template-editor";
import { ESTADOS, type EstadoOperacion } from "@/lib/mock-data";
import { Mail } from "lucide-react";

type Plantilla = {
  id: string;
  estado: EstadoOperacion;
  asunto: string;
  cuerpo: string;
};

const ORDEN_ESTADOS: EstadoOperacion[] = [
  "en_curso",
  "oficializada",
  "despachada",
  "mafia_solicitado",
  "depositada",
  "completada",
];

export function EmailTemplatesManager({ plantillas }: { plantillas: Plantilla[] }) {
  const porEstado = new Map(plantillas.map((p) => [p.estado, p]));
  const [estado, setEstado] = useState<EstadoOperacion>(ORDEN_ESTADOS[0]);
  const plantilla = porEstado.get(estado);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Mail className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">Avisos por email</h2>
          <p className="text-sm text-muted-foreground">
            Cada estado de una operación tiene su propio email. Elegí un estado para editar el
            aviso que reciben tus clientes cuando una operación pasa a esa etapa.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Select value={estado} onValueChange={(v) => setEstado(v as EstadoOperacion)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Elegir estado">
              {(value: EstadoOperacion) => (
                <span className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: `var(--chart-${(ORDEN_ESTADOS.indexOf(value) % 5) + 1})`,
                    }}
                  />
                  {ESTADOS[value]?.label}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ORDEN_ESTADOS.map((e) => (
              <SelectItem key={e} value={e}>
                <span className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: `var(--chart-${(ORDEN_ESTADOS.indexOf(e) % 5) + 1})` }}
                  />
                  {ESTADOS[e].label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {plantilla ? (
        <EmailTemplateEditor
          key={plantilla.id}
          id={plantilla.id}
          asuntoInicial={plantilla.asunto}
          cuerpoInicial={plantilla.cuerpo}
        />
      ) : (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No hay una plantilla configurada para &quot;{ESTADOS[estado].label}&quot;.
        </p>
      )}
    </div>
  );
}
