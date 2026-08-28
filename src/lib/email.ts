import { Resend } from "resend";
import { ESTADOS, type EstadoOperacion } from "@/lib/mock-data";

export async function enviarAvisoCambioEstado({
  email,
  cliente,
  orden,
  nuevoEstado,
}: {
  email: string;
  cliente: string;
  orden: string;
  nuevoEstado: EstadoOperacion;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY no configurada — se omite el envío de email.");
    return false;
  }

  const resend = new Resend(apiKey);
  const estadoLabel = ESTADOS[nuevoEstado]?.label ?? nuevoEstado;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Exelsia <onboarding@resend.dev>",
    to: email,
    subject: `Actualización de tu operación ${orden}: ${estadoLabel}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #E02B20;">Exelsia</h2>
        <p>Hola ${cliente},</p>
        <p>Tu operación <strong>${orden}</strong> cambió de estado a:</p>
        <p style="font-size: 18px; font-weight: bold;">${estadoLabel}</p>
        <p>Podés ver el detalle completo ingresando al portal de Exelsia.</p>
        <p style="color: #888; font-size: 12px; margin-top: 32px;">
          Este es un aviso automático, no respondas a este email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Error enviando email de aviso:", error);
    return false;
  }

  return true;
}
