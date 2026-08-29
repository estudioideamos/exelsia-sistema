"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ESTADOS, type EstadoOperacion } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

const LAST_SEEN_KEY = "exelsia_notif_last_seen";

type NotifEstado = {
  tipo: "estado";
  id: string;
  fecha: string;
  operacionId: string;
  orden: string;
  clienteNombre: string | null;
  estado: EstadoOperacion;
};

type NotifMensaje = {
  tipo: "mensaje";
  id: string;
  fecha: string;
  operacionId: string;
  orden: string;
  clienteNombre: string | null;
  texto: string;
};

type Notificacion = NotifEstado | NotifMensaje;

function tiempoRelativo(fecha: string) {
  const diffMs = Date.now() - new Date(fecha).getTime();
  const minutos = Math.floor(diffMs / 60000);
  if (minutos < 1) return "recién";
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias} d`;
}

export function NotificationsBell({ basePath }: { basePath: string }) {
  const [items, setItems] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    async function cargar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const [historialRes, mensajesRes] = await Promise.all([
        supabase
          .from("operacion_estado_historial")
          .select("id, estado_nuevo, changed_at, operaciones(id, orden, clientes(nombre))")
          .order("changed_at", { ascending: false })
          .limit(8),
        supabase
          .from("operacion_mensajes")
          .select("id, texto, created_at, autor_id, operaciones(id, orden, clientes(nombre))")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      const notifsEstado: NotifEstado[] = ((historialRes.data ?? []) as unknown as {
        id: string;
        estado_nuevo: EstadoOperacion;
        changed_at: string;
        operaciones: { id: string; orden: string; clientes: { nombre: string } | null } | null;
      }[]).map((r) => ({
        tipo: "estado",
        id: r.id,
        fecha: r.changed_at,
        operacionId: r.operaciones?.id ?? "",
        orden: r.operaciones?.orden ?? "Operación",
        clienteNombre: r.operaciones?.clientes?.nombre ?? null,
        estado: r.estado_nuevo,
      }));

      const notifsMensaje: NotifMensaje[] = ((mensajesRes.data ?? []) as unknown as {
        id: string;
        texto: string;
        created_at: string;
        autor_id: string;
        operaciones: { id: string; orden: string; clientes: { nombre: string } | null } | null;
      }[])
        .filter((m) => m.autor_id !== user?.id)
        .map((m) => ({
          tipo: "mensaje",
          id: m.id,
          fecha: m.created_at,
          operacionId: m.operaciones?.id ?? "",
          orden: m.operaciones?.orden ?? "Operación",
          clienteNombre: m.operaciones?.clientes?.nombre ?? null,
          texto: m.texto,
        }));

      const rows = [...notifsEstado, ...notifsMensaje]
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 10);

      setItems(rows);
      const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
      const count = rows.filter((r) => !lastSeen || new Date(r.fecha) > new Date(lastSeen)).length;
      setUnread(count);
      setLoading(false);
    }

    cargar();
  }, []);

  function handleOpenChange(open: boolean) {
    if (open) {
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
      setUnread(0);
    }
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {unread > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {unread}
              </span>
            ) : null}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            No hay notificaciones todavía.
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {items.map((item) => (
              <Link
                key={`${item.tipo}-${item.id}`}
                href={`${basePath}/${item.operacionId}`}
                className="block rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                {item.tipo === "estado" ? (
                  <>
                    <p className="font-medium">
                      {item.orden} ·{" "}
                      <span className="text-muted-foreground">{ESTADOS[item.estado]?.label}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.clienteNombre} · {tiempoRelativo(item.fecha)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="flex items-center gap-1.5 font-medium">
                      <MessageCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {item.orden} · Nuevo mensaje
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.texto} · {tiempoRelativo(item.fecha)}
                    </p>
                  </>
                )}
              </Link>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
