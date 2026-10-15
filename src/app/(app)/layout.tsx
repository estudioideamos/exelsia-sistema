import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { getPerfilActual } from "@/lib/data";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, mfaPendiente } = await getPerfilActual();

  if (!user) redirect("/login");
  if (mfaPendiente) redirect("/login?mfa=1");
  if (profile?.role === "cliente") redirect("/portal");

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar
        user={{
          email: user.email ?? "",
          nombre: profile?.nombre ?? null,
          role: profile?.role ?? "cliente",
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav
          variant="admin"
          user={{
            email: user.email ?? "",
            nombre: profile?.nombre ?? null,
            etiqueta: "Administrador",
          }}
        />
        {children}
      </div>
    </div>
  );
}
