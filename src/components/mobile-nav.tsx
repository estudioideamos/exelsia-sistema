"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, LogOut, Menu, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ExelsiaLogo } from "@/components/exelsia-logo";
import { IdeamosCredit } from "@/components/ideamos-credit";
import { createClient } from "@/lib/supabase/client";
import { nav as navAdmin, catalogos } from "@/components/app-sidebar";
import { nav as navPortal } from "@/components/portal-sidebar";

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const ITEMS_ADMIN_PIE: Item[] = [
  { href: "/manual", label: "Manual", icon: BookOpen },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

function Enlace({ item, onNavigate }: { item: Item; onNavigate: () => void }) {
  const pathname = usePathname();
  const activo =
    pathname === item.href || (item.href !== "/portal" && pathname.startsWith(item.href + "/"));
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        activo
          ? "bg-sidebar-primary/15 text-sidebar-primary"
          : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}

export function MobileNav({
  variant,
  user,
}: {
  variant: "admin" | "portal";
  user: { email: string; nombre: string | null; etiqueta: string };
}) {
  const [abierto, setAbierto] = useState(false);
  const router = useRouter();
  const cerrar = () => setAbierto(false);

  const iniciales = (user.nombre || user.email)
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  async function cerrarSesion() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground lg:hidden">
      <ExelsiaLogo height={30} />

      <Sheet open={abierto} onOpenChange={setAbierto}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Abrir menú" className="h-10 w-10">
              <Menu className="h-5 w-5" />
            </Button>
          }
        />
        <SheetContent
          side="left"
          showCloseButton
          className="w-72 max-w-[85vw] gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Menú</SheetTitle>

          <div className="px-5 py-5">
            <ExelsiaLogo height={36} />
          </div>

          <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-3">
            <div className="space-y-1">
              {(variant === "admin" ? navAdmin : navPortal).map((item) => (
                <Enlace key={item.href} item={item} onNavigate={cerrar} />
              ))}
            </div>

            {variant === "admin" ? (
              <div>
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                  Catálogos
                </p>
                <div className="space-y-1">
                  {catalogos.map((item) => (
                    <Enlace key={item.href} item={item} onNavigate={cerrar} />
                  ))}
                </div>
              </div>
            ) : null}

            {variant === "admin" ? (
              <div className="space-y-1 border-t border-sidebar-border pt-3">
                {ITEMS_ADMIN_PIE.map((item) => (
                  <Enlace key={item.href} item={item} onNavigate={cerrar} />
                ))}
              </div>
            ) : null}
          </nav>

          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-sidebar-primary/20 text-xs text-sidebar-primary">
                  {iniciales}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium">{user.nombre || user.email}</p>
                <p className="truncate text-xs text-sidebar-foreground/50">{user.etiqueta}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={cerrarSesion}
              className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
            <IdeamosCredit
              className="mt-3 w-full justify-center text-sidebar-foreground/40"
              height={12}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
