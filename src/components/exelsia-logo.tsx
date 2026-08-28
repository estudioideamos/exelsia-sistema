import Image from "next/image";
import { cn } from "@/lib/utils";

export function ExelsiaLogo({
  className,
  height = 32,
  iconOnly = false,
}: {
  className?: string;
  height?: number;
  iconOnly?: boolean;
}) {
  const width = iconOnly ? height : Math.round((height * 478) / 142);
  return (
    <Image
      src={iconOnly ? "/exelsia-icon.png" : "/exelsia-logo.png"}
      alt="Exelsia — Foreign Trade Consulting"
      width={width}
      height={height}
      priority
      className={cn("rounded-sm object-contain", className)}
      style={{ height, width: "auto" }}
    />
  );
}
