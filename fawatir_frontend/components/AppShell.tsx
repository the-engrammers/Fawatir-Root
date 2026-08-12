"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import AssistantWidget from "@/components/AssistantWidget";
import ProtectedRoute from "@/components/ProtectedRoute";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Fix 1: Safe fallback to empty string prevents null reference crashes on load
  const currentPath = pathname ?? "";

  // Check if current route is public
  const isPublic = PUBLIC_PATHS.some(
    (path) => currentPath === path || currentPath.startsWith(`${path}/`)
  );

  // Fix 2: Render public pages directly WITHOUT ProtectedRoute blocking them
  if (isPublic) {
    return <main className="min-h-screen w-full relative z-10">{children}</main>;
  }

  // Private routes: Wrap inside ProtectedRoute and render dashboard shell
  return (
    <>
      {/* <ProtectedRoute> temporarily removed */}
      <div className="flex h-screen w-full relative z-10 p-3 lg:p-4 gap-4 overflow-hidden">
        
        {/* <Sidebar /> temporarily removed */}
        
        <main className="flex-1 flex flex-col h-full rounded-[32px] bg-white/40 shadow-spatial backdrop-blur-[60px] border border-white/60 overflow-hidden relative">
          
          {/* <Topbar /> temporarily removed */}
          
          <div className="flex-1 p-6 lg:p-8 overflow-y-auto custom-scrollbar relative z-10">
            {children}
          </div>
        </main>
      </div>
      {/* <AssistantWidget /> temporarily removed */}
      {/* </ProtectedRoute> temporarily removed */}
    </>
  );
