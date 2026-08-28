import Link from "next/link";
import { AppTopbar } from "@/components/app-topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ESTADOS, clientes, operaciones } from "@/lib/mock-data";
import { ArrowUpRight, Package, Ship, Users, Clock } from "lucide-react";

const kpis = [
  {
    label: "Operaciones en curso",
    value: operaciones.filter((o) => o.estado !== "completada").length,
    icon: Ship,
    hint: "+2 esta semana",
  },
  {
    label: "Clientes activos",
    value: clientes.length,
    icon: Users,
    hint: "Todos con operaciones abiertas",
  },
  {
    label: "Pendientes de despacho",
    value: operaciones.filter((o) => o.estado === "oficializada" || o.estado === "mafia_solicitado").length,
    icon: Clock,
    hint: "Requieren seguimiento",
  },
  {
    label: "FOB total del mes",
    value: `USD ${operaciones.reduce((acc, o) => acc + o.fob, 0).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`,
    icon: Package,
    hint: "6 operaciones",
  },
];

export default function DashboardPage() {
  const recientes = operaciones.slice(0, 5);

  return (
    <>
      <AppTopbar title="Dashboard" description="Resumen general de la operatoria" />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map(({ label, value, icon: Icon, hint }) => (
            <Card key={label} className="border-border/60">
              <CardContent className="flex items-start justify-between pt-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-semibold tracking-tight">{value}</p>
                  <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="border-border/60 xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Operaciones recientes</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={
                  <Link href="/operaciones">
                    Ver todas <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                }
              />
            </CardHeader>
            <CardContent className="space-y-1">
              {recientes.map((op) => (
                <Link
                  key={op.id}
                  href={`/operaciones/${op.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-accent/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{op.orden} · {op.cliente}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {op.exportador} · {op.origen} · {op.via}
                    </p>
                  </div>
                  <Badge variant="outline" className={ESTADOS[op.estado].className}>
                    {ESTADOS[op.estado].label}
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Clientes con más actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clientes
                .slice()
                .sort((a, b) => b.operacionesActivas - a.operacionesActivas)
                .map((cliente) => (
                  <Link
                    key={cliente.id}
                    href={`/clientes/${cliente.id}`}
                    className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-accent/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{cliente.nombre}</p>
                      <p className="text-xs text-muted-foreground">CUIT {cliente.cuit}</p>
                    </div>
                    <Badge variant="secondary">{cliente.operacionesActivas} activas</Badge>
                  </Link>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
