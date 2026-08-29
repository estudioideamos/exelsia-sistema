"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, MessageCircle, Pencil, Check, X, Trash2 } from "lucide-react";
import { formatFechaHora, cn } from "@/lib/utils";
import {
  enviarMensajeOperacion,
  editarMensajeOperacion,
  borrarMensajeOperacion,
} from "@/app/actions/mensajes";
import type { MensajeOperacion } from "@/lib/data";

function MensajeBubble({
  mensaje,
  esPropio,
  puedeEditar,
  pathARevalidar,
  onEditado,
  onBorrado,
}: {
  mensaje: MensajeOperacion;
  esPropio: boolean;
  puedeEditar: boolean;
  pathARevalidar: string;
  onEditado: (texto: string) => void;
  onBorrado: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(mensaje.texto);
  const [isPending, startTransition] = useTransition();
  const [borrando, setBorrando] = useState(false);

  function borrar() {
    if (!window.confirm("¿Borrar este mensaje?")) return;
    setBorrando(true);
    startTransition(async () => {
      try {
        await borrarMensajeOperacion(mensaje.id, pathARevalidar);
        onBorrado();
      } catch (err) {
        toast.error("No se pudo borrar", {
          description: err instanceof Error ? err.message : undefined,
        });
        setBorrando(false);
      }
    });
  }

  function guardar() {
    const valor = texto.trim();
    if (!valor || valor === mensaje.texto) {
      setEditando(false);
      return;
    }
    startTransition(async () => {
      try {
        await editarMensajeOperacion(mensaje.id, valor, pathARevalidar);
        onEditado(valor);
        setEditando(false);
      } catch (err) {
        toast.error("No se pudo editar", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  if (editando) {
    return (
      <div className="w-full max-w-[85%] space-y-1.5">
        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="min-h-14 resize-none text-sm"
          autoFocus
        />
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => {
              setTexto(mensaje.texto);
              setEditando(false);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
          <Button type="button" size="icon" className="h-6 w-6" onClick={guardar} disabled={isPending}>
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative max-w-[85%] rounded-lg px-3 py-2 text-sm",
        esPropio
          ? "bg-primary text-primary-foreground"
          : mensaje.autor_rol === "admin"
            ? "bg-accent text-accent-foreground"
            : "bg-muted text-foreground"
      )}
    >
      {borrando ? <span className="opacity-50">{mensaje.texto}</span> : mensaje.texto}
      {puedeEditar && esPropio ? (
        <div className="absolute -left-14 top-1/2 flex -translate-y-1/2 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="text-muted-foreground hover:text-foreground"
            title="Editar mensaje"
            disabled={borrando}
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={borrar}
            className="text-muted-foreground hover:text-destructive"
            title="Borrar mensaje"
            disabled={borrando}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function OperacionMensajes({
  operacionId,
  mensajesIniciales,
  usuarioActualId,
  pathARevalidar,
  permiteEditar = false,
}: {
  operacionId: string;
  mensajesIniciales: MensajeOperacion[];
  usuarioActualId: string;
  pathARevalidar: string;
  permiteEditar?: boolean;
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
            autor_rol: permiteEditar ? "admin" : "cliente",
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
        <div className="max-h-80 space-y-3 overflow-y-auto pr-1 pl-6">
          {mensajes.map((m) => {
            const esPropio = m.autor_id === usuarioActualId;
            return (
              <div
                key={m.id}
                className={cn("flex flex-col gap-1", esPropio ? "items-end" : "items-start")}
              >
                <MensajeBubble
                  mensaje={m}
                  esPropio={esPropio}
                  puedeEditar={permiteEditar}
                  pathARevalidar={pathARevalidar}
                  onEditado={(nuevoTexto) =>
                    setMensajes((prev) =>
                      prev.map((x) => (x.id === m.id ? { ...x, texto: nuevoTexto } : x))
                    )
                  }
                  onBorrado={() => setMensajes((prev) => prev.filter((x) => x.id !== m.id))}
                />
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
