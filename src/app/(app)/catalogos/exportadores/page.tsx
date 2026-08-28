import { CatalogTable } from "@/components/catalog-table";

const exportadores = [
  { nombre: "Sigma Aldrich International GmbH", cuit: "ALE/ITA/SUIZ", cod: "101" },
  { nombre: "Dongshing Diamond Industrial Co. Ltd.", cuit: "COREA", cod: "102" },
  { nombre: "Katun Corporation", cuit: "USA", cod: "103" },
  { nombre: "Dellas S.P.A.", cuit: "ITA", cod: "104" },
  { nombre: "Rotoplas SA de CV", cuit: "MEX", cod: "100" },
  { nombre: "TG Medical SDN BHD", cuit: "MALASIA", cod: "106" },
].map((e, i) => ({ id: String(i), ...e }));

export default function ExportadoresPage() {
  return (
    <CatalogTable
      title="Exportadores"
      description={`${exportadores.length} exportadores registrados`}
      addLabel="Nuevo exportador"
      columns={[
        { key: "nombre", label: "Nombre" },
        { key: "cuit", label: "País / CUIT" },
        { key: "cod", label: "Código" },
      ]}
      rows={exportadores}
    />
  );
}
