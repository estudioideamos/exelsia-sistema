import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { EstadoOperacion } from "@/lib/mock-data";

export const getPerfilActual = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null, mfaPendiente: false };

  // Con verificación en dos pasos activada, una sesión que solo pasó por la contraseña
  // (aal1) no puede usar el sistema hasta ingresar el código.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const mfaPendiente = aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, nombre, cliente_id")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile, mfaPendiente };
});

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
  comentarios: string | null;
  created_at: string;
  updated_at: string;
  peso_kg: number | null;
  fecha_factura: string | null;
  orden_compra: string | null;
  oficializacion_dua: string | null;
  tc: number | null;
  gastos_fob: number | null;
  flete: number | null;
  seguro: number | null;
  base_imponible: number | null;
  intervinientes: string | null;
  fecha_oficializacion: string | null;
  fecha_despacho: string | null;
  fecha_orden?: string | null;
  envio_terminal?: string | null;
  ncm?: string | null;
  numero_oficializacion?: string | null;
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
  fecha_entrega?: string | null;
  ajuste?: number | null;
  divisa: { nombre: string } | null;
  incoterm: { nombre: string } | null;
  via: { nombre: string } | null;
  exportador: { nombre: string } | null;
  pais_origen: { nombre: string } | null;
  cliente: { nombre: string } | null;
};

const OPERACION_SELECT = `
  *,
  divisa:divisas(nombre),
  incoterm:incoterms(nombre),
  via:vias(nombre),
  exportador:exportadores(nombre),
  pais_origen:paises(nombre),
  cliente:clientes(nombre)
`;

const LISTA_SELECT = `
  id, orden, cliente_id, exportador_id, pais_origen_id, via_id, incoterm_id, divisa_id,
  awb_bl, fecha_arribo, forwarder, factura, fob, estado, descripcion,
  divisa:divisas(nombre),
  incoterm:incoterms(nombre),
  via:vias(nombre),
  exportador:exportadores(nombre),
  pais_origen:paises(nombre),
  cliente:clientes(nombre)
`;

const PAGE_SIZE = 1000;

// Clave de la tabla -> columna por la que ordena la base de datos.
const COLUMNAS_ORDEN: Record<string, string> = {
  orden: "orden",
  cliente: "cliente(nombre)",
  exportador: "exportador(nombre)",
  origen: "pais_origen(nombre)",
  via: "via(nombre)",
  fecha_arribo: "fecha_arribo",
  fob: "fob",
  estado: "estado",
};

export type OrdenOperaciones = { sort: string; dir: "asc" | "desc" };
export const ORDEN_OPERACIONES_DEFAULT: OrdenOperaciones = { sort: "fecha_arribo", dir: "desc" };
export const SORT_KEYS_OPERACIONES = Object.keys(COLUMNAS_ORDEN);

export function normalizarOrden(sort: string | undefined, dir: string | undefined): OrdenOperaciones {
  return {
    sort: sort && sort in COLUMNAS_ORDEN ? sort : ORDEN_OPERACIONES_DEFAULT.sort,
    dir: dir === "asc" || dir === "desc" ? dir : ORDEN_OPERACIONES_DEFAULT.dir,
  };
}

export async function getOperacionesPagina(
  page: number,
  size: number,
  orden: OrdenOperaciones,
  clienteId?: string
) {
  const supabase = await createClient();

  async function pedir(pagina: number) {
    const desde = (pagina - 1) * size;
    let consulta = supabase.from("operaciones").select(LISTA_SELECT, { count: "exact" });
    if (clienteId) consulta = consulta.eq("cliente_id", clienteId);
    return consulta
      .order(COLUMNAS_ORDEN[orden.sort], { ascending: orden.dir === "asc", nullsFirst: false })
      .order("id")
      .range(desde, desde + size - 1);
  }

  const primera = await pedir(Math.max(1, page));
  if (primera.error) throw primera.error;

  const total = primera.count ?? 0;
  const ultima = Math.max(1, Math.ceil(total / size));
  if (page <= ultima) {
    return {
      rows: (primera.data ?? []) as unknown as OperacionRow[],
      total,
      page: Math.max(1, page),
    };
  }

  const fallback = await pedir(ultima);
  if (fallback.error) throw fallback.error;
  return { rows: (fallback.data ?? []) as unknown as OperacionRow[], total, page: ultima };
}

// Para exportar todo: trae las páginas en paralelo, ya ordenadas.
export async function getTodasOperaciones(orden: OrdenOperaciones, clienteId?: string) {
  const supabase = await createClient();

  let conteo = supabase.from("operaciones").select("id", { count: "exact", head: true });
  if (clienteId) conteo = conteo.eq("cliente_id", clienteId);
  const { count, error: errorConteo } = await conteo;
  if (errorConteo) throw errorConteo;

  const paginas = Math.ceil((count ?? 0) / PAGE_SIZE);
  const lotes = await Promise.all(
    Array.from({ length: paginas }, (_, i) => {
      let consulta = supabase.from("operaciones").select(LISTA_SELECT);
      if (clienteId) consulta = consulta.eq("cliente_id", clienteId);
      return consulta
        .order(COLUMNAS_ORDEN[orden.sort], { ascending: orden.dir === "asc", nullsFirst: false })
        .order("id")
        .range(i * PAGE_SIZE, i * PAGE_SIZE + PAGE_SIZE - 1);
    })
  );

  const todas: OperacionRow[] = [];
  for (const lote of lotes) {
    if (lote.error) throw lote.error;
    todas.push(...((lote.data ?? []) as unknown as OperacionRow[]));
  }
  return todas;
}

