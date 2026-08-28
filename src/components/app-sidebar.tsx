"use client";

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
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExelsiaLogo } from "@/components/exelsia-logo";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/operaciones", label: "Operaciones", icon: Ship },
  { href: "/clientes", label: "Clientes", icon: Users },
];

const catalogos = [
  { href: "/catalogos/paises", label: "Países", icon: Globe2 },
  { href: "/catalogos/divisas", label: "Divisas", icon: Coins },
  { href: "/catalogos/incoterms", label: "Incoterms", icon: FileSignature },
  { href: "/catalogos/vias", label: "Vías", icon: Truck },
  { href: "/catalogos/exportadores", label: "Exportadores", icon: Building2 },
];

function NavLink({ href, label, icon: Icon }: (typeof nav)[number]) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-primary/15 text-sidebar-primary"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex items-center px-5 py-6">
        <ExelsiaLogo height={46} />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {nav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>

        <div>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Catálogos
          </p>
          <div className="space-y-1">
            {catalogos.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <NavLink href="/configuracion" label="Configuración" icon={Settings} />
        <div className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary text-xs">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs font-medium">admin@exelsia.com.ar</p>
            <p className="text-[11px] text-sidebar-foreground/50">Administrador</p>
          </div>
          <Link
            href="/login"
            className="text-sidebar-foreground/40 hover:text-sidebar-foreground"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
