import { redirect } from "next/navigation";
import { PortalSidebar } from "@/components/portal-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { getPerfilActual } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, mfaPendiente } = await getPerfilActual();
  if (!user) redirect("/login");
  if (mfaPendiente) redirect("/login?mfa=1");
  if (profile?.role === "admin") redirect("/dashboard");
  if (!profile?.cliente_id) redirect("/login");

  const supabase = await createClient();
  const { data: cliente } = await supabase
    .from("clientes")
    .select("nombre")
    .eq("id", profile.cliente_id)
    .maybeSingle();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <PortalSidebar
        user={{
          email: user.email ?? "",
          nombre: profile.nombre,
          clienteNombre: cliente?.nombre ?? "",
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav
          variant="portal"
          user={{
            email: user.email ?? "",
            nombre: profile.nombre,
            etiqueta: cliente?.nombre ?? "Cliente",
          }}
        />
        {children}
      </div>
    </div>
  );
}
