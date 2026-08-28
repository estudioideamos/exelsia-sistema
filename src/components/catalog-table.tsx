"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AppTopbar } from "@/components/app-topbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  actualizarItemCatalogo,
  crearItemCatalogo,
  eliminarItemCatalogo,
} from "@/app/(app)/catalogos/actions";

export type CatalogColumn<T> = {
  key: keyof T;
  label: string;
  className?: string;
};

type Row = { id: string } & Record<string, string | null | React.ReactNode>;

function ItemForm<T extends Row>({
  columns,
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  columns: CatalogColumn<T>[];
  defaultValues?: T;
  onSubmit: (datos: Record<string, string>) => void;
  submitLabel: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const datos: Record<string, string> = {};
    columns.forEach((col) => {
      datos[String(col.key)] = String(formData.get(String(col.key)) ?? "");
    });
    startTransition(() => onSubmit(datos));
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {columns.map((col) => (
          <div key={String(col.key)} className="space-y-2">
            <Label htmlFor={String(col.key)}>{col.label}</Label>
            <Input
              id={String(col.key)}
              name={String(col.key)}
              defaultValue={(defaultValues?.[String(col.key)] as string) ?? ""}
              required={String(col.key) === "nombre"}
            />
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CatalogTable<T extends Row>({
  title,
  description,
  addLabel,
  table,
  columns,
  rows,
}: {
  title: string;
  description: string;
  addLabel: string;
  table: string;
  columns: CatalogColumn<T>[];
  rows: T[];
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<T | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(datos: Record<string, string>) {
    try {
      await crearItemCatalogo(table, datos);
      toast.success("Elemento creado");
      setAddOpen(false);
    } catch (err) {
      toast.error("No se pudo crear", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  async function handleUpdate(datos: Record<string, string>) {
    if (!editRow) return;
    try {
      await actualizarItemCatalogo(table, editRow.id, datos);
      toast.success("Cambios guardados");
      setEditRow(null);
    } catch (err) {
      toast.error("No se pudo guardar", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await eliminarItemCatalogo(table, id);
      toast.success("Elemento eliminado");
    } catch (err) {
      toast.error("No se pudo eliminar", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <AppTopbar title={title} description={description} />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-end">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger
              render={
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  {addLabel}
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{addLabel}</DialogTitle>
                <DialogDescription>Completá los datos y guardá.</DialogDescription>
              </DialogHeader>
              <ItemForm columns={columns} onSubmit={handleCreate} submitLabel="Crear" />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/60 overflow-hidden py-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {columns.map((col) => (
                    <TableHead key={String(col.key)} className={col.className}>
                      {col.label}
                    </TableHead>
                  ))}
                  <TableHead className="w-20 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((col) => {
                      const display = row[`_display_${String(col.key)}`];
                      return (
                        <TableCell key={String(col.key)} className={col.className}>
                          {display != null ? display : String(row[col.key] ?? "")}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditRow(row)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                disabled={deletingId === row.id}
                              >
                                {deletingId === row.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            }
                          />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar este elemento?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(row.id)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <Dialog open={editRow !== null} onOpenChange={(open) => !open && setEditRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar</DialogTitle>
            <DialogDescription>Modificá los datos y guardá.</DialogDescription>
          </DialogHeader>
          {editRow ? (
            <ItemForm
              columns={columns}
              defaultValues={editRow}
              onSubmit={handleUpdate}
              submitLabel="Guardar cambios"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
