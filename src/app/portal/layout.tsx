import { redirect } from "next/navigation";
import { PortalSidebar } from "@/components/portal-sidebar";
import { getPerfilActual } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getPerfilActual();
  if (!user) redirect("/login");
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
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
