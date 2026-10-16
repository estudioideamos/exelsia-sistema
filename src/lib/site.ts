// Dirección pública del sistema. Cuando se configure el dominio propio, alcanza con
// definir NEXT_PUBLIC_SITE_URL en Vercel.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://exelsia-sistema.vercel.app"
).replace(/\/$/, "");

export function urlOperacionPortal(operacionId: string) {
  return `${SITE_URL}/portal/operaciones/${operacionId}`;
}
