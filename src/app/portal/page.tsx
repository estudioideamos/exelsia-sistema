import Link from "next/link";
import { AppTopbar } from "@/components/app-topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EstadoDistributionChart } from "@/components/estado-distribution-chart";
import { EstadoCuentaButton } from "@/components/estado-cuenta-button";
import { PaginacionServidor } from "@/components/paginacion-servidor";
import { ESTADOS } from "@/lib/mock-data";
import {
  getCliente,
  getOperacionesPagina,
  getPerfilActual,
  getResumenOperaciones,
  ORDEN_OPERACIONES_DEFAULT,
} from "@/lib/data";
import { formatFecha } from "@/lib/utils";
import { Plane, Ship as ShipIcon, Truck, Package, Clock } from "lucide-react";

const viaIcon: Record<string, typeof Plane> = {
  Aéreo: Plane,
  Marítimo: ShipIcon,
  "Terrestre camión": Truck,
  "Terrestre tren": Truck,
};

const TAMANOS_PAGINA = [10, 20, 30, 50, 100];
const TAMANO_DEFAULT = 20;

export default async function PortalHomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; size?: string }>;
}) {
  const params = await searchParams;
  const size = TAMANOS_PAGINA.includes(Number(params.size)) ? Number(params.size) : TAMANO_DEFAULT;
  const pageSolicitada = Math.max(1, Math.floor(Number(params.page)) || 1);

  const { profile } = await getPerfilActual();
  const clienteId = profile?.cliente_id ?? null;

  const [resumen, pagina, cliente] = await Promise.all([
    clienteId ? getResumenOperaciones(clienteId) : Promise.resolve([]),
    clienteId
      ? getOperacionesPagina(pageSolicitada, size, ORDEN_OPERACIONES_DEFAULT, clienteId)
      : Promise.resolve({ rows: [], total: 0, page: 1 }),
    clienteId ? getCliente(clienteId) : Promise.resolve(null),
  ]);
  const operaciones = pagina.rows;

  const enCurso = resumen.filter((o) => o.estado !== "completada").length;
  const pendientes = resumen.filter(
    (o) => o.estado === "oficializada" || o.estado === "mafia_solicitado"
  ).length;
  const fobTotal = resumen.reduce((acc, o) => acc + Number(o.fob ?? 0), 0);

  const kpis = [
    { label: "Operaciones en curso", value: enCurso, icon: ShipIcon },
    { label: "Total de operaciones", value: resumen.length, icon: Package },
    { label: "Pendientes de despacho", value: pendientes, icon: Clock },
    {
      label: "FOB total",
      value: `USD ${fobTotal.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`,
      icon: Package,
    },
  ];

  return (
    <>
      <AppTopbar
        title="Mis operaciones"
        description="Seguimiento en tiempo real de tus envíos"
        notificationsBasePath="/portal/operaciones"
        includeClientesInSearch={false}
      >
        <EstadoCuentaButton
          clienteNombre={cliente?.nombre ?? "Cliente"}
          disabled={resumen.length === 0}
        />
      </AppTopbar>
      <div className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map(({ label, value, icon: Icon }, i) => (
            <Card
              key={label}
              className="animate-fade-in-up border-border/60 transition-transform hover:-translate-y-0.5"
              style={{ "--stagger": i } as React.CSSProperties}
            >
              <CardContent className="flex items-start justify-between pt-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-semibold tracking-tight">{value}</p>
                </div>
                <div className="animate-glow-pulse flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card
            className="animate-fade-in-up border-border/60 overflow-hidden py-0 xl:col-span-2"
            style={{ "--stagger": 4 } as React.CSSProperties}
          >
            <PaginacionServidor
              position="top"
              page={pagina.page}
              pageSize={size}
              total={pagina.total}
            />
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Orden</TableHead>
                    <TableHead>Exportador</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Vía</TableHead>
                    <TableHead>Arribo</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagina.total === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        Todavía no tenés operaciones registradas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    operaciones.map((op) => {
                      const Icon = (op.via?.nombre && viaIcon[op.via.nombre]) || ShipIcon;
                      return (
                        <TableRow key={op.id} className="group">
                          <TableCell>
                            <Link
                              href={`/portal/operaciones/${op.id}`}
                              className="font-medium text-foreground group-hover:text-primary"
                            >
                              {op.orden}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {op.exportador?.nombre ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {op.pais_origen?.nombre ?? "—"}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                              <Icon className="h-3.5 w-3.5" />
                              {op.via?.nombre ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatFecha(op.fecha_arribo)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={ESTADOS[op.estado].className}>
                              {ESTADOS[op.estado].label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            <PaginacionServidor page={pagina.page} pageSize={size} total={pagina.total} />
          </Card>

          <Card
            className="animate-fade-in-up border-border/60"
            style={{ "--stagger": 5 } as React.CSSProperties}
          >
            <CardHeader>
              <CardTitle className="text-base">Tus operaciones por estado</CardTitle>
            </CardHeader>
            <CardContent>
              <EstadoDistributionChart estados={resumen.map((o) => o.estado)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
