import { CatalogTable } from "@/components/catalog-table";
import { createClient } from "@/lib/supabase/server";

const ISO_BY_NOMBRE: Record<string, string> = {
  Argentina: "ar",
  México: "mx",
  USA: "us",
  Alemania: "de",
  "Corea del Sur": "kr",
  Suiza: "ch",
  Italia: "it",
  Malasia: "my",
  China: "cn",
  España: "es",
  Taiwán: "tw",
  Canadá: "ca",
  Brasil: "br",
  Colombia: "co",
  "Reino Unido": "gb",
  Turquía: "tr",
  Japón: "jp",
  India: "in",
  "Países Bajos": "nl",
  Polonia: "pl",
  Vietnam: "vn",
  Túnez: "tn",
  Francia: "fr",
  Rumania: "ro",
  Bélgica: "be",
  Chile: "cl",
  "Corea Republicana": "kp",
  Egipto: "eg",
  Israel: "il",
  Paraguay: "py",
  Eslovenia: "si",
  Sudáfrica: "za",
  Ecuador: "ec",
  Nicaragua: "ni",
  "Federación Rusa": "ru",
  Somalia: "so",
  "Nueva Zelanda": "nz",
};

export default async function PaisesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("paises").select("id, nombre").order("nombre");
  const paises = (data ?? []).map((pais) => {
    const iso = ISO_BY_NOMBRE[pais.nombre];
    return {
      ...pais,
      _display_nombre: (
        <span className="flex items-center gap-2.5">
          {iso ? (
            <span className={`fi fi-${iso} rounded-[3px] shadow-sm`} />
          ) : (
            <span className="flex h-[0.75em] w-[1em] items-center justify-center rounded-[3px] bg-muted text-[10px]">
              🌐
            </span>
          )}
          {pais.nombre}
        </span>
      ),
    };
  });

  return (
    <CatalogTable
      title="Países"
      description={`${paises.length} países registrados`}
      addLabel="Nuevo país"
      table="paises"
      columns={[{ key: "nombre", label: "Nombre" }]}
      rows={paises}
    />
  );
}
