"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Box, 
  Settings,
  CreditCard,
  Building2,
  Receipt
} from "lucide-react";

const navItems = [
  { href: "/", label: "Aperçu", icon: LayoutDashboard },
  { href: "/factures", label: "Factures", icon: FileText },
  { href: "/devis", label: "Devis", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/depenses", label: "Dépenses", icon: Receipt },
  { href: "/stocks", label: "Stocks", icon: Box },
];

const bottomNavItems = [
  { href: "/abonnement", label: "Abonnement", icon: CreditCard },
  { href: "/entreprise", label: "Mon Entreprise", icon: Building2 },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] h-full flex flex-col relative z-20">
      {/* Brand */}
      <div className="mb-8 px-3 mt-4">
        <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-ai shadow-glow">
              <span className="font-display text-[15px] font-bold text-white">F</span>
            </div>
            <span className="font-display text-[18px] font-semibold tracking-tight text-ink-900">
              Fatourati
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300 ${
                isActive
                  ? "bg-white/60 text-ink-900 shadow-sm backdrop-blur-md font-semibold"
                  : "text-ink-500 hover:bg-white/40 hover:text-ink-900"
              }`}
            >
              <item.icon size={16} className={isActive ? "text-brass" : "text-ink-400"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <nav className="space-y-1 px-2 mb-4">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300 ${
                isActive
                  ? "bg-white/60 text-ink-900 shadow-sm backdrop-blur-md font-semibold"
                  : "text-ink-500 hover:bg-white/40 hover:text-ink-900"
              }`}
            >
              <item.icon size={16} className={isActive ? "text-brass" : "text-ink-400"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <Link href="/entreprise" className="group flex flex-col items-start rounded-[24px] bg-white/40 p-3 mx-2 hover:bg-white/60 hover:shadow-spatial active:scale-95 transition-all duration-500 backdrop-blur-xl border border-white/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-ai opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
        <p className="text-[10px] font-medium text-ink-400 uppercase tracking-wider">Espace Pro</p>
        <p className="truncate text-[13.5px] font-semibold text-ink-900 mt-0.5">Fawatir Demo</p>
      </Link>
    </aside>
  );
}
