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

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

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
  if (!checked) return null;
  if (!isAuthenticated) return null; // TODO: login/register backend

  return <>{children}</>;
}