import { AppTopbar } from "@/components/app-topbar";
import { NuevoClienteDialog } from "@/components/nuevo-cliente-dialog";
import { ClientesGrid } from "@/components/clientes-grid";
import { ImportClientesButton } from "@/components/import-clientes-button";
import { getClientes } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function ClientesPage() {
  const supabase = await createClient();
  const [clientes, { data: paises }] = await Promise.all([
    getClientes(),
    supabase.from("paises").select("id, nombre").order("nombre"),
  ]);

  return (
    <>
      <AppTopbar title="Clientes" description={`${clientes.length} clientes registrados`} />
      <div className="flex-1 space-y-4 p-6">
        <ClientesGrid
          clientes={clientes}
          accionesExtra={
            <>
              <ImportClientesButton />
              <NuevoClienteDialog paises={paises ?? []} />
            </>
          }
        />
      </div>
    </>
  );
}
