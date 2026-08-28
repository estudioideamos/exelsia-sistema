import { AppTopbar } from "@/components/app-topbar";
import { HistorialTable } from "@/components/historial-table";
import { getHistorial } from "@/lib/data";

export default async function HistorialPage() {
  const historial = await getHistorial();

  return (
    <>
      <AppTopbar
        title="Historial de auditoría"
        description="Registro de todos los cambios de estado de las operaciones"
      />
      <div className="flex-1 space-y-6 p-6">
        <HistorialTable historial={historial} />
      </div>
    </>
  );
}
