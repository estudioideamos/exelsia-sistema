import { NotificationsBell } from "@/components/notifications-bell";
import { GlobalSearch } from "@/components/global-search";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppTopbar({
  title,
  description,
  notificationsBasePath = "/operaciones",
  includeClientesInSearch = true,
  children,
}: {
  title: string;
  description?: string;
  notificationsBasePath?: string;
  includeClientesInSearch?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <header className="sticky top-14 z-20 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4 lg:top-0">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {title}
        </h1>
        {description ? (
          <p className="truncate text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {children}
        <GlobalSearch
          operacionesBasePath={notificationsBasePath}
          includeClientes={includeClientesInSearch}
        />
        <NotificationsBell basePath={notificationsBasePath} />
        <ThemeToggle />
      </div>
    </header>
  );
}
