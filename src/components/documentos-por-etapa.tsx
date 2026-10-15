"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ESTADOS } from "@/lib/mock-data";
import { TIPOS_ARCHIVO } from "@/lib/tipos-archivo";
import type { DocumentoEtapa } from "@/lib/data";
import { setDocumentoEtapa } from "@/app/(app)/configuracion/actions";

const clave = (estado: string, tipo: string) => `${estado}|${tipo}`;

export function DocumentosPorEtapa({ documentos }: { documentos: DocumentoEtapa[] }) {
  const [activos, setActivos] = useState(
    () => new Set(documentos.map((d) => clave(d.estado, d.tipo)))
  );
  const [, startTransition] = useTransition();

  const [documentosOrigen, setDocumentosOrigen] = useState(documentos);
  if (documentosOrigen !== documentos) {
    setDocumentosOrigen(documentos);
    setActivos(new Set(documentos.map((d) => clave(d.estado, d.tipo))));
  }

  function alternar(estado: string, tipo: string, activo: boolean) {
    const k = clave(estado, tipo);
    setActivos((prev) => {
      const next = new Set(prev);
      if (activo) next.add(k);
      else next.delete(k);
      return next;
    });

    startTransition(async () => {
      try {
        await setDocumentoEtapa(estado, tipo, activo);
      } catch (err) {
        setActivos((prev) => {
          const next = new Set(prev);
          if (activo) next.delete(k);
          else next.add(k);
          return next;
        });
        toast.error("No se pudo guardar el cambio", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  const etapas = Object.entries(ESTADOS);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Documentos que acompañan cada aviso</CardTitle>
        <CardDescription>
          Al cambiar una operación de etapa, el mail incluye links de descarga de los archivos de
          esa operación cuyo tipo esté tildado acá. Los links vencen a los 7 días. Sin nada
          tildado, el aviso sale sin documentos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="min-w-48">Tipo de archivo</TableHead>
                {etapas.map(([estado, { label, className }]) => (
                  <TableHead key={estado} className="text-center">
                    <Badge variant="outline" className={className}>
                      {label}
                    </Badge>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {TIPOS_ARCHIVO.map((tipo) => (
                <TableRow key={tipo}>
                  <TableCell className="font-medium">{tipo}</TableCell>
                  {etapas.map(([estado, { label }]) => (
                    <TableCell key={estado} className="text-center">
                      <Checkbox
                        checked={activos.has(clave(estado, tipo))}
                        onCheckedChange={(checked) => alternar(estado, tipo, checked === true)}
                        aria-label={`${tipo} en ${label}`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
