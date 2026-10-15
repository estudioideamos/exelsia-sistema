import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { getPerfilActual } from "@/lib/data";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getPerfilActual();

  if (!user) redirect("/login");
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
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
