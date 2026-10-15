// Los reportes imprimibles se arman como HTML en una ventana nueva (mismo origen que la
// sesión). Todo dato que venga de la base o de un Excel importado se escapa antes de
// interpolarlo, para que un nombre con "<script>" no pueda ejecutarse.
export function esc(valor: unknown): string {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
