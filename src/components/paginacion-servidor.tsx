"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TablePagination } from "@/components/table-pagination";

export function PaginacionServidor({
  page,
  pageSize,
  total,
  position,
}: {
  page: number;
  pageSize: number;
  total: number;
  position?: "top" | "bottom";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function irA(nuevaPagina: number, nuevoTamano: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nuevaPagina));
    params.set("size", String(nuevoTamano));
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <TablePagination
      position={position}
      page={page}
      setPage={(p) => irA(p, pageSize)}
      pageSize={pageSize}
      setPageSize={(size) => irA(1, size)}
      pageCount={Math.max(1, Math.ceil(total / pageSize))}
      total={total}
      mostrarTodo={false}
    />
  );
}
