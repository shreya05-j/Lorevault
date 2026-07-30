import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";
import { AmbientSoundscape } from "@/components/AmbientSoundscape";

export const metadata: Metadata = {
  title: "LoreVault | Chapter & Character Vault for Storytellers",
  description:
    "An aesthetic, lightweight alternative to Scrivener and Notion built specifically for fiction writers, poets, and worldbuilders. Built with Next.js, Django Architecture, and PostgreSQL.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#121417] text-[#e9ecef] antialiased min-h-screen selection:bg-amber-900/40 selection:text-amber-200">
        <Providers>
          <AmbientSoundscape />
          {children}
        </Providers>
      </body>
    </html>
  );
}
