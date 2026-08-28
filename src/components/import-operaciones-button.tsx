"use client";

import { useRouter } from "next/navigation";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImportDialog } from "@/components/import-dialog";
import { importarOperaciones } from "@/app/(app)/operaciones/actions";

const COLUMNAS = [
  { label: "Orden", key: "orden" },
  { label: "Cliente", key: "cliente" },
  { label: "Exportador", key: "exportador" },
  { label: "Origen", key: "origen" },
  { label: "Vía", key: "via" },
  { label: "AWB/BL", key: "awb_bl" },
  { label: "Arribo", key: "fecha_arribo" },
  { label: "FOB", key: "fob" },
  { label: "Estado", key: "estado" },
];

export function ImportOperacionesButton() {
  const router = useRouter();

  return (
    <ImportDialog
      trigger={
        <Button variant="outline" size="sm">
          <FileUp className="h-4 w-4" />
          Importar
        </Button>
      }
      titulo="Importar operaciones"
      columnas={COLUMNAS}
      onImportar={async (filas) => {
        const res = await importarOperaciones(filas);
        router.refresh();
        return res as unknown as { errores: string[] } & Record<string, number>;
      }}
    />
  );
}
