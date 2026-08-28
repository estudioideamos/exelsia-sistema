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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  fecha_orden?: string | null;
  cod_import?: string | null;
  peso_kg?: number | null;
  fecha_factura?: string | null;
  orden_compra?: string | null;
  envio_terminal?: string | null;
  oficializacion_dua?: string | null;
  tc?: number | null;
  gastos_fob?: number | null;
  flete?: number | null;
  seguro?: number | null;
  ajuste?: number | null;
  base_imponible?: number | null;
  ncm?: string | null;
  intervinientes?: string | null;
  numero_oficializacion?: string | null;
  fecha_oficializacion?: string | null;
  fecha_entrega?: string | null;
  anticipo_solicitado?: number | null;
  fecha_anticipo?: string | null;
  anticipo_depositado?: number | null;
  pendiente?: number | null;
  fecha_deposito_anticipo?: string | null;
  mafia_solicitado?: number | null;
  fecha_mafia_deposito?: string | null;
  mafia_depositado?: number | null;
  fecha_deposito_mafia?: string | null;
  despacho?: string | null;
  facturas_exelsia?: string | null;
  fecha_factura_exelsia?: string | null;
  comentarios?: string | null;
};

function Campo({
  name,
  label,
  defaultValue,
  type = "text",
  step,
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  type?: string;
  step?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue ?? undefined}
      />
    </div>
  );
}

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
  const v = valoresIniciales;

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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar operación" : "Nueva operación"}</DialogTitle>
          <DialogDescription>
            {esEdicion ? "Modificá los datos y guardá." : "Cargá los datos de la nueva operación."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="comercial">Comercial</TabsTrigger>
              <TabsTrigger value="aduana">Aduana</TabsTrigger>
              <TabsTrigger value="anticipos">Anticipos / MAFIA</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="max-h-[55vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo name="orden" label="Orden" defaultValue={v?.orden} />
                <Campo name="fecha_orden" label="Fecha" type="date" defaultValue={v?.fecha_orden} />
                <SelectField name="cliente_id" label="Cliente" options={clientes} defaultValue={v?.cliente_id} />
                <SelectField name="exportador_id" label="Exportador" options={exportadores} defaultValue={v?.exportador_id} />
                <SelectField name="pais_origen_id" label="País de origen" options={paises} defaultValue={v?.pais_origen_id} />
                <SelectField name="via_id" label="Vía" options={vias} defaultValue={v?.via_id} />
                <Campo name="awb_bl" label="AWB / BL" defaultValue={v?.awb_bl} />
                <Campo name="fecha_arribo" label="Fecha de arribo" type="date" defaultValue={v?.fecha_arribo} />
                <Campo name="forwarder" label="Forwarder" defaultValue={v?.forwarder} />
                <Campo name="peso_kg" label="Peso (Kg)" type="number" step="0.01" defaultValue={v?.peso_kg} />
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea id="descripcion" name="descripcion" defaultValue={v?.descripcion ?? undefined} className="min-h-16" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comercial" className="max-h-[55vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField name="incoterm_id" label="Incoterm" options={incoterms} defaultValue={v?.incoterm_id} />
                <SelectField name="divisa_id" label="Divisa" options={divisas} defaultValue={v?.divisa_id} />
                <Campo name="fob" label="FOB" type="number" step="0.01" defaultValue={v?.fob} />
                <Campo name="tc" label="Tipo de cambio" type="number" step="0.01" defaultValue={v?.tc} />
                <Campo name="gastos_fob" label="Gastos hasta FOB" type="number" step="0.01" defaultValue={v?.gastos_fob} />
                <Campo name="flete" label="Flete" type="number" step="0.01" defaultValue={v?.flete} />
                <Campo name="seguro" label="Seguro" type="number" step="0.01" defaultValue={v?.seguro} />
                <Campo name="ajuste" label="Ajuste" type="number" step="0.01" defaultValue={v?.ajuste} />
                <Campo name="base_imponible" label="Base imponible" type="number" step="0.01" defaultValue={v?.base_imponible} />
                <Campo name="factura" label="Factura" defaultValue={v?.factura} />
                <Campo name="fecha_factura" label="Fecha de factura" type="date" defaultValue={v?.fecha_factura} />
                <Campo name="orden_compra" label="Orden de compra" defaultValue={v?.orden_compra} />
                <Campo name="facturas_exelsia" label="Facturas Exelsia" defaultValue={v?.facturas_exelsia} />
                <Campo name="fecha_factura_exelsia" label="Fecha de factura Exelsia" type="date" defaultValue={v?.fecha_factura_exelsia} />
              </div>
            </TabsContent>

            <TabsContent value="aduana" className="max-h-[55vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo name="envio_terminal" label="Envío de orden / Terminal" defaultValue={v?.envio_terminal} />
                <Campo name="ncm" label="NCM" defaultValue={v?.ncm} />
                <Campo name="oficializacion_dua" label="Oficialización DJAI" defaultValue={v?.oficializacion_dua} />
                <Campo name="numero_oficializacion" label="N° de oficialización" defaultValue={v?.numero_oficializacion} />
                <Campo name="fecha_oficializacion" label="Fecha de oficialización" type="date" defaultValue={v?.fecha_oficializacion} />
                <Campo name="fecha_entrega" label="Fecha de entrega" type="date" defaultValue={v?.fecha_entrega} />
                <Campo name="despacho" label="Despacho" defaultValue={v?.despacho} />
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="intervinientes">Intervinientes</Label>
                  <Input id="intervinientes" name="intervinientes" defaultValue={v?.intervinientes ?? undefined} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="anticipos" className="max-h-[55vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo name="anticipo_solicitado" label="Anticipo solicitado" type="number" step="0.01" defaultValue={v?.anticipo_solicitado} />
                <Campo name="fecha_anticipo" label="Fecha de anticipo" type="date" defaultValue={v?.fecha_anticipo} />
                <Campo name="anticipo_depositado" label="Anticipo depositado" type="number" step="0.01" defaultValue={v?.anticipo_depositado} />
                <Campo name="pendiente" label="Pendiente" type="number" step="0.01" defaultValue={v?.pendiente} />
                <Campo name="fecha_deposito_anticipo" label="Fecha de depósito" type="date" defaultValue={v?.fecha_deposito_anticipo} />
                <Campo name="mafia_solicitado" label="MAFIA solicitado" type="number" step="0.01" defaultValue={v?.mafia_solicitado} />
                <Campo name="fecha_mafia_deposito" label="Fecha dep. MAFIA" type="date" defaultValue={v?.fecha_mafia_deposito} />
                <Campo name="mafia_depositado" label="MAFIA depositado" type="number" step="0.01" defaultValue={v?.mafia_depositado} />
                <Campo name="fecha_deposito_mafia" label="Fecha de depósito MAFIA" type="date" defaultValue={v?.fecha_deposito_mafia} />
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="comentarios">Comentarios</Label>
                  <Textarea id="comentarios" name="comentarios" defaultValue={v?.comentarios ?? undefined} className="min-h-16" />
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
