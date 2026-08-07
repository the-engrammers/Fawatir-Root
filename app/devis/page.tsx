"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, ScanLine, MoreHorizontal, FileScan, Loader2, MessageSquare } from "lucide-react";
import StatusChip from "@/components/StatusChip";
import { mad, statusTone } from "@/lib/format";
import ScannerModal from "@/components/ScannerModal";
import WhatsAppSendModal from "@/components/WhatsAppSendModal";
import { clientsFull } from "@/lib/mock-data";

const statutFilters = ["Toutes", "Brouillon", "Envoyée", "Accepté", "Refusé", "Expiré", "Converti"];

function DevisContent() {
  const searchParams = useSearchParams();
  const activeStatut = searchParams.get("statut") ?? "Toutes";
  const [devisList, setDevisList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [selectedDevisForWhatsApp, setSelectedDevisForWhatsApp] = useState<any | null>(null);

  const fetchDevis = async () => {
    try {
      const res = await fetch(`/api/quotations?t=${Date.now()}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.results || []);
      
      // Map backend fields to frontend format
      const formattedList = list.map((d: any) => ({
        id: d.id,
        numero: d.quotation_number || "-",
        client: d.client_name || "Client inconnu",
        montant: parseFloat(d.total_amount) || 0,
        statut: d.status || "Brouillon",
        validiteJusquau: d.date ? new Date(d.date).toLocaleDateString('fr-FR') : "-",
      }));
      setDevisList(formattedList);
    } catch (err) {
      console.error("Error fetching devis", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevis();
    const handleDataUpdate = () => fetchDevis();
    window.addEventListener("dataUpdated", handleDataUpdate);
    return () => window.removeEventListener("dataUpdated", handleDataUpdate);
  }, []);

  const filteredDevis = devisList.filter((d) => {
    const matchesStatut = activeStatut === "Toutes" || d.statut === activeStatut;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (d.numero || "").toLowerCase().includes(term) ||
      (d.client || "").toLowerCase().includes(term);
    return matchesStatut && matchesSearch;
  });

  const rows = filteredDevis;

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Devis & Estimations
          </h1>
          <p className="text-[13px] text-slate-400">Créez, envoyez et suivez la validation de vos devis</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={async () => {
              if (confirm("Voulez-vous vraiment vider toute la liste des devis ?")) {
                await fetch("/api/quotations/clear", { method: "DELETE" });
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "quotations" } }));
                }
                fetchDevis();
              }
            }}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-[12.5px] font-semibold text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
          >
            Vider
          </button>
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-[12.5px] font-semibold text-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
          >
            <ScanLine size={16} className="text-amber-400" /> IA Scanner
          </button>
          <Link
            href="/devis/nouveau"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-[12.5px] font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
          >
            <Plus size={16} /> Créer un devis
          </Link>
        </div>
      </div>

      <div className="bento-card !p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {statutFilters.map((s) => (
              <Link
                key={s}
                href={s === "Toutes" ? "/devis" : `/devis?statut=${encodeURIComponent(s)}`}
                className={`rounded-xl px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                  activeStatut === s
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/30"
                    : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher des devis..."
            className="w-64 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-[13px] text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Devis N°</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Montant</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-3">Valide jusqu'au</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex justify-center mb-2"><Loader2 className="animate-spin text-indigo-400" /></div>
                    Chargement des devis...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Aucun devis pour ce statut.
                  </td>
                </tr>
              ) : (
                rows.map((d) => (
                  <tr key={d.id} className="group hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <Link href={`/devis/${d.id}`} className="font-mono font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
                        {d.numero}
                      </Link>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-200">{d.client}</td>
                    <td className="figure py-3.5 px-3 font-mono font-bold text-white">{mad(d.montant)}</td>
                    <td className="py-3.5 px-3">
                      <StatusChip tone={statusTone(d.statut)}>{d.statut}</StatusChip>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 text-[12.5px]">{d.validiteJusquau}</td>
                    <td className="py-3.5 px-3 text-right relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuOpen(actionMenuOpen === d.id ? null : d.id);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {actionMenuOpen === d.id && (
                        <div className="absolute right-2 top-10 z-20 w-44 rounded-xl bg-slate-900 shadow-2xl border border-slate-800 p-1.5 text-left animate-in fade-in zoom-in-95">
                          <Link
                            href={`/devis/${d.id}`}
                            className="block rounded-lg px-3 py-2 text-[12.5px] text-slate-200 hover:bg-slate-800 font-medium"
                          >
                            Voir le devis
                          </Link>
                          <Link
                            href={`/factures/nouvelle?from_devis=${d.id}`}
                            className="block rounded-lg px-3 py-2 text-[12.5px] text-indigo-400 hover:bg-slate-800 font-semibold"
                          >
                            Facturer le devis
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDevisForWhatsApp(d);
                              setActionMenuOpen(null);
                            }}
                            className="flex items-center gap-1.5 w-full text-left rounded-lg px-3 py-2 text-[12.5px] text-emerald-300 hover:bg-slate-800 font-medium"
                          >
                            <MessageSquare size={14} className="text-emerald-400" />
                            Envoyer sur WhatsApp
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm(`Supprimer le devis ${d.numero} ?`)) {
                                try {
                                  await fetch(`/api/quotations/${d.id}`, { method: "DELETE" });
                                } catch (err) {}
                                if (typeof window !== "undefined") {
                                  window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "quotations" } }));
                                }
                                fetchDevis();
                                setActionMenuOpen(null);
                              }
                            }}
                            className="block w-full text-left rounded-lg px-3 py-2 text-[12.5px] text-red-400 hover:bg-red-500/10 font-medium"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* IA Scanner Modal */}
      <ScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        targetType="devis" 
      />

      {/* WhatsApp Modal */}
      {selectedDevisForWhatsApp && (
        <WhatsAppSendModal
          isOpen={!!selectedDevisForWhatsApp}
          onClose={() => setSelectedDevisForWhatsApp(null)}
          documentType="devis"
          recipientName={selectedDevisForWhatsApp.client}
          recipientPhone={clientsFull.find((c) => c.nom === selectedDevisForWhatsApp.client)?.telephone || ""}
          documentNumber={selectedDevisForWhatsApp.numero}
          amount={selectedDevisForWhatsApp.montant}
          dueDate={selectedDevisForWhatsApp.validiteJusquau}
        />
      )}
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
