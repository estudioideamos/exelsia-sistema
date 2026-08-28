import { CatalogTable } from "@/components/catalog-table";

const incoterms = ["FOB", "CIF", "EXW", "DAP", "DAT", "CFR", "FCA", "CIP", "CPT", "FAS"].map(
  (nombre, i) => ({ id: String(i), nombre })
);

export default function IncotermsPage() {
  return (
    <CatalogTable
      title="Incoterms"
      description={`${incoterms.length} incoterms registrados`}
      addLabel="Nuevo incoterm"
      columns={[{ key: "nombre", label: "Nombre" }]}
      rows={incoterms}
    />
  );
}
