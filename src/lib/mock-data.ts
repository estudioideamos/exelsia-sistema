export type EstadoOperacion =
  | "en_curso"
  | "oficializada"
  | "despachada"
  | "mafia_solicitado"
  | "depositada"
  | "completada";

export const ESTADOS: Record<EstadoOperacion, { label: string; className: string }> = {
  en_curso: { label: "En curso", className: "bg-chart-4/15 text-chart-4 border-chart-4/30" },
  oficializada: { label: "Oficializada", className: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
  despachada: { label: "Despachada", className: "bg-primary/15 text-primary border-primary/30" },
  mafia_solicitado: { label: "MAFIA solicitado", className: "bg-chart-5/15 text-chart-5 border-chart-5/30" },
  depositada: { label: "Depositada", className: "bg-chart-3/15 text-chart-3 border-chart-3/30" },
  completada: { label: "Completada", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
};
