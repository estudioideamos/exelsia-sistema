import { ESTADOS, type EstadoOperacion } from "@/lib/mock-data";

const ORDEN_ESTADOS: EstadoOperacion[] = [
  "en_curso",
  "oficializada",
  "despachada",
  "mafia_solicitado",
  "depositada",
  "completada",
];

const BARRA_POR_ESTADO: Record<EstadoOperacion, string> = {
  en_curso: "bg-chart-4",
  oficializada: "bg-chart-2",
  despachada: "bg-primary",
  mafia_solicitado: "bg-chart-5",
  depositada: "bg-chart-3",
  completada: "bg-emerald-500",
};

export function EstadoDistributionChart({ estados }: { estados: EstadoOperacion[] }) {
  const total = estados.length;
  const conteos = ORDEN_ESTADOS.map((estado) => ({
    estado,
    cantidad: estados.filter((e) => e === estado).length,
  })).filter((c) => c.cantidad > 0);

  if (total === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Todavía no hay operaciones para graficar.
      </p>
    );
  }

  return (
    <div className="space-y-3.5">
      {conteos.map(({ estado, cantidad }, i) => {
        const porcentaje = Math.round((cantidad / total) * 100);
        return (
          <div key={estado} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{ESTADOS[estado].label}</span>
              <span className="text-muted-foreground">
                {cantidad} · {porcentaje}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`animate-count-bar h-full rounded-full ${BARRA_POR_ESTADO[estado]}`}
                style={{ width: `${porcentaje}%`, "--stagger": i } as React.CSSProperties}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
