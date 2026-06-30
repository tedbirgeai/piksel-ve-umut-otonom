// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Piksel ve Umut — Otonom Eğitim Ekosistemi",
  description:
    "Yerel yapay zekâ (Ollama/Forge) ve merkeziyetsiz depolama (IPFS) ile tam bağımsız, pedagojik içerik üretim fabrikası ve dijital kütüphane.",
  keywords: [
    "otonom eğitim",
    "yerel yapay zeka",
    "IPFS",
    "pedagojik içerik",
    "merkeziyetsiz",
    "Piksel ve Umut",
  ],
  authors: [{ name: "Piksel ve Umut" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Piksel·Umut",
  },
  openGraph: {
    title: "Piksel ve Umut — Otonom Eğitim Ekosistemi",
    description:
      "Bilgiyi özgürleştiren, üretene hakkını veren bağımsız eğitim altyapısı.",
    type: "website",
    locale: "tr_TR",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF7F1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <ServiceWorkerRegister />
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
