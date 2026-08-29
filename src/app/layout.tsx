import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://exelsia-sistema.vercel.app"),
  title: {
    default: "Exelsia | Sistema de Operaciones",
    template: "%s | Exelsia",
  },
  description:
    "Plataforma interna de Exelsia para la gestión de operaciones, clientes y documentación de comercio exterior.",
  applicationName: "Exelsia | Sistema de Operaciones",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Exelsia | Sistema de Operaciones",
    description:
      "Plataforma interna de Exelsia para la gestión de operaciones, clientes y documentación de comercio exterior.",
    url: "https://exelsia-sistema.vercel.app",
    siteName: "Exelsia | Sistema de Operaciones",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Exelsia | Sistema de Operaciones",
    description:
      "Plataforma interna de Exelsia para la gestión de operaciones, clientes y documentación de comercio exterior.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
