"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { exportarDashboardPdf, type DashboardReporteData } from "@/lib/exportar";

export function DashboardExportButton({ data }: { data: DashboardReporteData }) {
  return (
    <Button variant="outline" size="sm" onClick={() => exportarDashboardPdf(data)}>
      <FileDown className="h-4 w-4" />
      Exportar PDF
    </Button>
  );
}
