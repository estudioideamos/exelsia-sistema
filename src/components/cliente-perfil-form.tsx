"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Building2, Save, Loader2 } from "lucide-react";
import { actualizarCliente } from "@/app/(app)/clientes/[id]/actions";

type Cliente = {
  id: string;
  nombre: string;
  cuit: string | null;
  email_contacto: string | null;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
};

export function ClientePerfilForm({ cliente }: { cliente: Cliente }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await actualizarCliente(cliente.id, formData);
        toast.success("Perfil del cliente actualizado");
      } catch (err) {
        toast.error("No se pudo guardar", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">Razón social</Label>
          <Input id="nombre" name="nombre" defaultValue={cliente.nombre} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cuit">CUIT</Label>
          <Input id="cuit" name="cuit" defaultValue={cliente.cuit ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email_contacto" className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Email de contacto
          </Label>
          <Input id="email_contacto" name="email_contacto" defaultValue={cliente.email_contacto ?? ""} />
          <p className="text-xs text-muted-foreground">
            A esta dirección se envían los avisos automáticos de cambio de estado.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono" className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> Teléfono
          </Label>
          <Input id="telefono" name="telefono" defaultValue={cliente.telefono ?? ""} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="direccion" className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Dirección
          </Label>
          <Input id="direccion" name="direccion" defaultValue={cliente.direccion ?? ""} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notas" className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> Notas internas
          </Label>
          <Input id="notas" name="notas" defaultValue={cliente.notas ?? ""} placeholder="Sin notas" />
        </div>
      </div>
      <Separator />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
