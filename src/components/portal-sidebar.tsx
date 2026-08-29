"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ship, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExelsiaLogo } from "@/components/exelsia-logo";
import { LogoutButton } from "@/components/logout-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const nav = [
  { href: "/portal", label: "Mis operaciones", icon: Ship },
  { href: "/portal/perfil", label: "Mi perfil", icon: UserRound },
];

function NavLink({ href, label, icon: Icon }: (typeof nav)[number]) {
  const pathname = usePathname();
  const active = pathname === href;
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

export function PortalSidebar({
  user,
}: {
  user: { email: string; nombre: string | null; clienteNombre: string };
}) {
  const initials = (user.nombre || user.email)
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="relative hidden w-64 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-drift-a absolute -left-24 -top-32 h-72 w-72 rounded-full bg-primary/25 blur-[90px]" />
        <div className="animate-drift-b absolute -bottom-32 -right-16 h-64 w-64 rounded-full bg-chart-2/15 blur-[90px]" />
        <div className="animate-grid-pulse absolute inset-0 bg-[linear-gradient(to_right,transparent_0,transparent_calc(100%-1px),var(--sidebar-border)_100%),linear-gradient(to_bottom,transparent_0,transparent_calc(100%-1px),var(--sidebar-border)_100%)] bg-[size:28px_28px] opacity-[0.15]" />
      </div>

      <div className="relative flex items-center px-5 py-6">
        <ExelsiaLogo height={46} />
      </div>

      <div className="px-3 pb-4">
        <p className="rounded-lg bg-sidebar-accent px-3 py-2 text-xs text-sidebar-foreground/70">
          Portal de cliente
          <span className="mt-0.5 block truncate text-sm font-medium text-sidebar-foreground">
            {user.clienteNombre}
          </span>
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {nav.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs font-medium">{user.nombre || user.email}</p>
            <p className="text-[11px] text-sidebar-foreground/50">Cliente</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
