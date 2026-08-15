"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, Check, LogOut, Settings, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { fetchAPI } from "@/lib/api";

export default function Topbar() {
  const ref = useRef<HTMLDivElement>(null);
  const [openDropdown, setOpenDropdown] = useState<"lang" | "bell" | "profile" | null>(null);
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchStockAlerts();
  }, []);

  const fetchStockAlerts = async () => {
    try {
      const res = await fetchAPI("api/products/");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        
        // Filter track_inventory and quantity < 10 for stock alerts
        const alerts = list
          .filter((p: any) => p.track_inventory && (p.quantity ?? 0) < 10)
          .map((p: any) => ({
            id: p.id,
            title: p.quantity === 0 ? `Rupture : ${p.name}` : `Stock bas : ${p.name}`,
            description: p.quantity === 0 
              ? `Ce produit est complètement épuisé dans vos stocks.` 
              : `Il ne reste que ${p.quantity} unité(s) en stock (Alerte critique).`,
            time: "Alerte de stock",
            type: "danger",
            unread: true
          }));
          
        // Add a friendly system default notification if no alerts exist
        if (alerts.length === 0) {
          alerts.push({
            id: "system-ok",
            title: "Système IA Prêt",
            description: "Le chatbot FawatirAI est connecté et prêt à vous aider.",
            time: "Info",
            type: "info",
            unread: false
          });
        }
        
        setNotifications(alerts);
        setUnreadCount(alerts.filter((n: any) => n.unread).length);
      }
    } catch (err) {
      console.error("Error fetching stock alerts", err);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-white/40 px-6 py-4 z-40 relative">
      {/* Search Bar */}
      <div className="flex flex-1 items-center max-w-sm">
        <div className="relative w-full group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={14} className="text-ink-400 group-focus-within:text-brass transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full rounded-full border border-white/50 bg-white/30 py-2 pl-9 pr-3 text-[11px] text-ink-900 placeholder:text-ink-500 backdrop-blur-md transition-all duration-300 focus:border-white/80 focus:bg-white/60 focus:outline-none focus:ring-4 focus:ring-white/20 shadow-sm"
            placeholder="Rechercher une facture, un client..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-white/50 px-1.5 py-0.5 text-[9px] font-medium text-ink-500 font-mono">
              <span className="text-[10px]">⌘</span> K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div ref={ref} className="flex shrink-0 items-center gap-4 relative">
        
        {/* Language */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === "lang" ? null : "lang")}
            className="rounded-full border border-white/60 bg-white/30 px-2.5 py-1 text-[10px] font-bold text-ink-600 hover:bg-white/70 hover:text-ink-900 shadow-sm active:scale-95 transition-all duration-300"
          >
            FR
          </button>
          
          {openDropdown === "lang" && (
            <div className="absolute right-0 mt-2 w-28 rounded-xl border border-white/80 bg-white/80 backdrop-blur-[40px] p-1 shadow-spatial animate-in fade-in zoom-in-95 slide-in-from-top-2">
              <button className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-[11px] font-semibold text-ink-900 hover:bg-white/60 transition-colors">
                Français <Check size={12} className="text-brass" />
              </button>
              <button className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-[11px] font-medium text-ink-600 hover:bg-white/60 transition-colors">
                English
              </button>
              <button className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium text-ink-600 hover:bg-white/60 transition-colors">
                العربية
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === "bell" ? null : "bell")}
            className="relative rounded-full p-2 text-ink-500 hover:bg-white/40 hover:text-ink-900 transition-all duration-300 active:scale-95"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-status-danger ring-2 ring-white/60 animate-pulse" />
            )}
          </button>
          
          {openDropdown === "bell" && (
            <div className="absolute right-0 mt-2 w-80 rounded-3xl border border-white/80 bg-white/80 backdrop-blur-[40px] shadow-spatial animate-in fade-in zoom-in-95 slide-in-from-top-2 overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-ink-200/50 flex justify-between items-center bg-white/20">
                <h3 className="font-semibold text-ink-900 text-[14px]">Alertes & Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => {
                      setNotifications(notifications.map(n => ({ ...n, unread: false })));
                      setUnreadCount(0);
                    }}
                    className="text-[11px] font-medium text-brass hover:text-brass-dark"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                {notifications.length === 0 ? (
                  <p className="text-[12px] text-ink-400 text-center py-8">Aucune alerte active.</p>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => {
                        setNotifications(notifications.map(item => item.id === n.id ? { ...item, unread: false } : item));
                        setUnreadCount(prev => Math.max(0, prev - (n.unread ? 1 : 0)));
                      }}
                      className={`flex gap-3 p-3 hover:bg-white/50 rounded-2xl cursor-pointer transition-colors ${!n.unread ? 'opacity-60' : ''}`}
                    >
                      {n.unread && (
                        <div className="w-2 h-2 rounded-full bg-status-danger mt-1.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-[13px] text-ink-900 font-semibold">{n.title}</p>
                        <p className="text-[12px] text-ink-500 mt-0.5 leading-relaxed">{n.description}</p>
                        <p className="text-[10px] text-brass-dark mt-1 font-bold">{n.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === "profile" ? null : "profile")}
            className="flex items-center gap-2 rounded-full border border-white/60 bg-white/30 p-1 pr-3 hover:bg-white/60 shadow-sm active:scale-95 transition-all duration-300"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-ai text-[12px] font-bold text-white shadow-glow">
              FD
            </div>
            <span className="hidden text-[13px] font-semibold text-ink-900 md:block">
              Fawatir Demo
            </span>
            <ChevronDown size={14} className="text-ink-400" />
          </button>
          
          {openDropdown === "profile" && (
            <div className="absolute right-0 mt-2 w-56 rounded-3xl border border-white/80 bg-white/80 backdrop-blur-[40px] p-2 shadow-spatial animate-in fade-in zoom-in-95 slide-in-from-top-2">
              <div className="px-3 py-3 border-b border-ink-200/50 mb-1">
                <p className="text-[14px] font-semibold text-ink-900">Fawatir Demo</p>
                <p className="text-[12px] text-ink-500">demo@fawatir.ma</p>
              </div>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-ink-700 hover:bg-white/60 transition-colors">
                <User size={16} /> Mon Profil
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-ink-700 hover:bg-white/60 transition-colors">
                <Settings size={16} /> Paramètres
              </button>
              <div className="my-1 border-t border-ink-200/50" />
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-status-danger hover:bg-status-dangerBg transition-colors">
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
