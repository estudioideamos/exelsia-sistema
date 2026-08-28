import { CatalogTable } from "@/components/catalog-table";
import { createClient } from "@/lib/supabase/server";
import { Plane, Ship, Truck, TrainFront, Route } from "lucide-react";

const ICON_BY_NOMBRE: Record<string, typeof Plane> = {
  "Aéreo": Plane,
  "Marítimo": Ship,
  "Terrestre camión": Truck,
  "Terrestre tren": TrainFront,
};

export default async function ViasPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("vias").select("id, nombre").order("nombre");
  const vias = (data ?? []).map((via) => {
    const Icon = ICON_BY_NOMBRE[via.nombre] ?? Route;
    return {
      ...via,
      _display_nombre: (
        <span className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-3.5 w-3.5" />
          </span>
          {via.nombre}
        </span>
      ),
    };
  });

  return (
    <CatalogTable
      title="Vías"
      description={`${vias.length} vías registradas`}
      addLabel="Nueva vía"
      table="vias"
      columns={[{ key: "nombre", label: "Nombre" }]}
      rows={vias}
    />
  );
}
