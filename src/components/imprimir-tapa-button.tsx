"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { imprimirTapaCarpeta, type DatosTapa } from "@/lib/tapa-carpeta";

export function ImprimirTapaButton({ datos }: { datos: DatosTapa }) {
  return (
    <Button size="sm" variant="outline" onClick={() => imprimirTapaCarpeta(datos)}>
      <Printer className="h-3.5 w-3.5" />
      Tapa de carpeta
    </Button>
  );
}
