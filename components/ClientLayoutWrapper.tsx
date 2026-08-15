"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import AssistantWidget from "@/components/AssistantWidget";
import AuthHydrator from "@/components/AuthHydrator";
import ProtectedRoute from "@/components/ProtectedRoute";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname.endsWith("/print");

  // If it's a public path or a print page, don't show the dashboard shell.
  if (isPublic) {
    return (
      <div className="flex-1 w-full h-screen overflow-y-auto">
        <AuthHydrator />
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
      </div>
    );
  }

  // Otherwise, render the full Dashboard shell
  return (
    <div className="flex h-screen relative z-10 p-2 sm:p-3 lg:p-4 gap-3 lg:gap-4">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full rounded-2xl bg-slate-950/80 backdrop-blur-2xl border border-slate-800/80 shadow-2xl overflow-hidden relative">
        <Topbar />
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar relative z-10 bg-gradient-to-b from-slate-950/50 to-slate-900/30">
          <AuthHydrator />
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        </div>
      </main>
      <AssistantWidget />
    </div>
  );
}
