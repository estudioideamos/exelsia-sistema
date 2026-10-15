import Image from "next/image";
import { cn } from "@/lib/utils";

export function IdeamosCredit({
  className,
  height = 14,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <a
      href="https://ideamos.com.ar"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hecho por Estudio Ideamos"
      className={cn(
        "inline-flex items-center gap-2 text-[10px] leading-none text-muted-foreground/70 transition-opacity hover:opacity-80",
        className
      )}
    >
      <span>Hecho por</span>
      <span className="flex items-center rounded-md bg-[#151316] px-2.5 py-1.5 ring-1 ring-white/10">
        <Image
          src="/ideamos-logo.webp"
          alt="Ideamos"
          width={Math.round((height * 870) / 213)}
          height={height}
          style={{ height, width: "auto" }}
        />
      </span>
    </a>
  );
}
