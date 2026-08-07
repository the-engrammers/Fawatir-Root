"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import AssistantWidget from "@/components/AssistantWidget";
import ProtectedRoute from "@/components/ProtectedRoute";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (isPublic) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen relative z-10 p-3 lg:p-4 gap-4">
        <Sidebar />
        <main className="flex-1 flex flex-col h-full rounded-[32px] bg-white/40 shadow-spatial backdrop-blur-[60px] border border-white/60 overflow-hidden relative">
          <Topbar />
          <div className="flex-1 p-6 lg:p-8 overflow-y-auto custom-scrollbar relative z-10">
            {children}
          </div>
        </main>
      </div>
      <AssistantWidget />
    </ProtectedRoute>
  );
}
