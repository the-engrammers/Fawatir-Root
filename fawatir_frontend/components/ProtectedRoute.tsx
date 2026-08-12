"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [checked, setChecked] = useState(false);

  // Safely check pathname in case it hasn't hydrated yet
  const isPublic = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated && !isPublic) {
        // router.push("/login"); // TODO: عاود فعّلها ملي يكمل login/register ف backend
      }
      setChecked(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isPublic, router]);

  if (isPublic) return <>{children}</>;
  
  // Show a smooth spinner instead of a blank screen while checking
  if (!checked) return (
    <div className="flex h-screen w-full items-center justify-center bg-transparent">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-ink-900" />
    </div>
  );

  // 🐛 THE FIX: We comment this out temporarily so you can see your dashboard.
  // 🐛 Uncomment this when your backend auth is ready!
  // if (!isAuthenticated) return null; // TODO: login/register backend

  return <>{children}</>;
}
