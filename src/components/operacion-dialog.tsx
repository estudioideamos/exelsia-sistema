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
import { TIPOS_OPERACION, type TipoOperacion } from "@/lib/eventos";

type Opcion = { id: string; nombre: string };

type OperacionValores = {
  tipo?: TipoOperacion;
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
  procedencia?: string | null;
  destino?: string | null;
  nombre_transporte?: string | null;
  vto_forzoso?: string | null;
  fecha_salida?: string | null;
  cutoff_documental?: string | null;
  cutoff_fisico?: string | null;
  cuit_ata?: string | null;
  fecha_precumplido?: string | null;
  fecha_cumplido?: string | null;
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

function ImporteInput({
  name,
  label,
  valor,
  onChange,
}: {
  name: string;
  label: string;
  valor: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type="number"
        step="0.01"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

const num = (valor: string) => (valor.trim() === "" ? 0 : Number(valor) || 0);

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

  const [tipo, setTipo] = useState<TipoOperacion>(v?.tipo ?? "importacion");
  const impo = tipo === "importacion";

  // Importes que componen la base imponible: se calcula sola (acepta ajuste negativo).
  const [importes, setImportes] = useState({
    gastos_fob: v?.gastos_fob != null ? String(v.gastos_fob) : "",
    fob: v?.fob != null ? String(v.fob) : "",
    flete: v?.flete != null ? String(v.flete) : "",
    seguro: v?.seguro != null ? String(v.seguro) : "",
    ajuste: v?.ajuste != null ? String(v.ajuste) : "",
  });
  const hayImportes = Object.values(importes).some((x) => x.trim() !== "");
  const baseCalculada = hayImportes
    ? impo
      ? num(importes.gastos_fob) + num(importes.fob) + num(importes.flete) + num(importes.seguro) + num(importes.ajuste)
      : num(importes.gastos_fob) + num(importes.fob)
    : (v?.base_imponible ?? null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (esEdicion && operacionId) {
          const resultado = await actualizarOperacion(operacionId, formData);
          toast.success("Operación actualizada", {
            description:
              resultado.mails > 0
                ? `Se enviaron ${resultado.mails} ${resultado.mails === 1 ? "aviso" : "avisos"} al cliente.`
                : undefined,
          });
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
          <input type="hidden" name="tipo" value={tipo} />
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="comercial">Comercial</TabsTrigger>
              <TabsTrigger value="aduana">Aduana</TabsTrigger>
              <TabsTrigger value="anticipos">Anticipos / SIM</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="max-h-[55vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="tipo-operacion">Tipo de operación</Label>
                  <Select value={tipo} onValueChange={(x) => setTipo(x as TipoOperacion)}>
                    <SelectTrigger className="w-full sm:w-64" id="tipo-operacion">
                      <SelectValue>
                        {(value: string) =>
                          TIPOS_OPERACION.find((t) => t.value === value)?.label ?? "Seleccionar"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_OPERACION.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Campo name="orden" label="Carpeta Nº" defaultValue={v?.orden} />
                <Campo name="fecha_orden" label="Fecha" type="date" defaultValue={v?.fecha_orden} />
                <SelectField name="cliente_id" label="Cliente" options={clientes} defaultValue={v?.cliente_id} />
                <SelectField
                  name="exportador_id"
                  label={impo ? "Exportador / Proveedor" : "Importador / Proveedor"}
                  options={exportadores}
                  defaultValue={v?.exportador_id}
                />
                <SelectField name="pais_origen_id" label="Origen" options={paises} defaultValue={v?.pais_origen_id} />
                {impo ? (
                  <Campo name="procedencia" label="Procedencia" defaultValue={v?.procedencia} />
                ) : (
                  <Campo name="destino" label="Destino" defaultValue={v?.destino} />
                )}
                <Campo name="orden_compra" label="Orden de compra" defaultValue={v?.orden_compra} />
                <SelectField name="via_id" label="Vía" options={vias} defaultValue={v?.via_id} />
                <Campo name="awb_bl" label="Doc. de transporte (AWB / BL)" defaultValue={v?.awb_bl} />
                <Campo name="nombre_transporte" label="Nombre del transporte" defaultValue={v?.nombre_transporte} />
                {impo ? (
                  <Campo name="fecha_arribo" label="ETA (fecha de arribo)" type="date" defaultValue={v?.fecha_arribo} />
                ) : (
                  <>
                    <Campo name="cutoff_documental" label="Cutoff documental" type="date" defaultValue={v?.cutoff_documental} />
                    <Campo name="cutoff_fisico" label="Cutoff físico" type="date" defaultValue={v?.cutoff_fisico} />
                    <Campo name="fecha_salida" label="ETD (fecha de salida)" type="date" defaultValue={v?.fecha_salida} />
                  </>
                )}
                <Campo name="forwarder" label="Forwarder" defaultValue={v?.forwarder} />
                {!impo ? <Campo name="cuit_ata" label="CUIT del ATA" defaultValue={v?.cuit_ata} /> : null}
                <Campo name="peso_kg" label="Peso bruto (Kg)" type="number" step="0.01" defaultValue={v?.peso_kg} />
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
                <Campo name="tc" label="Tipo de cambio" type="number" step="0.01" defaultValue={v?.tc} />
                <ImporteInput name="gastos_fob" label="Gastos hasta FOB" valor={importes.gastos_fob} onChange={(x) => setImportes((prev) => ({ ...prev, gastos_fob: x }))} />
                <ImporteInput name="fob" label="FOB" valor={importes.fob} onChange={(x) => setImportes((prev) => ({ ...prev, fob: x }))} />
                {impo ? (
                  <>
                    <ImporteInput name="flete" label="Flete" valor={importes.flete} onChange={(x) => setImportes((prev) => ({ ...prev, flete: x }))} />
                    <ImporteInput name="seguro" label="Seguro" valor={importes.seguro} onChange={(x) => setImportes((prev) => ({ ...prev, seguro: x }))} />
                    <ImporteInput name="ajuste" label="Ajuste (acepta negativos)" valor={importes.ajuste} onChange={(x) => setImportes((prev) => ({ ...prev, ajuste: x }))} />
                  </>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="base_imponible">
                    Base imponible {impo ? "(se calcula sola)" : "(gastos + FOB)"}
                  </Label>
                  <Input
                    id="base_imponible"
                    name="base_imponible"
                    type="number"
                    step="0.01"
                    readOnly
                    value={baseCalculada ?? ""}
                    className="bg-muted/40"
                  />
                </div>
                <Campo
                  name="factura"
                  label={impo ? "Factura de importación" : "Factura de exportación"}
                  defaultValue={v?.factura}
                />
                <Campo name="fecha_factura" label="Fecha de factura" type="date" defaultValue={v?.fecha_factura} />
                <Campo name="facturas_exelsia" label="Facturas Exelsia" defaultValue={v?.facturas_exelsia} />
                <Campo name="fecha_factura_exelsia" label="Fecha de factura Exelsia" type="date" defaultValue={v?.fecha_factura_exelsia} />
              </div>
            </TabsContent>

            <TabsContent value="aduana" className="max-h-[55vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo name="envio_terminal" label="Fiscal / Terminal" defaultValue={v?.envio_terminal} />
                <Campo name="ncm" label="NCM (número o VARIAS)" defaultValue={v?.ncm} />
                <Campo name="oficializacion_dua" label="Oficialización DJAI" defaultValue={v?.oficializacion_dua} />
                <Campo
                  name="numero_oficializacion"
                  label={impo ? "N° de oficialización" : "N° de permiso de embarque"}
                  defaultValue={v?.numero_oficializacion}
                />
                <Campo name="fecha_oficializacion" label="Fecha de oficialización" type="date" defaultValue={v?.fecha_oficializacion} />
                {impo ? (
                  <>
                    <Campo name="vto_forzoso" label="Vencimiento de forzoso" type="date" defaultValue={v?.vto_forzoso} />
                    <Campo name="fecha_entrega" label="Fecha de entrega" type="date" defaultValue={v?.fecha_entrega} />
                  </>
                ) : (
                  <>
                    <Campo name="fecha_precumplido" label="Fecha de precumplido" type="date" defaultValue={v?.fecha_precumplido} />
                    <Campo name="fecha_cumplido" label="Fecha de cumplido" type="date" defaultValue={v?.fecha_cumplido} />
                  </>
                )}
                <Campo name="despacho" label="Despacho" defaultValue={v?.despacho} />
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="intervinientes">Intervenciones (si hay varias, separalas con /)</Label>
                  <Input id="intervinientes" name="intervinientes" placeholder="INAME / INAL" defaultValue={v?.intervinientes ?? undefined} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="anticipos" className="max-h-[55vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo name="anticipo_solicitado" label="Anticipo de gastos solicitado (ARS)" type="number" step="0.01" defaultValue={v?.anticipo_solicitado} />
                <Campo name="fecha_anticipo" label="Fecha de anticipo" type="date" defaultValue={v?.fecha_anticipo} />
                <Campo name="anticipo_depositado" label="Anticipo depositado (ARS)" type="number" step="0.01" defaultValue={v?.anticipo_depositado} />
                <Campo name="pendiente" label="Pendiente / Refuerzo (ARS)" type="number" step="0.01" defaultValue={v?.pendiente} />
                <Campo name="fecha_deposito_anticipo" label="Fecha de acreditación de gastos" type="date" defaultValue={v?.fecha_deposito_anticipo} />
                <Campo name="mafia_solicitado" label="Importe SIM solicitado (ARS)" type="number" step="0.01" defaultValue={v?.mafia_solicitado} />
                <Campo name="fecha_mafia_deposito" label="Fecha depósito SIM" type="date" defaultValue={v?.fecha_mafia_deposito} />
                <Campo name="mafia_depositado" label="SIM depositado (ARS)" type="number" step="0.01" defaultValue={v?.mafia_depositado} />
                <Campo name="fecha_deposito_mafia" label="Fecha de acreditación de fondos de aduana (SIM)" type="date" defaultValue={v?.fecha_deposito_mafia} />
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="comentarios">Observaciones</Label>
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
