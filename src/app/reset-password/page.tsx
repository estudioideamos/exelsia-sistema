"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExelsiaLogo } from "@/components/exelsia-logo";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [listo, setListo] = useState(false);
  const [validando, setValidando] = useState(true);
  const [loading, setLoading] = useState(false);
  const [actualizado, setActualizado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        setValidando(false);
        if (error) setError("Este link ya no es válido. Pedí uno nuevo.");
        else setListo(true);
      });
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidando(false);
        setListo(true);
      }
    });

    const timeout = setTimeout(() => {
      setValidando(false);
      setListo((current) => current);
    }, 2500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password"));
    const confirmacion = String(formData.get("confirmacion"));

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setActualizado(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1800);
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-drift-a absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-primary/25 blur-[120px]" />
        <div className="animate-drift-b absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-chart-2/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <div className="mb-8">
          <ExelsiaLogo height={44} />
        </div>

        <Card className="w-full border-border/60 bg-card/60 shadow-2xl shadow-primary/5 backdrop-blur-xl">
          {actualizado ? (
            <CardContent className="space-y-4 pt-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
              <p className="font-medium">Contraseña actualizada</p>
              <p className="text-sm text-muted-foreground">Te estamos redirigiendo...</p>
            </CardContent>
          ) : validando ? (
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Validando el link...</p>
            </CardContent>
          ) : !listo ? (
            <CardContent className="space-y-4 pt-6 text-center">
              <p className="text-sm text-destructive">
                {error ?? "Este link no es válido o expiró."}
              </p>
              <Button
                variant="outline"
                className="w-full"
                nativeButton={false}
                render={<Link href="/forgot-password">Pedir un nuevo link</Link>}
              />
            </CardContent>
          ) : (
            <>
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
                <CardDescription>Elegí una contraseña nueva para tu cuenta.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmacion">Confirmar contraseña</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmacion"
                        name="confirmacion"
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  {error ? <p className="text-sm text-destructive">{error}</p> : null}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Guardar contraseña
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
