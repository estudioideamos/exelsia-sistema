"use client";

import { useRouter } from "next/navigation";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImportDialog } from "@/components/import-dialog";
import { importarClientes } from "@/app/(app)/clientes/actions";

const COLUMNAS = [
  { label: "Nombre", key: "nombre" },
  { label: "CUIT", key: "cuit" },
  { label: "Cód. Import", key: "cod_import" },
  { label: "Email", key: "email" },
  { label: "Teléfono", key: "telefono" },
  { label: "Dirección", key: "direccion" },
];

export function ImportClientesButton() {
  const router = useRouter();

  return (
    <ImportDialog
      trigger={
        <Button variant="outline" size="sm">
          <FileUp className="h-4 w-4" />
          Importar
        </Button>
      }
      titulo="Importar clientes"
      columnas={COLUMNAS}
      onImportar={async (filas) => {
        const res = await importarClientes(filas);
        router.refresh();
        return res as unknown as { errores: string[] } & Record<string, number>;
      }}
    />
  );
}
