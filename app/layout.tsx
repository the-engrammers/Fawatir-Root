import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import AssistantWidget from "@/components/AssistantWidget";

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
    <html lang="fr" suppressHydrationWarning>
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
      <body suppressHydrationWarning className="font-sans text-slate-100 bg-[#0B0F19] min-h-screen antialiased overflow-hidden relative">
        {/* High-Tech Background Glows & Grid */}
        <div className="fixed inset-0 z-0 bg-dot-grid opacity-30 pointer-events-none" />
        <div className="fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none" />
        <div className="fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px] pointer-events-none" />

        <div className="flex h-screen relative z-10 p-2 sm:p-3 lg:p-4 gap-3 lg:gap-4">
          <Sidebar />
          <main className="flex-1 flex flex-col h-full rounded-2xl bg-slate-950/80 backdrop-blur-2xl border border-slate-800/80 shadow-2xl overflow-hidden relative">
            <Topbar />
            <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar relative z-10 bg-gradient-to-b from-slate-950/50 to-slate-900/30">
              {children}
            </div>
          </main>
        </div>
        <AssistantWidget />
      </body>
    </html>
  );
}
