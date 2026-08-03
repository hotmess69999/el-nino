import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NavShell } from "@/components/nav/NavShell";
import "./globals.css";
import styles from "./layout.module.css";

const SITE_URL = process.env["APP_BASE_URL"] ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "El Niño", template: "%s — El Niño" },
  description:
    "A weather-only social and information platform — an interactive globe, a vertical feed of real weather footage, localised official warnings, and Watch Zones. No disaster mode, no doomscrolling.",
  keywords: ["weather", "climate", "El Niño", "La Niña", "weather warnings", "storm tracking", "space weather"],
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: "/icon-192.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "El Niño",
    description: "A weather-only social and information platform.",
    url: SITE_URL,
    siteName: "El Niño",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "El Niño",
    description: "A weather-only social and information platform.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className={styles.skipLink}>
          Skip to main content
        </a>
        <NavShell />
        <main id="main-content" className={styles.content} tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
