import { CatalogTable } from "@/components/catalog-table";

const paises = [
  { nombre: "Argentina", iso: "ar" },
  { nombre: "México", iso: "mx" },
  { nombre: "USA", iso: "us" },
  { nombre: "Alemania", iso: "de" },
  { nombre: "Varios", iso: null },
  { nombre: "Corea del Sur", iso: "kr" },
  { nombre: "Suiza", iso: "ch" },
  { nombre: "Italia", iso: "it" },
  { nombre: "Malasia", iso: "my" },
  { nombre: "China", iso: "cn" },
  { nombre: "España", iso: "es" },
  { nombre: "Taiwán", iso: "tw" },
  { nombre: "Canadá", iso: "ca" },
  { nombre: "Brasil", iso: "br" },
].map((pais, i) => ({ id: String(i), ...pais }));

export default function PaisesPage() {
  return (
    <CatalogTable
      title="Países"
      description={`${paises.length} países registrados`}
      addLabel="Nuevo país"
      columns={[
        {
          key: "nombre",
          label: "Nombre",
          render: (row) => (
            <span className="flex items-center gap-2.5">
              {row.iso ? (
                <span className={`fi fi-${row.iso} rounded-[3px] shadow-sm`} />
              ) : (
                <span className="flex h-[0.75em] w-[1em] items-center justify-center rounded-[3px] bg-muted text-[10px]">
                  🌐
                </span>
              )}
              {row.nombre}
            </span>
          ),
        },
      ]}
      rows={paises}
    />
  );
}
