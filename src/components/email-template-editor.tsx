"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EMAIL_VARIABLES, interpolarPlantilla } from "@/lib/email-variables";
import { guardarPlantillaEmail } from "@/app/(app)/configuracion/actions";

const VALORES_DEMO: Record<string, string> = {
  "{{cliente}}": "Sigma Aldrich de Argentina SRL",
  "{{orden}}": "I1106",
  "{{estado}}": "Despachada",
  "{{exportador}}": "Sigma Aldrich International GmbH",
  "{{origen}}": "Alemania",
  "{{via}}": "Aéreo",
  "{{incoterm}}": "FCA",
  "{{divisa}}": "USD",
  "{{fob}}": "4.453,12",
  "{{awb_bl}}": "NUE272465",
  "{{fecha_arribo}}": "07/03/2015",
  "{{forwarder}}": "PANALPINA",
  "{{factura}}": "8941556458",
};

export function EmailTemplateEditor({
  id,
  asuntoInicial,
  cuerpoInicial,
}: {
  id: string;
  asuntoInicial: string;
  cuerpoInicial: string;
}) {
  const [asunto, setAsunto] = useState(asuntoInicial);
  const [cuerpo, setCuerpo] = useState(cuerpoInicial);
  const [isPending, startTransition] = useTransition();
  const cuerpoRef = useRef<HTMLTextAreaElement>(null);

  function insertarVariable(token: string) {
    const textarea = cuerpoRef.current;
    if (!textarea) {
      setCuerpo((prev) => prev + token);
      return;
    }
    const start = textarea.selectionStart ?? cuerpo.length;
    const end = textarea.selectionEnd ?? cuerpo.length;
    const nuevo = cuerpo.slice(0, start) + token + cuerpo.slice(end);
    setCuerpo(nuevo);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + token.length, start + token.length);
    });
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await guardarPlantillaEmail(id, asunto, cuerpo);
        toast.success("Plantilla guardada");
      } catch (err) {
        toast.error("No se pudo guardar", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Contenido del email</CardTitle>
        <CardDescription>Hacé click en una variable para insertarla en el cuerpo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="asunto">Asunto</Label>
          <Input id="asunto" value={asunto} onChange={(e) => setAsunto(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Variables disponibles</Label>
          <div className="flex flex-wrap gap-1.5">
            {EMAIL_VARIABLES.map((v) => (
              <Badge
                key={v.token}
                variant="outline"
                className="cursor-pointer border-primary/30 bg-primary/5 font-mono text-[11px] text-primary hover:bg-primary/15"
                onClick={() => insertarVariable(v.token)}
                title={v.label}
              >
                {v.token}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuerpo">Cuerpo (HTML)</Label>
          <Textarea
            id="cuerpo"
            ref={cuerpoRef}
            value={cuerpo}
            onChange={(e) => setCuerpo(e.target.value)}
            rows={10}
            className="font-mono text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label>Vista previa</Label>
          <div className="rounded-lg border border-border/60 bg-card p-4">
            <p className="mb-2 text-xs text-muted-foreground">
              Asunto: <span className="text-foreground">{interpolarPlantilla(asunto, VALORES_DEMO)}</span>
            </p>
            <div
              className="rounded-md bg-white p-3 text-black"
              dangerouslySetInnerHTML={{ __html: interpolarPlantilla(cuerpo, VALORES_DEMO) }}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar plantilla
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