// Solo lo necesario para los indicadores del dashboard: estado y FOB de cada operación.
export async function getResumenOperaciones(clienteId?: string) {
  const supabase = await createClient();

  let conteo = supabase.from("operaciones").select("id", { count: "exact", head: true });
  if (clienteId) conteo = conteo.eq("cliente_id", clienteId);
  const { count, error: errorConteo } = await conteo;
  if (errorConteo) throw errorConteo;

  const paginas = Math.ceil((count ?? 0) / PAGE_SIZE);
  const lotes = await Promise.all(
    Array.from({ length: paginas }, (_, i) => {
      let consulta = supabase.from("operaciones").select("estado, fob");
      if (clienteId) consulta = consulta.eq("cliente_id", clienteId);
      return consulta.order("id").range(i * PAGE_SIZE, i * PAGE_SIZE + PAGE_SIZE - 1);
    })
  );

  const filas: { estado: EstadoOperacion; fob: number | null }[] = [];
  for (const lote of lotes) {
    if (lote.error) throw lote.error;
    filas.push(...((lote.data ?? []) as { estado: EstadoOperacion; fob: number | null }[]));
  }
  return filas;
}

export async function getOperacionesRecientes(cantidad: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operaciones")
    .select(LISTA_SELECT)
    .order("created_at", { ascending: false })
    .limit(cantidad);
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
    .select("id, nombre_archivo, storage_path, created_at, tipo, operaciones(id, orden)")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getArchivosOperacion(operacionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("archivos_cliente")
    .select("id, nombre_archivo, storage_path, created_at, tipo")
    .eq("operacion_id", operacionId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
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

export type MensajeOperacion = {
  id: string;
  operacion_id: string;
  autor_id: string;
  texto: string;
  created_at: string;
  autor_nombre: string;
  autor_rol: "admin" | "cliente";
};

export async function getMensajesOperacion(operacionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operacion_mensajes")
    .select("id, operacion_id, autor_id, texto, created_at")
    .eq("operacion_id", operacionId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const filas = data ?? [];
  const autorIds = [...new Set(filas.map((f) => f.autor_id))];
  const perfilesPorId = new Map<string, { nombre: string | null; role: "admin" | "cliente" }>();
  if (autorIds.length) {
    const { data: perfiles } = await supabase
      .from("profiles")
      .select("id, nombre, role")
      .in("id", autorIds);
    for (const p of perfiles ?? []) {
      perfilesPorId.set(p.id, { nombre: p.nombre, role: p.role });
    }
  }

  return filas.map((f) => {
    const perfil = perfilesPorId.get(f.autor_id);
    return {
      ...f,
      autor_nombre: perfil?.nombre ?? (perfil?.role === "admin" ? "Exelsia" : "Cliente"),
      autor_rol: perfil?.role ?? "cliente",
    };
  }) as MensajeOperacion[];
}

export type ResumenMensajes = {
  cantidad: number;
  ultimaFecha: string;
  ultimoAutorEsCliente: boolean;
};

export async function getResumenMensajesPorOperacion(operacionIds?: string[]) {
  const supabase = await createClient();
  if (operacionIds && operacionIds.length === 0) return new Map<string, ResumenMensajes>();

  let consulta = supabase
    .from("operacion_mensajes")
    .select("operacion_id, autor_id, created_at")
    .order("created_at", { ascending: true });
  if (operacionIds) consulta = consulta.in("operacion_id", operacionIds);
  const { data: mensajes } = await consulta;

  const filas = mensajes ?? [];
  const autorIds = [...new Set(filas.map((f) => f.autor_id))];
  const rolPorAutorId = new Map<string, "admin" | "cliente">();
  if (autorIds.length) {
    const { data: perfiles } = await supabase.from("profiles").select("id, role").in("id", autorIds);
    for (const p of perfiles ?? []) rolPorAutorId.set(p.id, p.role);
  }

  const resumen = new Map<string, ResumenMensajes>();
  for (const m of filas) {
    const actual = resumen.get(m.operacion_id);
    resumen.set(m.operacion_id, {
      cantidad: (actual?.cantidad ?? 0) + 1,
      ultimaFecha: m.created_at,
      ultimoAutorEsCliente: rolPorAutorId.get(m.autor_id) !== "admin",
    });
  }
  return resumen;
}


export type DestinatarioCliente = { id: string; email: string; etiqueta: string | null };
export type AlertaCliente = { estado: string; destinatario_id: string };

export async function getDestinatariosCliente(clienteId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cliente_destinatarios")
    .select("id, email, etiqueta")
    .eq("cliente_id", clienteId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as DestinatarioCliente[];
}

export async function getAlertasCliente(clienteId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cliente_alertas")
    .select("estado, destinatario_id")
    .eq("cliente_id", clienteId);
  if (error) throw error;
  return (data ?? []) as AlertaCliente[];
}

export type DocumentoEtapa = { estado: string; tipo: string };

export async function getDocumentosPorEtapa() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("etapa_documentos").select("estado, tipo");
  if (error) throw error;
  return (data ?? []) as DocumentoEtapa[];
}
