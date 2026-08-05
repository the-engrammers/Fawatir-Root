import type { Metadata } from "next";
import "./globals.css";
import AuthHydrator from "@/components/AuthHydrator";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Fatourati | Tableau de bord",
  description: "Plateforme de facturation intelligente",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400..700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-fraunces: 'Fraunces', serif;
            --font-inter: 'Inter', sans-serif;
            --font-plex-mono: 'IBM Plex Mono', monospace;
          }
        `}} />
      </head>
      <body className="font-sans text-ink-900 bg-[#FAFAFA] min-h-screen selection:bg-brass selection:text-white antialiased overflow-hidden relative">
        <AuthHydrator />
        <div className="fixed inset-0 z-0 bg-spatial-bg opacity-70 pointer-events-none"></div>
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brass/5 blur-[120px] pointer-events-none"></div>
        <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none"></div>

        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}