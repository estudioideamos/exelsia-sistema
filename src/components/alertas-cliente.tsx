"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Info, Loader2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ESTADOS } from "@/lib/mock-data";
import type { AlertaCliente, DestinatarioCliente } from "@/lib/data";
import {
  agregarDestinatario,
  eliminarDestinatario,
  setAlertaCliente,
} from "@/app/(app)/clientes/[id]/actions";

const clave = (estado: string, destinatarioId: string) => `${estado}|${destinatarioId}`;

export function AlertasCliente({
  clienteId,
  emailContacto,
  destinatarios,
  alertas,
}: {
  clienteId: string;
  emailContacto: string | null;
  destinatarios: DestinatarioCliente[];
  alertas: AlertaCliente[];
}) {
  const [activas, setActivas] = useState(
    () => new Set(alertas.map((a) => clave(a.estado, a.destinatario_id)))
  );
  const [email, setEmail] = useState("");
  const [etiqueta, setEtiqueta] = useState("");
  const [isPending, startTransition] = useTransition();

  const [alertasOrigen, setAlertasOrigen] = useState(alertas);
  if (alertasOrigen !== alertas) {
    setAlertasOrigen(alertas);
    setActivas(new Set(alertas.map((a) => clave(a.estado, a.destinatario_id))));
  }

  function agregar(emailNuevo: string, etiquetaNueva: string) {
    startTransition(async () => {
      try {
        await agregarDestinatario(clienteId, emailNuevo, etiquetaNueva);
        setEmail("");
        setEtiqueta("");
        toast.success("Casilla agregada");
      } catch (err) {
        toast.error("No se pudo agregar la casilla", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    agregar(email, etiqueta);
  }

  function quitar(destinatarioId: string) {
    startTransition(async () => {
      try {
        await eliminarDestinatario(clienteId, destinatarioId);
        toast.success("Casilla eliminada");
      } catch (err) {
        toast.error("No se pudo eliminar la casilla", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  function alternar(estado: string, destinatarioId: string, activo: boolean) {
    const k = clave(estado, destinatarioId);
    setActivas((prev) => {
      const next = new Set(prev);
      if (activo) next.add(k);
      else next.delete(k);
      return next;
    });

    startTransition(async () => {
      try {
        await setAlertaCliente(clienteId, estado, destinatarioId, activo);
      } catch (err) {
        setActivas((prev) => {
          const next = new Set(prev);
          if (activo) next.delete(k);
          else next.add(k);
          return next;
        });
        toast.error("No se pudo guardar el cambio", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="space-y-1 text-muted-foreground">
          {destinatarios.length === 0 ? (
            <p>
              Este cliente todavía no tiene casillas propias: todos los avisos de cambio de etapa
              se envían a su mail de contacto
              {emailContacto ? <strong className="text-foreground"> ({emailContacto})</strong> : null}.
              Agregá casillas para elegir quién recibe cada etapa.
            </p>
          ) : (
            <p>
              Cada aviso se envía solo a las casillas tildadas para esa etapa. Si una etapa no
              tiene ninguna tildada, ese cliente no recibe aviso al llegar a ella.
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <label htmlFor="alerta-email" className="text-xs font-medium text-muted-foreground">
            Email
          </label>
          <Input
            id="alerta-email"
            type="email"
            required
            placeholder="administracion@cliente.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <label htmlFor="alerta-etiqueta" className="text-xs font-medium text-muted-foreground">
            Rol (opcional)
          </label>
          <Input
            id="alerta-etiqueta"
            placeholder="Administración, Logística..."
            value={etiqueta}
            onChange={(e) => setEtiqueta(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Agregar casilla
        </Button>
      </form>

      {destinatarios.length === 0 && emailContacto ? (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => agregar(emailContacto, "Contacto principal")}
        >
          Usar el mail de contacto como primera casilla
        </Button>
      ) : null}

      {destinatarios.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="min-w-44">Etapa</TableHead>
                {destinatarios.map((d) => (
                  <TableHead key={d.id} className="min-w-48">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{d.email}</p>
                        {d.etiqueta ? (
                          <p className="truncate text-xs font-normal text-muted-foreground">
                            {d.etiqueta}
                          </p>
                        ) : null}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                              disabled={isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar esta casilla?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {d.email} dejará de recibir avisos de este cliente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => quitar(d.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(ESTADOS).map(([estado, { label, className }]) => (
                <TableRow key={estado}>
                  <TableCell>
                    <Badge variant="outline" className={className}>
                      {label}
                    </Badge>
                  </TableCell>
                  {destinatarios.map((d) => (
                    <TableCell key={d.id}>
                      <Checkbox
                        checked={activas.has(clave(estado, d.id))}
                        onCheckedChange={(checked) => alternar(estado, d.id, checked === true)}
                        aria-label={`${label} para ${d.email}`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}
