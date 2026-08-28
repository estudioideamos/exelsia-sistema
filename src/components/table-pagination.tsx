"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OPCIONES_TAMANO = [10, 20, 30, 50, 100];

export function usePagination<T>(items: T[], initialPageSize = 20) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const pageCount = pageSize === -1 ? 1 : Math.max(1, Math.ceil(items.length / pageSize));
  const paginaActual = Math.min(page, pageCount);

  const paginated = useMemo(() => {
    if (pageSize === -1) return items;
    const start = (paginaActual - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, paginaActual, pageSize]);

  function setPageSize(size: number) {
    setPageSizeState(size);
    setPage(1);
  }

  return {
    page: paginaActual,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    paginated,
    total: items.length,
  };
}

export function TablePagination({
  page,
  setPage,
  pageSize,
  setPageSize,
  pageCount,
  total,
}: {
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  pageCount: number;
  total: number;
}) {
  if (total === 0) return null;

  const start = pageSize === -1 ? 1 : (page - 1) * pageSize + 1;
  const end = pageSize === -1 ? total : Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Mostrando {start}–{end} de {total}
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Resultados por página</span>
          <Select
            value={pageSize === -1 ? "todo" : String(pageSize)}
            onValueChange={(v) => setPageSize(v === "todo" ? -1 : Number(v))}
          >
            <SelectTrigger className="h-8 w-[80px] text-xs">
              <SelectValue>
                {() => (pageSize === -1 ? "Todo" : String(pageSize))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {OPCIONES_TAMANO.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
              <SelectItem value="todo">Todo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-[70px] text-center text-xs text-muted-foreground">
            Página {page} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= pageCount}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
