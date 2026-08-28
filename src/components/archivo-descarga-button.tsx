"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function ArchivoDescargaButton({ storagePath }: { storagePath: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDownload() {
    const tab = window.open("", "_blank");
    startTransition(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("archivos-clientes")
        .createSignedUrl(storagePath, 60);

      if (error || !data) {
        tab?.close();
        toast.error("No se pudo generar el link de descarga");
        return;
      }
      if (tab) tab.location.href = data.signedUrl;
    });
  }

  return (
    <Button variant="ghost" size="icon" disabled={isPending} onClick={handleDownload}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
    </Button>
  );
}
