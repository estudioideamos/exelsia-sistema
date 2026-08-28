"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Loader2 } from "lucide-react";
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

type Notificacion = {
  id: string;
  estado_nuevo: EstadoOperacion;
  changed_at: string;
  operaciones: { id: string; orden: string; clientes: { nombre: string } | null } | null;
};

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
    supabase
      .from("operacion_estado_historial")
      .select("id, estado_nuevo, changed_at, operaciones(id, orden, clientes(nombre))")
      .order("changed_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as Notificacion[];
        setItems(rows);
        const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
        const count = rows.filter(
          (r) => !lastSeen || new Date(r.changed_at) > new Date(lastSeen)
        ).length;
        setUnread(count);
        setLoading(false);
      });
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
                key={item.id}
                href={`${basePath}/${item.operaciones?.id ?? ""}`}
                className="block rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                <p className="font-medium">
                  {item.operaciones?.orden ?? "Operación"} ·{" "}
                  <span className="text-muted-foreground">{ESTADOS[item.estado_nuevo]?.label}</span>
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.operaciones?.clientes?.nombre} · {tiempoRelativo(item.changed_at)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
