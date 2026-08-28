import Link from "next/link";
import { AppTopbar } from "@/components/app-topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getClientes } from "@/lib/data";
import { Plus, Mail, Phone } from "lucide-react";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <>
      <AppTopbar title="Clientes" description={`${clientes.length} clientes registrados`} />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-end">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </Button>
        </div>

        {clientes.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Todavía no hay clientes cargados.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {clientes.map((cliente) => {
              const operacionesActivas = Array.isArray(cliente.operaciones)
                ? (cliente.operaciones[0]?.count ?? 0)
                : 0;
              return (
                <Link key={cliente.id} href={`/clientes/${cliente.id}`}>
                  <Card className="h-full border-border/60 transition-colors hover:border-primary/40 hover:bg-accent/30">
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {initials(cliente.nombre)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{cliente.nombre}</p>
                            <p className="text-xs text-muted-foreground">CUIT {cliente.cuit ?? "—"}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{operacionesActivas} activas</Badge>
                      </div>
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{cliente.email_contacto ?? "Sin email"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          {cliente.telefono ?? "Sin teléfono"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
