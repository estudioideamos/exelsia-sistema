"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
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
import { crearOperacion } from "@/app/(app)/operaciones/actions";

type Opcion = { id: string; nombre: string };

export function NuevaOperacionDialog({
  clientes,
  exportadores,
  paises,
  vias,
  incoterms,
  divisas,
}: {
  clientes: Opcion[];
  exportadores: Opcion[];
  paises: Opcion[];
  vias: Opcion[];
  incoterms: Opcion[];
  divisas: Opcion[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const id = await crearOperacion(formData);
        toast.success("Operación creada");
        setOpen(false);
        router.push(`/operaciones/${id}`);
      } catch (err) {
        toast.error("No se pudo crear la operación", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  function SelectField({
    name,
    label,
    options,
  }: {
    name: string;
    label: string;
    options: Opcion[];
  }) {
    return (
      <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <Select name={name}>
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
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nueva operación
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva operación</DialogTitle>
          <DialogDescription>Cargá los datos de la nueva operación.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="orden">Orden</Label>
              <Input id="orden" name="orden" required placeholder="I1112" />
            </div>
            <SelectField name="cliente_id" label="Cliente" options={clientes} />
            <SelectField name="exportador_id" label="Exportador" options={exportadores} />
            <SelectField name="pais_origen_id" label="País de origen" options={paises} />
            <SelectField name="via_id" label="Vía" options={vias} />
            <SelectField name="incoterm_id" label="Incoterm" options={incoterms} />
            <SelectField name="divisa_id" label="Divisa" options={divisas} />
            <div className="space-y-2">
              <Label htmlFor="fob">FOB</Label>
              <Input id="fob" name="fob" type="number" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="awb_bl">AWB / BL</Label>
              <Input id="awb_bl" name="awb_bl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_arribo">Fecha de arribo</Label>
              <Input id="fecha_arribo" name="fecha_arribo" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forwarder">Forwarder</Label>
              <Input id="forwarder" name="forwarder" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="factura">Factura</Label>
              <Input id="factura" name="factura" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input id="descripcion" name="descripcion" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Crear operación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
