import type { Metadata } from "next";
import { Providers } from "./providers";
import { ToastContainer } from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s — EAC Sistema",
    default: "EAC — Escola para Anciãos de Congregação",
  },
  description: "Sistema de gestão da Escola para Anciãos de Congregação — turmas, designações e avaliações.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-AO">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <ToastContainer />
      </body>
    </html>
  );
}
