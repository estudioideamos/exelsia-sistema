import { AppTopbar } from "@/components/app-topbar";
import { OperacionDialog } from "@/components/operacion-dialog";
import { OperacionesTable } from "@/components/operaciones-table";
import { ImportOperacionesButton } from "@/components/import-operaciones-button";
import { getOperacionesPagina, getResumenMensajesPorOperacion, normalizarOrden } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const TAMANOS_PAGINA = [10, 20, 30, 50, 100];
const TAMANO_DEFAULT = 20;

export default async function OperacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; size?: string; sort?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const size = TAMANOS_PAGINA.includes(Number(params.size)) ? Number(params.size) : TAMANO_DEFAULT;
  const pageSolicitada = Math.max(1, Math.floor(Number(params.page)) || 1);
  const orden = normalizarOrden(params.sort, params.dir);

  const supabase = await createClient();
  const [pagina, clientesRes, exportadoresRes, paisesRes, viasRes, incotermsRes, divisasRes] =
    await Promise.all([
      getOperacionesPagina(pageSolicitada, size, orden),
      supabase.from("clientes").select("id, nombre").order("nombre"),
      supabase.from("exportadores").select("id, nombre").order("nombre"),
      supabase.from("paises").select("id, nombre").order("nombre"),
      supabase.from("vias").select("id, nombre").order("nombre"),
      supabase.from("incoterms").select("id, nombre").order("nombre"),
      supabase.from("divisas").select("id, nombre").order("nombre"),
    ]);
  const mensajesMap = await getResumenMensajesPorOperacion(pagina.rows.map((o) => o.id));
  const mensajesPorOperacion = Object.fromEntries(mensajesMap);

  return (
    <>
      <AppTopbar
        title="Operaciones"
        description={`${pagina.total} operaciones registradas`}
      />
      <div className="flex-1 space-y-4 p-6">
        <OperacionesTable
          operaciones={pagina.rows}
          total={pagina.total}
          page={pagina.page}
          pageSize={size}
          sortKey={orden.sort}
          sortDir={orden.dir}
          mensajesPorOperacion={mensajesPorOperacion}
          accionesExtra={
            <>
              <ImportOperacionesButton />
              <OperacionDialog
                trigger={
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    Nueva operación
                  </Button>
                }
                clientes={clientesRes.data ?? []}
                exportadores={exportadoresRes.data ?? []}
                paises={paisesRes.data ?? []}
                vias={viasRes.data ?? []}
                incoterms={incotermsRes.data ?? []}
                divisas={divisasRes.data ?? []}
              />
            </>
          }
        />
      </div>
    </>
  );
}
