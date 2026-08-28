import { CatalogTable } from "@/components/catalog-table";
import { createClient } from "@/lib/supabase/server";

export default async function ExportadoresPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exportadores")
    .select("id, nombre, cuit, cod")
    .order("nombre");
  const exportadores = data ?? [];

  return (
    <CatalogTable
      title="Exportadores"
      description={`${exportadores.length} exportadores registrados`}
      addLabel="Nuevo exportador"
      table="exportadores"
      columns={[
        { key: "nombre", label: "Nombre" },
        { key: "cuit", label: "País / CUIT" },
        { key: "cod", label: "Código" },
      ]}
      rows={exportadores}
    />
  );
}
