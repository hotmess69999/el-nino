import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NavShell } from "@/components/nav/NavShell";
import "./globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "El Niño",
  description: "A weather-only social and information platform.",
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
