import { createClient } from "@/lib/supabase/server";
import type { EstadoOperacion } from "@/lib/mock-data";

export type OperacionRow = {
  id: string;
  orden: string;
  cliente_id: string;
  awb_bl: string | null;
  fecha_arribo: string | null;
  forwarder: string | null;
  factura: string | null;
  fob: number | null;
  estado: EstadoOperacion;
  descripcion: string | null;
  divisa: { nombre: string } | null;
  incoterm: { nombre: string } | null;
  via: { nombre: string } | null;
  exportador: { nombre: string } | null;
  pais_origen: { nombre: string } | null;
  cliente: { nombre: string } | null;
};

const OPERACION_SELECT = `
  id, orden, cliente_id, awb_bl, fecha_arribo, forwarder, factura, fob, estado, descripcion,
  divisa:divisas(nombre),
  incoterm:incoterms(nombre),
  via:vias(nombre),
  exportador:exportadores(nombre),
  pais_origen:paises(nombre),
  cliente:clientes(nombre)
`;

export async function getOperaciones() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operaciones")
    .select(OPERACION_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as OperacionRow[];
}

export async function getOperacion(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operaciones")
    .select(OPERACION_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as OperacionRow | null;
}

export async function getClientes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("*, operaciones(count)")
    .order("nombre");
  if (error) throw error;
  return data ?? [];
}

export async function getCliente(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clientes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getOperacionesPorCliente(clienteId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operaciones")
    .select(OPERACION_SELECT)
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as OperacionRow[];
}
