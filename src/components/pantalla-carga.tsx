import { Skeleton } from "@/components/ui/skeleton";

export function PantallaCarga() {
  return (
    <div className="flex-1" aria-busy="true" aria-live="polite">
      <div className="flex h-[73px] items-center justify-between border-b border-border/60 px-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="space-y-2 rounded-xl border border-border/60 p-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
