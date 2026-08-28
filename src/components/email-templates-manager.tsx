"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

      <Tabs defaultValue={ORDEN_ESTADOS[0]} className="space-y-4">
        <TabsList className="flex-wrap">
          {ORDEN_ESTADOS.map((estado) => (
            <TabsTrigger key={estado} value={estado} className="gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: `var(--chart-${(ORDEN_ESTADOS.indexOf(estado) % 5) + 1})` }}
              />
              {ESTADOS[estado].label}
            </TabsTrigger>
          ))}
        </TabsList>

        {ORDEN_ESTADOS.map((estado) => {
          const plantilla = porEstado.get(estado);
          return (
            <TabsContent key={estado} value={estado}>
              {plantilla ? (
                <EmailTemplateEditor
                  id={plantilla.id}
                  asuntoInicial={plantilla.asunto}
                  cuerpoInicial={plantilla.cuerpo}
                />
              ) : (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No hay una plantilla configurada para &quot;{ESTADOS[estado].label}&quot;.
                </p>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
