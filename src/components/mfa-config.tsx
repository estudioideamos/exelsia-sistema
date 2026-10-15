"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Enrolamiento = { factorId: string; qr: string; secreto: string };

export function MfaConfig() {
  const [cargando, setCargando] = useState(true);
  const [factorActivo, setFactorActivo] = useState<string | null>(null);
  const [enrolamiento, setEnrolamiento] = useState<Enrolamiento | null>(null);
  const [codigo, setCodigo] = useState("");
  const [trabajando, setTrabajando] = useState(false);

  const cargar = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    const verificado = data?.totp.find((f) => f.status === "verified");
    setFactorActivo(verificado?.id ?? null);
    setCargando(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, [cargar]);

  async function iniciar() {
    setTrabajando(true);
    const supabase = createClient();

    // Si quedó un intento a medias, se descarta antes de crear uno nuevo.
    const { data: existentes } = await supabase.auth.mfa.listFactors();
    for (const f of existentes?.all ?? []) {
      if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      issuer: "Exelsia",
      friendlyName: "Exelsia",
    });
    setTrabajando(false);
    if (error || !data) {
      toast.error("No pudimos iniciar la activación", { description: error?.message });
      return;
    }
    setEnrolamiento({ factorId: data.id, qr: data.totp.qr_code, secreto: data.totp.secret });
  }

  async function confirmar(event: FormEvent) {
    event.preventDefault();
    if (!enrolamiento) return;
    setTrabajando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enrolamiento.factorId,
      code: codigo.trim(),
    });
    setTrabajando(false);
    if (error) {
      toast.error("El código no es válido", { description: "Revisá que el reloj del celular esté en hora." });
      return;
    }
    toast.success("Verificación en dos pasos activada");
    setEnrolamiento(null);
    setCodigo("");
    await cargar();
  }

  async function desactivar() {
    if (!factorActivo) return;
    setTrabajando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factorActivo });
    setTrabajando(false);
    if (error) {
      toast.error("No pudimos desactivarla", { description: error.message });
      return;
    }
    toast.success("Verificación en dos pasos desactivada");
    await cargar();
  }

  async function cancelar() {
    if (enrolamiento) {
      await createClient().auth.mfa.unenroll({ factorId: enrolamiento.factorId });
    }
    setEnrolamiento(null);
    setCodigo("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4" />
          Verificación en dos pasos
        </CardTitle>
        <CardDescription>
          Además de la contraseña, el ingreso pide un código de 6 dígitos de una app de
          autenticación en tu celular (Google Authenticator, Microsoft Authenticator, Authy).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cargando ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : factorActivo ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-emerald-500">Activada para tu cuenta.</p>
            <Button variant="outline" onClick={desactivar} disabled={trabajando}>
              {trabajando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Desactivar
            </Button>
          </div>
        ) : enrolamiento ? (
          <form onSubmit={confirmar} className="space-y-4">
            <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Abrí la app de autenticación en tu celular y agregá una cuenta nueva.</li>
              <li>Escaneá este código QR.</li>
              <li>Escribí abajo el código de 6 dígitos que te muestra la app.</li>
            </ol>
            <div className="flex flex-wrap items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={enrolamiento.qr}
                alt="Código QR para la app de autenticación"
                className="h-40 w-40 rounded-md bg-white p-2"
              />
              <p className="max-w-xs text-xs text-muted-foreground">
                Si no podés escanear, cargá esta clave a mano en la app:
                <span className="mt-1 block break-all font-mono text-foreground">
                  {enrolamiento.secreto}
                </span>
              </p>
            </div>
            <div className="max-w-xs space-y-2">
              <Label htmlFor="mfa-codigo">Código de 6 dígitos</Label>
              <Input
                id="mfa-codigo"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={trabajando || codigo.length !== 6}>
                {trabajando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Activar
              </Button>
              <Button type="button" variant="ghost" onClick={cancelar}>
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Todavía no está activada.</p>
            <Button onClick={iniciar} disabled={trabajando}>
              {trabajando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Activar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
