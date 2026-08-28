"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, MessageCircle } from "lucide-react";
import { formatFechaHora, cn } from "@/lib/utils";
import { enviarMensajeOperacion } from "@/app/actions/mensajes";
import type { MensajeOperacion } from "@/lib/data";

export function OperacionMensajes({
  operacionId,
  mensajesIniciales,
  usuarioActualId,
  pathARevalidar,
}: {
  operacionId: string;
  mensajesIniciales: MensajeOperacion[];
  usuarioActualId: string;
  pathARevalidar: string;
}) {
  const [mensajes, setMensajes] = useState(mensajesIniciales);
  const [texto, setTexto] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valor = texto.trim();
    if (!valor) return;

    startTransition(async () => {
      try {
        await enviarMensajeOperacion(operacionId, valor, pathARevalidar);
        setMensajes((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            operacion_id: operacionId,
            autor_id: usuarioActualId,
            texto: valor,
            created_at: new Date().toISOString(),
            autor_nombre: "Vos",
            autor_rol: "cliente",
          },
        ]);
        setTexto("");
      } catch (err) {
        toast.error("No se pudo enviar", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  return (
    <div className="space-y-4">
      {mensajes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
          <MessageCircle className="h-6 w-6" />
          Todavía no hay mensajes sobre esta operación.
        </div>
      ) : (
        <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
          {mensajes.map((m) => {
            const esPropio = m.autor_id === usuarioActualId;
            return (
              <div
                key={m.id}
                className={cn("flex flex-col gap-1", esPropio ? "items-end" : "items-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    esPropio
                      ? "bg-primary text-primary-foreground"
                      : m.autor_rol === "admin"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-foreground"
                  )}
                >
                  {m.texto}
                </div>
                <p className="px-1 text-[11px] text-muted-foreground">
                  {esPropio ? "Vos" : m.autor_nombre} · {formatFechaHora(m.created_at)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribí una pregunta o comentario..."
          className="min-h-16 resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isPending || !texto.trim()}>
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Enviar
          </Button>
        </div>
      </form>
    </div>
  );
}
