"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Download, FileText, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export type ArchivoRow = {
  id: string;
  nombre_archivo: string;
  storage_path: string;
  created_at: string;
};

export function ArchivosCliente({
  clienteId,
  operacionId,
  archivosIniciales,
}: {
  clienteId: string;
  operacionId?: string;
  archivosIniciales: ArchivoRow[];
}) {
  const [archivos, setArchivos] = useState(archivosIniciales);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      const path = `${clienteId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("archivos-clientes")
        .upload(path, file);

      if (uploadError) {
        toast.error(`No se pudo subir ${file.name}`, { description: uploadError.message });
        continue;
      }

      const { data: userData } = await supabase.auth.getUser();
      const { data, error: insertError } = await supabase
        .from("archivos_cliente")
        .insert({
          cliente_id: clienteId,
          operacion_id: operacionId ?? null,
          nombre_archivo: file.name,
          storage_path: path,
          subido_por: userData.user?.id,
        })
        .select("id, nombre_archivo, storage_path, created_at")
        .single();

      if (insertError) {
        toast.error(`No se pudo registrar ${file.name}`, { description: insertError.message });
        continue;
      }

      setArchivos((prev) => [data, ...prev]);
      toast.success(`${file.name} subido correctamente`);
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDownload(archivo: ArchivoRow) {
    const tab = window.open("", "_blank");
    startTransition(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("archivos-clientes")
        .createSignedUrl(archivo.storage_path, 60);

      if (error || !data) {
        tab?.close();
        toast.error("No se pudo generar el link de descarga");
        return;
      }
      if (tab) tab.location.href = data.signedUrl;
    });
  }

  return (
    <div className="space-y-4">
      <div
        className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border/70 px-6 py-8 text-center transition-colors hover:border-primary/40 hover:bg-accent/20"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="space-y-1">
          {uploading ? (
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          ) : (
            <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {uploading
              ? "Subiendo archivo..."
              : 'Arrastrá archivos acá o hacé click para elegirlos'}
          </p>
        </div>
      </div>

      {archivos.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Todavía no hay archivos subidos.
        </p>
      ) : (
        <div className="divide-y divide-border/60">
          {archivos.map((archivo) => (
            <div key={archivo.id} className="flex items-center justify-between gap-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{archivo.nombre_archivo}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(archivo.created_at).toLocaleDateString("es-AR")}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={isPending}
                onClick={() => handleDownload(archivo)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
