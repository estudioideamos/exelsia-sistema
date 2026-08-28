"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Ship, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type ResultadoOperacion = {
  id: string;
  orden: string;
  awb_bl: string | null;
  clientes: { nombre: string } | null;
};

type ResultadoCliente = {
  id: string;
  nombre: string;
  cuit: string | null;
};

export function GlobalSearch({
  operacionesBasePath,
  includeClientes = true,
}: {
  operacionesBasePath: string;
  includeClientes?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [operaciones, setOperaciones] = useState<ResultadoOperacion[]>([]);
  const [clientes, setClientes] = useState<ResultadoCliente[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setOperaciones([]);
      setClientes([]);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      const supabase = createClient();
      const [opsRes, clientesRes] = await Promise.all([
        supabase
          .from("operaciones")
          .select("id, orden, awb_bl, clientes(nombre)")
          .or(`orden.ilike.%${q}%,awb_bl.ilike.%${q}%`)
          .limit(5),
        includeClientes
          ? supabase.from("clientes").select("id, nombre, cuit").ilike("nombre", `%${q}%`).limit(5)
          : Promise.resolve({ data: [] as ResultadoCliente[] }),
      ]);
      setOperaciones((opsRes.data ?? []) as unknown as ResultadoOperacion[]);
      setClientes((clientesRes.data ?? []) as ResultadoCliente[]);
      setLoading(false);
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  function goTo(path: string) {
    router.push(path);
    setOpen(false);
    setQuery("");
  }

  const sinResultados =
    !loading && query.trim().length >= 2 && operaciones.length === 0 && clientes.length === 0;

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Buscar orden, cliente, AWB/BL..."
        className="w-72 pl-9"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {open && query.trim().length >= 2 && (
        <div className="absolute right-0 top-full z-30 mt-2 w-96 rounded-lg border border-border/60 bg-popover shadow-lg">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : sinResultados ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Sin resultados para &quot;{query}&quot;.
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto p-1">
              {operaciones.length > 0 && (
                <div>
                  <p className="px-2 pt-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Operaciones
                  </p>
                  {operaciones.map((op) => (
                    <button
                      key={op.id}
                      onClick={() => goTo(`${operacionesBasePath}/${op.id}`)}
                      className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
                    >
                      <Ship className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate">
                        <span className="font-medium">{op.orden}</span>
                        {op.clientes?.nombre ? (
                          <span className="text-muted-foreground"> · {op.clientes.nombre}</span>
                        ) : null}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {clientes.length > 0 && (
                <div>
                  <p className="px-2 pt-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Clientes
                  </p>
                  {clientes.map((cliente) => (
                    <button
                      key={cliente.id}
                      onClick={() => goTo(`/clientes/${cliente.id}`)}
                      className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
                    >
                      <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate">
                        <span className="font-medium">{cliente.nombre}</span>
                        {cliente.cuit ? (
                          <span className="text-muted-foreground"> · CUIT {cliente.cuit}</span>
                        ) : null}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
