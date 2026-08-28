import { AppTopbar } from "@/components/app-topbar";
import { OperacionDialog } from "@/components/operacion-dialog";
import { OperacionesTable } from "@/components/operaciones-table";
import { getOperaciones } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function OperacionesPage() {
  const supabase = await createClient();
  const [operaciones, clientesRes, exportadoresRes, paisesRes, viasRes, incotermsRes, divisasRes] =
    await Promise.all([
      getOperaciones(),
      supabase.from("clientes").select("id, nombre").order("nombre"),
      supabase.from("exportadores").select("id, nombre").order("nombre"),
      supabase.from("paises").select("id, nombre").order("nombre"),
      supabase.from("vias").select("id, nombre").order("nombre"),
      supabase.from("incoterms").select("id, nombre").order("nombre"),
      supabase.from("divisas").select("id, nombre").order("nombre"),
    ]);

  return (
    <>
      <AppTopbar
        title="Operaciones"
        description={`${operaciones.length} operaciones registradas`}
      />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-end">
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
        </div>

        <OperacionesTable operaciones={operaciones} />
      </div>
    </>
  );
}
