import { CatalogTable } from "@/components/catalog-table";
import { createClient } from "@/lib/supabase/server";

export default async function ViasPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("vias").select("id, nombre").order("nombre");
  const vias = data ?? [];

  return (
    <CatalogTable
      title="Vías"
      description={`${vias.length} vías registradas`}
      addLabel="Nueva vía"
      columns={[{ key: "nombre", label: "Nombre" }]}
      rows={vias}
    />
  );
}
