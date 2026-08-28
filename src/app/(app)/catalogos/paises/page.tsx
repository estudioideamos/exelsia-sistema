import { CatalogTable } from "@/components/catalog-table";

const paises = [
  "Argentina",
  "México",
  "USA",
  "Alemania",
  "Varios",
  "Corea del Sur",
  "Suiza",
  "Italia",
  "Malasia",
  "China",
  "España",
  "Taiwán",
  "Canadá",
  "Brasil",
].map((nombre, i) => ({ id: String(i), nombre }));

export default function PaisesPage() {
  return (
    <CatalogTable
      title="Países"
      description={`${paises.length} países registrados`}
      addLabel="Nuevo país"
      columns={[{ key: "nombre", label: "Nombre" }]}
      rows={paises}
    />
  );
}
