"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExelsiaLogo } from "@/components/exelsia-logo";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEnviado(true);
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
          {enviado ? (
            <CardContent className="space-y-4 pt-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
              <div>
                <p className="font-medium">Revisá tu email</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Si esa dirección tiene una cuenta, te enviamos un link para restablecer tu
                  contraseña.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                nativeButton={false}
                render={
                  <Link href="/login">
                    <ArrowLeft className="h-4 w-4" />
                    Volver al login
                  </Link>
                }
              />
            </CardContent>
          ) : (
            <>
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
                <CardDescription>
                  Te enviamos un link para elegir una nueva contraseña.
                </CardDescription>
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
                  {error ? <p className="text-sm text-destructive">{error}</p> : null}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Enviar link de recuperación
                  </Button>
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Volver al login
                  </Link>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
