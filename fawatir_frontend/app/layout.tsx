import type { Metadata } from "next";
import { Inter, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css"; // <--- This brings your styles back!
import AuthHydrator from "@/components/AuthHydrator";
import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body className="font-sans text-ink-900 bg-[#FAFAFA] min-h-screen h-screen w-full selection:bg-brass selection:text-white antialiased overflow-hidden relative">
        <AuthHydrator />
        <div className="fixed inset-0 z-0 bg-spatial-bg opacity-70 pointer-events-none" />
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brass/5 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
