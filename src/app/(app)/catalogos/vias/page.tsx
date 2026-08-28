import { CatalogTable } from "@/components/catalog-table";

const vias = ["Aéreo", "Marítimo", "Terrestre camión", "Terrestre tren"].map((nombre, i) => ({
  id: String(i),
  nombre,
}));

export default function ViasPage() {
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
