"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, ScanLine, MoreHorizontal, FileScan, Loader2 } from "lucide-react";
import StatusChip from "@/components/StatusChip";
import { mad, statusTone } from "@/lib/format";
import ScannerModal from "@/components/ScannerModal";

const statutFilters = ["Toutes", "Brouillon", "Envoyée", "Accepté", "Refusé", "Expiré", "Converti"];

function DevisContent() {
  const searchParams = useSearchParams();
  const activeStatut = searchParams.get("statut") ?? "Toutes";
  const [devisList, setDevisList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDevis = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/quotations/`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results || []);
        
        // Map backend fields to frontend format
        const formattedList = list.map((d: any) => ({
          id: d.id,
          numero: d.quotation_number || "-",
          client: d.client_name || "Client inconnu",
          montant: parseFloat(d.total_amount) || 0,
          statut: d.status || "Brouillon",
          validiteJusquau: d.created_at ? new Date(d.created_at).toLocaleDateString('fr-FR') : "-",
        }));
        setDevisList(formattedList);
      } catch (err) {
        console.error("Error fetching devis", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDevis();
  }, []);

  const rows =
    activeStatut === "Toutes" ? devisList : devisList.filter((d) => d.statut === activeStatut);

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">
            Devis & Estimations
          </h1>
          <p className="text-[13px] text-ink-400">Créez et gérez vos devis</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              if (confirm("Voulez-vous vraiment vider toute la liste des devis ?")) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                await fetch(`${apiUrl}/api/quotations/clear/`, { method: "DELETE" });
                window.location.reload();
              }
            }}
            className="flex items-center gap-2 rounded-full border border-red-200 bg-red-500/10 px-5 py-2.5 text-[13.5px] font-semibold text-red-600 shadow-sm hover:border-red-300 hover:bg-red-500/20 active:scale-95 transition-all duration-300"
          >
            Vider
          </button>
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 rounded-full border border-ink-200/60 bg-white/50 px-5 py-2.5 text-[13.5px] font-semibold text-ink-700 shadow-sm hover:border-brass/40 hover:bg-white hover:text-brass-dark active:scale-95 transition-all duration-300"
          >
            <ScanLine size={16} /> IA Scanner
          </button>
          <Link
            href="/devis/nouveau"
            className="flex items-center gap-2 rounded-full bg-ink-900 px-6 py-2.5 text-[13.5px] font-semibold text-white shadow-lg hover:bg-ink-800 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
          >
            <Plus size={16} /> Créer un devis
          </Link>
        </div>
      </div>

      <div className="bento-card !p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {statutFilters.map((s) => (
              <Link
                key={s}
                href={s === "Toutes" ? "/devis" : `/devis?statut=${encodeURIComponent(s)}`}
                className={`rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-all ${
                  activeStatut === s
                    ? "bg-ink-900 text-white shadow-md"
                    : "bg-ink-50/50 text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
          <input
            type="text"
            placeholder="Rechercher des devis..."
            className="w-64 rounded-full border border-ink-200/50 bg-white/50 px-4 py-2 text-[13px] placeholder:text-ink-400 focus:border-brass/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brass/10 transition-all"
          />
        </div>

        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink-200/50 text-left text-[11px] uppercase tracking-wider text-ink-400">
              <th className="pb-3 pl-2 font-medium">Devis N°</th>
              <th className="pb-3 font-medium">Client</th>
              <th className="pb-3 font-medium">Montant</th>
              <th className="pb-3 font-medium">Statut</th>
              <th className="pb-3 font-medium">Valide jusqu'au</th>
              <th className="pb-3 font-medium text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/30">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-ink-400">
                  <div className="flex justify-center mb-2"><Loader2 className="animate-spin" /></div>
                  Chargement...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-ink-400">
                  Aucun devis pour ce statut.
                </td>
              </tr>
            ) : (
              rows.map((d) => (
                <tr key={d.id} className="group hover:bg-ink-100/50 transition-colors cursor-pointer">
                  <td className="py-4 pl-2">
                    <Link href={`/devis/${d.id}`} className="font-semibold text-ink-900 group-hover:text-brass transition-colors">
                      {d.numero}
                    </Link>
                  </td>
                  <td className="py-4 text-[13.5px] font-medium text-ink-700">{d.client}</td>
                  <td className="figure py-4 text-[14px] font-semibold text-ink-900">{mad(d.montant)}</td>
                  <td className="py-4">
                    <StatusChip tone={statusTone(d.statut)}>{d.statut}</StatusChip>
                  </td>
                  <td className="py-4 text-ink-500">{d.validiteJusquau}</td>
                  <td className="py-4 text-right pr-2">
                    <button className="rounded-full p-2 text-ink-400 hover:bg-ink-200/60 hover:text-ink-900 transition-all active:scale-95">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* IA Scanner Modal */}
      <ScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        targetType="devis" 
      />
    </div>
  );
}

export default function DevisPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-500">Chargement des devis...</div>}>
      <DevisContent />
    </Suspense>
  );
}
