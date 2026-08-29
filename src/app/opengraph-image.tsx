import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Exelsia | Sistema de Operaciones";

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), "public", "exelsia-logo.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #15171e 0%, #0c0d11 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(220,38,38,0.35) 0%, rgba(220,38,38,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            right: -100,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0) 70%)",
            display: "flex",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={440} height={131} alt="" style={{ marginBottom: 36 }} />
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: "#f4f4f5",
            letterSpacing: -0.5,
          }}
        >
          Sistema de Operaciones
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 22,
            color: "#9ca3af",
          }}
        >
          Gestión de comercio exterior en tiempo real
        </div>
      </div>
    ),
    { ...size }
  );
}
