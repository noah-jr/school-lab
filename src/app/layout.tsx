import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { ToastContainer } from "@/components/ui/Toast";
import { CookieConsent } from "@/components/ui/CookieConsent";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://eac.ao"),
  title: {
    template: "%s — EAC",
    default: "Escola para Anciãos de Congregação — Gestão & Oratória",
  },
  description: "Plataforma avançada para automação de designações de oratória, gestão descentralizada de turmas e relatórios institucionais.",
  applicationName: "EAC",
  keywords: [
    "EAC",
    "Gestão de Escolas",
    "Designações de Oratória",
    "Controlo de Discursos",
    "Escola para Anciãos de Congregação",
    "Angola",
    "Automação",
    "SQLite"
  ],
  authors: [{ name: "VATECH INTERPRISES" }],
  creator: "VATECH INTERPRISES",
  publisher: "VATECH INTERPRISES",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
  },
  openGraph: {
    title: "EAC — Gestão de Escola para Anciãos de Congregação",
    description: "Plataforma avançada para automação de designações de oratória, gestão descentralizada de turmas e relatórios de progresso em Angola.",
    url: "https://eac.ao",
    siteName: "EAC",
    locale: "pt_AO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EAC — Gestão de Escola para Anciãos de Congregação",
    description: "Plataforma avançada para automação de designações de oratória e gestão de turmas.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
