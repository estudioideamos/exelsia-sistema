"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";

export function EliminarSeleccionadosButton({
  ids,
  onEliminar,
  entidadLabel,
}: {
  ids: string[];
  onEliminar: (ids: string[]) => Promise<void>;
  entidadLabel: string;
}) {
  const [eliminando, setEliminando] = useState(false);
  const router = useRouter();

  if (ids.length === 0) return null;

  async function handleEliminar() {
    setEliminando(true);
    try {
      await onEliminar(ids);
      toast.success(`${ids.length} ${entidadLabel}(s) eliminado(s)`);
      router.refresh();
    } catch (err) {
      toast.error("No se pudo eliminar", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setEliminando(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            {eliminando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Borrar seleccionados
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Eliminar {ids.length} {entidadLabel}(s)?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminarán permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleEliminar} disabled={eliminando}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
