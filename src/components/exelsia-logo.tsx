import Image from "next/image";
import { cn } from "@/lib/utils";

export function ExelsiaLogo({ className, height = 32 }: { className?: string; height?: number }) {
  const width = Math.round((height * 478) / 142);
  return (
    <Image
      src="/exelsia-logo.png"
      alt="Exelsia — Foreign Trade Consulting"
      width={width}
      height={height}
      priority
      className={cn("rounded-sm object-contain", className)}
      style={{ height, width: "auto" }}
    />
  );
}
