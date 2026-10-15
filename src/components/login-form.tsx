"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ pedirCodigo = false }: { pedirCodigo?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [pasoCodigo, setPasoCodigo] = useState(pedirCodigo);
  const router = useRouter();

  async function verificarCodigo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const codigo = String(new FormData(event.currentTarget).get("codigo")).trim();

    const supabase = createClient();
    const { data: factores } = await supabase.auth.mfa.listFactors();
    const factor = factores?.totp.find((f) => f.status === "verified");
    if (!factor) {
      setLoading(false);
      toast.error("No encontramos tu verificación en dos pasos");
      return;
    }

    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factor.id,
      code: codigo,
    });
    setLoading(false);

    if (error) {
      toast.error("El código no es válido", {
        description: "Revisá el código actual en tu app de autenticación.",
      });
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      toast.error("No pudimos iniciar sesión", { description: error.message });
      return;
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    setLoading(false);
    if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      setPasoCodigo(true);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (pasoCodigo) {
    return (
      <Card className="w-full max-w-sm border-border/60 bg-card/60 shadow-2xl shadow-primary/5 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Verificación en dos pasos</CardTitle>
          <CardDescription>
            Ingresá el código de 6 dígitos de tu app de autenticación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={verificarCodigo}>
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="codigo"
                  name="codigo"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  placeholder="000000"
                  required
                  autoFocus
                  className="pl-9 tracking-widest"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Verificar
            </Button>
            <button
              type="button"
              className="w-full text-xs text-muted-foreground hover:underline"
              onClick={async () => {
                await createClient().auth.signOut();
                setPasoCodigo(false);
                router.replace("/login");
                router.refresh();
              }}
            >
              Volver e ingresar con otra cuenta
            </button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm border-border/60 bg-card/60 shadow-2xl shadow-primary/5 backdrop-blur-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
        <CardDescription>Ingresá con tu cuenta de Exelsia</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nombre@exelsia.com.ar"
                required
                autoComplete="email"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="pl-9"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Ingresar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
