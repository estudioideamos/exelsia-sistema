import { CatalogTable } from "@/components/catalog-table";
import { createClient } from "@/lib/supabase/server";

export default async function IncotermsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("incoterms").select("id, nombre").order("nombre");
  const incoterms = data ?? [];

  return (
    <CatalogTable
      title="Incoterms"
      description={`${incoterms.length} incoterms registrados`}
      addLabel="Nuevo incoterm"
      table="incoterms"
      columns={[{ key: "nombre", label: "Nombre" }]}
      rows={incoterms}
    />
  );
}
