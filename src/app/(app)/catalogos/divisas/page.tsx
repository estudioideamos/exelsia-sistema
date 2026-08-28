import { CatalogTable } from "@/components/catalog-table";
import { createClient } from "@/lib/supabase/server";

export default async function DivisasPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("divisas").select("id, nombre").order("nombre");
  const divisas = data ?? [];

  return (
    <CatalogTable
      title="Divisas"
      description={`${divisas.length} divisas registradas`}
      addLabel="Nueva divisa"
      columns={[{ key: "nombre", label: "Nombre" }]}
      rows={divisas}
    />
  );
}
