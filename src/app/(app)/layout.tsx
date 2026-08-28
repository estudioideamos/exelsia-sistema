import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, nombre")
    .eq("id", authUser.id)
    .maybeSingle();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar
        user={{
          email: authUser.email ?? "",
          nombre: profile?.nombre ?? null,
          role: profile?.role ?? "cliente",
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
