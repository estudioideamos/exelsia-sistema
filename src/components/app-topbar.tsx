import { NotificationsBell } from "@/components/notifications-bell";
import { GlobalSearch } from "@/components/global-search";

export function AppTopbar({
  title,
  description,
  notificationsBasePath = "/operaciones",
  includeClientesInSearch = true,
}: {
  title: string;
  description?: string;
  notificationsBasePath?: string;
  includeClientesInSearch?: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border/60 bg-background/80 px-6 py-4 backdrop-blur-xl">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <GlobalSearch
          operacionesBasePath={notificationsBasePath}
          includeClientes={includeClientesInSearch}
        />
        <NotificationsBell basePath={notificationsBasePath} />
      </div>
    </header>
  );
}
