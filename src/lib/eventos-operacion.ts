import type { SupabaseClient } from "@supabase/supabase-js";
import {
  EVENTOS,
  claveAdjuntoEvento,
  claveAvisoEvento,
  type EventoKey,
  type TipoOperacion,
} from "@/lib/eventos";
import { enviarAvisoEvento, type OperacionAviso } from "@/lib/email-eventos";
import { archivosParaTipos } from "@/lib/archivos-aviso";

type Fila = Record<string, unknown>;

function norm(v: unknown) {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  const s = String(v).trim();
  return s === "" ? null : s;
}

const cambio = (antes: Fila, despues: Fila, campo: string) =>
  norm(antes[campo]) !== norm(despues[campo]);
const cargado = (fila: Fila, campo: string) => norm(fila[campo]) !== null;

// Qué eventos dispara un guardado. Al crear solo sale "apertura de carpeta"; el resto
// se evalúa al editar comparando la carpeta antes y después.
export function detectarEventos(antes: Fila | null, despues: Fila): EventoKey[] {
  if (!antes) return ["creacion"];

  const tipo = (despues.tipo as TipoOperacion) ?? "importacion";
  const eventos: EventoKey[] = [];

  const campoFecha = tipo === "exportacion" ? "fecha_salida" : "fecha_arribo";
  if (cambio(antes, despues, campoFecha) && cargado(despues, campoFecha)) {
    eventos.push("fecha_transporte");
  }

  const camposAnticipos = [
    "anticipo_solicitado",
    "fecha_deposito_anticipo",
    "mafia_solicitado",
    "fecha_deposito_mafia",
  ];
  if (
    cargado(despues, "anticipo_solicitado") &&
    cargado(despues, "mafia_solicitado") &&
    camposAnticipos.some((c) => cambio(antes, despues, c))
  ) {
    eventos.push("anticipos");
  }

  if (cambio(antes, despues, "numero_oficializacion") && cargado(despues, "numero_oficializacion")) {
    eventos.push("oficializacion");
  }

  if (
    tipo === "importacion" &&
    cambio(antes, despues, "fecha_entrega") &&
    cargado(despues, "fecha_entrega")
  ) {
    eventos.push("entrega");
  }

  if (cambio(antes, despues, "facturas_exelsia") && cargado(despues, "facturas_exelsia")) {
    eventos.push("facturacion");
  }

  return eventos;
}

type Resolucion = { conAdjunto: string[]; sinAdjunto: string[] };

// Sin casillas cargadas, el mail de contacto recibe todo con documentos. Con casillas,
// cada una recibe solo los eventos que tiene tildados ("Aviso"), y los documentos solo
// si además tiene tildado "Adjunto".
async function resolverDestinatariosEvento(
  supabase: SupabaseClient,
  clienteId: string,
  evento: EventoKey,
  emailContacto: string | null
): Promise<Resolucion> {
  const { data: destinatarios } = await supabase
    .from("cliente_destinatarios")
    .select("id, email")
    .eq("cliente_id", clienteId);

  if (!destinatarios || destinatarios.length === 0) {
    return { conAdjunto: emailContacto ? [emailContacto] : [], sinAdjunto: [] };
  }

  const { data: filas } = await supabase
    .from("cliente_alertas")
    .select("estado, destinatario_id")
    .eq("cliente_id", clienteId)
    .in("estado", [claveAvisoEvento(evento), claveAdjuntoEvento(evento)]);

  const aviso = new Set<string>();
  const adjunto = new Set<string>();
  for (const f of filas ?? []) {
    if (f.estado === claveAvisoEvento(evento)) aviso.add(f.destinatario_id as string);
    else adjunto.add(f.destinatario_id as string);
  }

  const conAdjunto: string[] = [];
  const sinAdjunto: string[] = [];
  for (const d of destinatarios) {
    if (!aviso.has(d.id as string)) continue;
    (adjunto.has(d.id as string) ? conAdjunto : sinAdjunto).push(d.email as string);
  }
  return { conAdjunto, sinAdjunto };
}

export type ResultadoEventos = { eventos: EventoKey[]; mails: number };

// Envía los avisos de los eventos detectados. Un fallo de mail nunca debe impedir que se
// guarde la carpeta, por eso nunca lanza.
export async function enviarEventos(
  supabase: SupabaseClient,
  operacion: OperacionAviso,
  clienteId: string,
  emailContacto: string | null,
  eventos: EventoKey[]
): Promise<ResultadoEventos> {
  let mails = 0;

  for (const evento of eventos) {
    try {
      const config = EVENTOS.find((e) => e.key === evento);
      if (!config || (config.soloTipo && config.soloTipo !== operacion.tipo)) continue;

      const { conAdjunto, sinAdjunto } = await resolverDestinatariosEvento(
        supabase,
        clienteId,
        evento,
        emailContacto
      );

      const archivos =
        conAdjunto.length > 0 && config.tipos.length > 0
          ? await archivosParaTipos(supabase, operacion.id, config.tipos)
          : [];

      // Quien tiene "Adjunto" pero no hay documentos cargados recibe igual el aviso, sin ellos.
      const sinDocumentos = archivos.length === 0 ? [...conAdjunto, ...sinAdjunto] : sinAdjunto;

      if (archivos.length > 0 && conAdjunto.length > 0) {
        if (await enviarAvisoEvento({ evento, operacion, email: conAdjunto, archivos })) mails++;
      }
      if (sinDocumentos.length > 0) {
        if (await enviarAvisoEvento({ evento, operacion, email: sinDocumentos, archivos: [] })) mails++;
      }
    } catch (err) {
      console.error(`No se pudo procesar el aviso "${evento}":`, err);
    }
  }

  return { eventos, mails };
}
