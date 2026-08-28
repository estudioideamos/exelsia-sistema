import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { ExelsiaLogo } from "@/components/exelsia-logo";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      {/* ambient glow background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-chart-2/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0,transparent_calc(100%-1px),var(--border)_100%),linear-gradient(to_bottom,transparent_0,transparent_calc(100%-1px),var(--border)_100%)] bg-[size:64px_64px] opacity-[0.15]" />
      </div>

      {/* left branding panel */}
      <div className="relative z-10 hidden w-1/2 flex-col items-start justify-center p-16 lg:flex">
        <div className="max-w-md space-y-6">
          <ExelsiaLogo height={64} />
          <div className="space-y-4">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Nueva plataforma de gestión
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground text-balance">
              Comercio exterior, bajo control.
            </h1>
            <p className="text-muted-foreground text-balance">
              Gestioná operaciones, clientes y documentación de importación y exportación desde
              un panel moderno, claro y en tiempo real.
            </p>
          </div>
        </div>
      </div>

      {/* right login panel */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="mb-8 lg:hidden">
          <ExelsiaLogo height={40} />
        </div>

        <LoginForm />

        <p className="mt-8 text-center text-xs text-muted-foreground">
          ¿Problemas para ingresar?{" "}
          <Link href="mailto:sistemas@exelsia.com.ar" className="text-primary hover:underline">
            Contactar a soporte
          </Link>
        </p>
      </div>
    </div>
  );
}
