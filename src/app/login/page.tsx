import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { ExelsiaLogo } from "@/components/exelsia-logo";

const PARTICLES = [
  { left: "6%", size: 3, duration: 14, delay: 0, drift: 30, opacity: 0.5 },
  { left: "14%", size: 2, duration: 19, delay: 3, drift: -20, opacity: 0.4 },
  { left: "23%", size: 4, duration: 16, delay: 6, drift: 15, opacity: 0.55 },
  { left: "34%", size: 2, duration: 21, delay: 1, drift: -35, opacity: 0.35 },
  { left: "45%", size: 3, duration: 17, delay: 8, drift: 25, opacity: 0.5 },
  { left: "58%", size: 2, duration: 20, delay: 4, drift: -15, opacity: 0.4 },
  { left: "67%", size: 4, duration: 15, delay: 2, drift: 20, opacity: 0.55 },
  { left: "76%", size: 3, duration: 18, delay: 9, drift: -25, opacity: 0.45 },
  { left: "85%", size: 2, duration: 22, delay: 5, drift: 30, opacity: 0.4 },
  { left: "92%", size: 3, duration: 16, delay: 7, drift: -10, opacity: 0.5 },
];

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      {/* ambient glow background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-drift-a absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-primary/25 blur-[120px]" />
        <div className="animate-drift-b absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-chart-2/20 blur-[120px]" />
        <div className="animate-grid-pulse absolute inset-0 bg-[linear-gradient(to_right,transparent_0,transparent_calc(100%-1px),var(--border)_100%),linear-gradient(to_bottom,transparent_0,transparent_calc(100%-1px),var(--border)_100%)] bg-[size:64px_64px]" />
        <div className="animate-scan-sweep absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="animate-float-particle absolute bottom-0 rounded-full bg-primary"
            style={
              {
                left: p.left,
                width: p.size,
                height: p.size,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                "--drift": `${p.drift}px`,
                "--particle-opacity": p.opacity,
              } as React.CSSProperties
            }
          />
        ))}
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

        <a
          href="https://ideamos.com.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-6 flex items-center gap-1.5 text-[11px] text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          Hecho por
          <span className="font-semibold text-muted-foreground transition-colors group-hover:text-primary">
            Estudio Ideamos
          </span>
        </a>
      </div>
    </div>
  );
}
