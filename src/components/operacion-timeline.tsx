import { Circle } from "lucide-react";
import { ESTADOS, type EstadoOperacion } from "@/lib/mock-data";
import { formatFechaHora } from "@/lib/utils";

type EventoTimeline = {
  id: string;
  estado_anterior: EstadoOperacion | null;
  estado_nuevo: EstadoOperacion;
  changed_at: string;
  changed_by_nombre: string;
};

export function OperacionTimeline({
  eventos,
  creadaEn,
}: {
  eventos: EventoTimeline[];
  creadaEn: string;
}) {
  const items = [
    {
      id: "creacion",
      label: "Operación creada",
      className: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30",
      fecha: creadaEn,
      autor: null as string | null,
    },
    ...eventos.map((e) => ({
      id: e.id,
      label: ESTADOS[e.estado_nuevo].label,
      className: ESTADOS[e.estado_nuevo].className,
      fecha: e.changed_at,
      autor: e.changed_by_nombre,
    })),
  ];

  return (
    <ol className="space-y-0">
      {items.map((item, i) => (
        <li key={item.id} className="relative flex gap-3 pb-6 last:pb-0">
          {i < items.length - 1 ? (
            <span className="absolute left-[7px] top-4 h-full w-px bg-border" />
          ) : null}
          <Circle className="mt-1 h-3.5 w-3.5 shrink-0 fill-primary text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-xs text-muted-foreground">
              {formatFechaHora(item.fecha)}
              {item.autor ? ` · ${item.autor}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
