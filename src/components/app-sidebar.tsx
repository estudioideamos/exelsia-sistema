"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ship,
  Users,
  Globe2,
  Coins,
  FileSignature,
  Truck,
  Building2,
  Settings,
  History,
  ChevronsLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExelsiaLogo } from "@/components/exelsia-logo";
import { LogoutButton } from "@/components/logout-button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/operaciones", label: "Operaciones", icon: Ship },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/historial", label: "Historial", icon: History },
];

const catalogos = [
  { href: "/catalogos/paises", label: "Países", icon: Globe2 },
  { href: "/catalogos/divisas", label: "Divisas", icon: Coins },
  { href: "/catalogos/incoterms", label: "Incoterms", icon: FileSignature },
  { href: "/catalogos/vias", label: "Vías", icon: Truck },
  { href: "/catalogos/exportadores", label: "Exportadores", icon: Building2 },
];

const STORAGE_KEY = "exelsia_sidebar_collapsed";

function NavLink({
  href,
  label,
  icon: Icon,
  collapsed,
}: (typeof nav)[number] & { collapsed: boolean }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-sidebar-primary/15 text-sidebar-primary"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {collapsed ? null : label}
    </Link>
  );
}

export function AppSidebar({
  user,
}: {
  user: { email: string; nombre: string | null; role: "admin" | "cliente" };
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
    setHydrated(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const initials = (user.nombre || user.email)
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <aside
      className={cn(
        "relative hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex",
        hydrated ? "transition-[width] duration-200" : "",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <div className={cn("flex items-center px-5 py-6", collapsed && "justify-center px-0")}>
        <ExelsiaLogo height={collapsed ? 32 : 46} iconOnly={collapsed} />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-3 py-2">
        <div className="space-y-1">
          {nav.map((item) => (
            <NavLink key={item.href} {...item} collapsed={collapsed} />
          ))}
        </div>

        <div>
          {collapsed ? (
            <div className="mx-auto mb-2 h-px w-6 bg-sidebar-border" />
          ) : (
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              Catálogos
            </p>
          )}
          <div className="space-y-1">
            {catalogos.map((item) => (
              <NavLink key={item.href} {...item} collapsed={collapsed} />
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <NavLink href="/configuracion" label="Configuración" icon={Settings} collapsed={collapsed} />
        <div
          className={cn(
            "mt-2 flex items-center gap-3 rounded-lg px-3 py-2",
            collapsed && "flex-col gap-2 px-0"
          )}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {collapsed ? (
            <LogoutButton />
          ) : (
            <>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-xs font-medium">{user.nombre || user.email}</p>
                <p className="text-[11px] text-sidebar-foreground/50">
                  {user.role === "admin" ? "Administrador" : "Cliente"}
                </p>
              </div>
              <LogoutButton />
            </>
          )}
        </div>
      </div>

      <button
        onClick={toggle}
        title={collapsed ? "Expandir menú" : "Colapsar menú"}
        className={cn(
          "flex items-center gap-2 border-t border-sidebar-border px-3 py-2.5 text-xs font-medium text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
          collapsed && "justify-center"
        )}
      >
        <ChevronsLeft
          className={cn("h-4 w-4 shrink-0 transition-transform", collapsed && "rotate-180")}
        />
        {collapsed ? null : "Colapsar menú"}
      </button>
    </aside>
  );
}
