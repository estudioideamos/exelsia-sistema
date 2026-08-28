import { CatalogTable } from "@/components/catalog-table";

const divisas = ["USD", "EURO", "GBP"].map((nombre, i) => ({ id: String(i), nombre }));

export default function DivisasPage() {
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
