import type { Metadata } from "next";
import { Providers } from "./providers";
import { ToastContainer } from "@/components/ui/Toast";
import { CookieConsent } from "@/components/ui/CookieConsent";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s — School-Lab",
    default: "School-Lab — Gestão Institucional",
  },
  description: "Sistema de gestão institucional — turmas, designações e avaliações.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-AO" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
        <ToastContainer />
        <CookieConsent />
      </body>
    </html>
  );
}
