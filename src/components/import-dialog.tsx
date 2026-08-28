"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
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
import { Loader2, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from "lucide-react";
import { parseArchivoImport } from "@/lib/importar";

export type ImportColumn = { label: string; key: string };

type Resultado = { errores: string[] } & Record<string, number>;

export function ImportDialog({
  trigger,
  titulo,
  descripcion,
  columnas,
  onImportar,
}: {
  trigger: React.ReactNode;
  titulo: string;
  descripcion?: string;
  columnas: ImportColumn[];
  onImportar: (filas: Record<string, string>[]) => Promise<Resultado>;
}) {
  const [open, setOpen] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [filas, setFilas] = useState<Record<string, string>[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setArchivo(null);
    setFilas(null);
    setResultado(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(file: File) {
    setArchivo(file);
    setResultado(null);
    setCargando(true);
    try {
      const filasCrudas = await parseArchivoImport(file);
      const mapeadas = filasCrudas.map((fila) => {
        const mapeada: Record<string, string> = {};
        for (const col of columnas) {
          const headerMatch = Object.keys(fila).find(
            (h) => h.toLowerCase() === col.label.toLowerCase()
          );
          mapeada[col.key] = headerMatch ? fila[headerMatch] : "";
        }
        return mapeada;
      });
      setFilas(mapeadas);
    } catch (err) {
      toast.error("No pudimos leer el archivo", {
        description: err instanceof Error ? err.message : undefined,
      });
      reset();
    } finally {
      setCargando(false);
    }
  }

  async function handleImportar() {
    if (!filas) return;
    setProcesando(true);
    try {
      const res = await onImportar(filas);
      setResultado(res);
      if (res.errores.length === 0) toast.success("Importación completa");
    } catch (err) {
      toast.error("No se pudo importar", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setProcesando(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>
            {descripcion ??
              `El archivo debe tener columnas: ${columnas.map((c) => c.label).join(", ")}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {!filas ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={cargando}
              className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {cargando ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Upload className="h-6 w-6" />
              )}
              {cargando ? "Leyendo archivo..." : "Hacé clic para elegir un archivo .xlsx o .csv"}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                <span className="min-w-0 flex-1 truncate">{archivo?.name}</span>
                <span className="text-xs text-muted-foreground">{filas.length} filas</span>
              </div>

              {resultado ? (
                <div className="space-y-2 rounded-lg border border-border/60 p-3 text-sm">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                    {Object.entries(resultado)
                      .filter(([k]) => k !== "errores")
                      .map(([k, v]) => `${v} ${k}`)
                      .join(" · ")}
                  </div>
                  {resultado.errores.length > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-amber-500">
                        <AlertTriangle className="h-4 w-4" />
                        {resultado.errores.length} fila(s) con problemas
                      </div>
                      <ul className="max-h-32 space-y-0.5 overflow-y-auto text-xs text-muted-foreground">
                        {resultado.errores.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter>
          {filas && !resultado ? (
            <Button variant="outline" onClick={reset} disabled={procesando}>
              Elegir otro archivo
            </Button>
          ) : null}
          {filas ? (
            resultado ? (
              <Button onClick={() => setOpen(false)}>Cerrar</Button>
            ) : (
              <Button onClick={handleImportar} disabled={procesando}>
                {procesando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Importar {filas.length} fila(s)
              </Button>
            )
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
