import { createClient } from "@/lib/supabase/server";
import type { EstadoOperacion } from "@/lib/mock-data";

export async function getPerfilActual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, nombre, cliente_id")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
}

export type OperacionRow = {
  id: string;
  orden: string;
  cliente_id: string;
  exportador_id: string | null;
  pais_origen_id: string | null;
  via_id: string | null;
  incoterm_id: string | null;
  divisa_id: string | null;
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
  id, orden, cliente_id, exportador_id, pais_origen_id, via_id, incoterm_id, divisa_id,
  awb_bl, fecha_arribo, forwarder, factura, fob, estado, descripcion,
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

export async function getArchivosCliente(clienteId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("archivos_cliente")
    .select("id, nombre_archivo, storage_path, created_at, operaciones(id, orden)")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getArchivosOperacion(operacionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("archivos_cliente")
    .select("id, nombre_archivo, storage_path, created_at")
    .eq("operacion_id", operacionId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
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

export type HistorialRow = {
  id: string;
  estado_anterior: EstadoOperacion | null;
  estado_nuevo: EstadoOperacion;
  changed_at: string;
  changed_by: string | null;
  operacion: { id: string; orden: string; cliente: { nombre: string } | null } | null;
};

export async function getHistorial() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operacion_estado_historial")
    .select(
      "id, estado_anterior, estado_nuevo, changed_at, changed_by, operacion:operaciones(id, orden, cliente:clientes(nombre))"
    )
    .order("changed_at", { ascending: false })
    .limit(300);
  if (error) throw error;

  const filas = (data ?? []) as unknown as HistorialRow[];
  const userIds = [...new Set(filas.map((f) => f.changed_by).filter(Boolean))] as string[];
  const nombrePorUserId = new Map<string, string>();
  if (userIds.length) {
    const { data: perfiles } = await supabase
      .from("profiles")
      .select("id, nombre")
      .in("id", userIds);
    for (const p of perfiles ?? []) {
      if (p.nombre) nombrePorUserId.set(p.id, p.nombre);
    }
  }

  return filas.map((f) => ({
    ...f,
    changed_by_nombre: f.changed_by ? (nombrePorUserId.get(f.changed_by) ?? "Usuario") : "Sistema",
  }));
}

export async function getHistorialOperacion(operacionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operacion_estado_historial")
    .select("id, estado_anterior, estado_nuevo, changed_at, changed_by")
    .eq("operacion_id", operacionId)
    .order("changed_at", { ascending: true });
  if (error) throw error;

  const filas = data ?? [];
  const userIds = [...new Set(filas.map((f) => f.changed_by).filter(Boolean))] as string[];
  const nombrePorUserId = new Map<string, string>();
  if (userIds.length) {
    const { data: perfiles } = await supabase
      .from("profiles")
      .select("id, nombre")
      .in("id", userIds);
    for (const p of perfiles ?? []) {
      if (p.nombre) nombrePorUserId.set(p.id, p.nombre);
    }
  }

  return filas.map((f) => ({
    ...f,
    changed_by_nombre: f.changed_by ? (nombrePorUserId.get(f.changed_by) ?? "Usuario") : "Sistema",
  })) as (typeof filas[number] & { changed_by_nombre: string })[];
}

export type NotaOperacion = {
  id: string;
  texto: string;
  created_at: string;
  autor_id: string;
  autor_nombre: string;
};

export async function getNotasOperacion(operacionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operacion_notas")
    .select("id, texto, created_at, autor_id")
    .eq("operacion_id", operacionId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const filas = data ?? [];
  const autorIds = [...new Set(filas.map((f) => f.autor_id))];
  const nombrePorAutorId = new Map<string, string>();
  if (autorIds.length) {
    const { data: perfiles } = await supabase
      .from("profiles")
      .select("id, nombre")
      .in("id", autorIds);
    for (const p of perfiles ?? []) {
      if (p.nombre) nombrePorAutorId.set(p.id, p.nombre);
    }
  }

  return filas.map((f) => ({
    ...f,
    autor_nombre: nombrePorAutorId.get(f.autor_id) ?? "Usuario",
  })) as NotaOperacion[];
}
