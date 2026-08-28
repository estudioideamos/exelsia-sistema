"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Lock } from "lucide-react";
import { guardarNotasInternas } from "@/app/(app)/operaciones/[id]/actions";

export function NotasInternas({
  operacionId,
  notasIniciales,
}: {
  operacionId: string;
  notasIniciales: string | null;
}) {
  const [texto, setTexto] = useState(notasIniciales ?? "");
  const [guardando, setGuardando] = useState(false);
  const [modificado, setModificado] = useState(false);

  async function guardar() {
    setGuardando(true);
    try {
      await guardarNotasInternas(operacionId, texto);
      toast.success("Notas guardadas");
      setModificado(false);
    } catch (err) {
      toast.error("No se pudieron guardar", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        Solo visibles para el equipo, nunca para el cliente
      </p>
      <Textarea
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setModificado(true);
        }}
        placeholder="Notas internas sobre esta operación..."
        className="min-h-24 resize-y text-sm"
      />
      {modificado ? (
        <Button size="sm" onClick={guardar} disabled={guardando}>
          {guardando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Guardar notas
        </Button>
      ) : null}
    </div>
  );
}
