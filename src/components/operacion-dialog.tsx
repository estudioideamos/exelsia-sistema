"use client";

import { useState, useTransition, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { crearOperacion, actualizarOperacion } from "@/app/(app)/operaciones/actions";

type Opcion = { id: string; nombre: string };

type OperacionValores = {
  orden: string;
  cliente_id: string;
  exportador_id: string | null;
  pais_origen_id: string | null;
  via_id: string | null;
  incoterm_id: string | null;
  divisa_id: string | null;
  fob: number | null;
  awb_bl: string | null;
  fecha_arribo: string | null;
  forwarder: string | null;
  factura: string | null;
  descripcion: string | null;
};

export function OperacionDialog({
  trigger,
  clientes,
  exportadores,
  paises,
  vias,
  incoterms,
  divisas,
  operacionId,
  valoresIniciales,
}: {
  trigger: ReactElement;
  clientes: Opcion[];
  exportadores: Opcion[];
  paises: Opcion[];
  vias: Opcion[];
  incoterms: Opcion[];
  divisas: Opcion[];
  operacionId?: string;
  valoresIniciales?: OperacionValores;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const esEdicion = Boolean(operacionId);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (esEdicion && operacionId) {
          await actualizarOperacion(operacionId, formData);
          toast.success("Operación actualizada");
          setOpen(false);
          router.refresh();
        } else {
          const id = await crearOperacion(formData);
          toast.success("Operación creada");
          setOpen(false);
          router.push(`/operaciones/${id}`);
        }
      } catch (err) {
        toast.error(esEdicion ? "No se pudo actualizar" : "No se pudo crear la operación", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  function SelectField({
    name,
    label,
    options,
    defaultValue,
  }: {
    name: string;
    label: string;
    options: Opcion[];
    defaultValue?: string | null;
  }) {
    return (
      <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <Select name={name} defaultValue={defaultValue ?? undefined}>
          <SelectTrigger className="w-full" id={name}>
            <SelectValue placeholder="Seleccionar">
              {(value: string) => options.find((o) => o.id === value)?.nombre ?? "Seleccionar"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar operación" : "Nueva operación"}</DialogTitle>
          <DialogDescription>
            {esEdicion ? "Modificá los datos y guardá." : "Cargá los datos de la nueva operación."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="orden">Orden</Label>
              <Input
                id="orden"
                name="orden"
                required
                placeholder="I1112"
                defaultValue={valoresIniciales?.orden}
              />
            </div>
            <SelectField
              name="cliente_id"
              label="Cliente"
              options={clientes}
              defaultValue={valoresIniciales?.cliente_id}
            />
            <SelectField
              name="exportador_id"
              label="Exportador"
              options={exportadores}
              defaultValue={valoresIniciales?.exportador_id}
            />
            <SelectField
              name="pais_origen_id"
              label="País de origen"
              options={paises}
              defaultValue={valoresIniciales?.pais_origen_id}
            />
            <SelectField
              name="via_id"
              label="Vía"
              options={vias}
              defaultValue={valoresIniciales?.via_id}
            />
            <SelectField
              name="incoterm_id"
              label="Incoterm"
              options={incoterms}
              defaultValue={valoresIniciales?.incoterm_id}
            />
            <SelectField
              name="divisa_id"
              label="Divisa"
              options={divisas}
              defaultValue={valoresIniciales?.divisa_id}
            />
            <div className="space-y-2">
              <Label htmlFor="fob">FOB</Label>
              <Input
                id="fob"
                name="fob"
                type="number"
                step="0.01"
                defaultValue={valoresIniciales?.fob ?? undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="awb_bl">AWB / BL</Label>
              <Input id="awb_bl" name="awb_bl" defaultValue={valoresIniciales?.awb_bl ?? undefined} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_arribo">Fecha de arribo</Label>
              <Input
                id="fecha_arribo"
                name="fecha_arribo"
                type="date"
                defaultValue={valoresIniciales?.fecha_arribo ?? undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forwarder">Forwarder</Label>
              <Input
                id="forwarder"
                name="forwarder"
                defaultValue={valoresIniciales?.forwarder ?? undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="factura">Factura</Label>
              <Input id="factura" name="factura" defaultValue={valoresIniciales?.factura ?? undefined} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                name="descripcion"
                defaultValue={valoresIniciales?.descripcion ?? undefined}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {esEdicion ? "Guardar cambios" : "Crear operación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
