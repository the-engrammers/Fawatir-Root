"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, MessageSquare } from "lucide-react";
import StatusChip from "@/components/StatusChip";
import { mad, statusTone } from "@/lib/format";
import { facturesList, clientsFull, Facture } from "@/lib/mock-data";
import WhatsAppSendModal from "@/components/WhatsAppSendModal";

const statutFilters = ["Toutes", "Brouillon", "Envoyée", "Vue", "Payée", "En retard", "Annulée"];

export default function FacturesPage() {
  const [activeStatut, setActiveStatut] = useState("Toutes");
  const [searchTerm, setSearchTerm] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // WhatsApp Modal state
  const [selectedFactureForWhatsApp, setSelectedFactureForWhatsApp] = useState<any | null>(null);

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`/api/invoices?t=${Date.now()}`);
      const data = await res.json();
      const apiList = Array.isArray(data) ? data : (data.results || []);
      const formatted = apiList.map((inv: any) => ({
        id: inv.id,
        numero: inv.invoice_number || "FAC-000",
        client: inv.client_name || "Client",
        montant: parseFloat(inv.total_amount) || 0,
        statut: inv.status || "Brouillon",
        dateEmission: inv.date || new Date().toISOString().split("T")[0]
      }));
      setList(formatted);
    } catch (err) {
      console.error("Error fetching invoices", err);
      setList(facturesList);
    }
  };

  useEffect(() => {
    fetchInvoices();
    const handleDataUpdate = () => fetchInvoices();
    window.addEventListener("dataUpdated", handleDataUpdate);
    return () => window.removeEventListener("dataUpdated", handleDataUpdate);
  }, []);

  const rows = list.filter((f) => {
    const matchesStatut = activeStatut === "Toutes" || f.statut === activeStatut;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (f.numero || "").toLowerCase().includes(term) ||
      (f.client || "").toLowerCase().includes(term);
    return matchesStatut && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Factures</h1>
          <p className="text-[13px] text-slate-400">Créez, suivez et encaissez vos factures professionnelles</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={async () => {
              if (confirm("Voulez-vous vraiment vider toute la liste des factures ?")) {
                await fetch("/api/invoices/clear", { method: "DELETE" });
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "invoices" } }));
                }
                fetchInvoices();
              }
            }}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-[12.5px] font-semibold text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
          >
            Vider
          </button>
          <Link
            href="/factures/nouvelle"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus size={16} /> Nouvelle facture
          </Link>
        </div>
      </div>

      <div className="bento-card !p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {statutFilters.map((s) => (
              <button
                key={s}
                onClick={() => setActiveStatut(s)}
                className={`rounded-xl px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                  activeStatut === s
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/30"
                    : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une facture..."
              className="w-64 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-[13px] text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Facture N°</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Montant</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-3">Date d'émission</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rows.map((f) => (
                <tr key={f.id} className="group hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3">
                    <Link href={`/factures/${f.id}`} className="font-mono font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
                      {f.numero}
                    </Link>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-200">{f.client}</td>
                  <td className="figure py-3.5 px-3 font-mono font-bold text-white">{mad(f.montant)}</td>
                  <td className="py-3.5 px-3">
                    <StatusChip tone={statusTone(f.statut)}>{f.statut}</StatusChip>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 text-[12.5px]">{f.dateEmission}</td>
                  <td className="py-3.5 px-3 text-right relative">
                    <button 
                      onClick={() => setActionMenuOpen(actionMenuOpen === f.id ? null : f.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {actionMenuOpen === f.id && (
                      <div className="absolute right-2 top-10 z-20 w-48 rounded-xl bg-slate-900 shadow-2xl border border-slate-800 p-1.5 text-left animate-in fade-in zoom-in-95">
                        <Link 
                          href={`/factures/${f.id}`}
                          className="block rounded-lg px-3 py-2 text-[12.5px] text-slate-200 hover:bg-slate-800 font-medium"
                        >
                          Voir la facture
                        </Link>
                        <button
                          onClick={() => {
                            window.print();
                            setActionMenuOpen(null);
                          }}
                          className="block w-full text-left rounded-lg px-3 py-2 text-[12.5px] text-indigo-300 hover:bg-slate-800 font-medium"
                        >
                          Télécharger PDF
                        </button>
                        <button
                          onClick={() => {
                            setList(prev => prev.map(item => item.id === f.id ? { ...item, statut: "Payée" } : item));
                            setActionMenuOpen(null);
                          }}
                          className="block w-full text-left rounded-lg px-3 py-2 text-[12.5px] text-emerald-400 hover:bg-emerald-500/10 font-medium"
                        >
                          Marquer comme Payée
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFactureForWhatsApp(f);
                            setActionMenuOpen(null);
                          }}
                          className="flex items-center gap-1.5 w-full text-left rounded-lg px-3 py-2 text-[12.5px] text-emerald-300 hover:bg-slate-800 font-medium"
                        >
                          <MessageSquare size={14} className="text-emerald-400" />
                          Envoyer sur WhatsApp
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Supprimer la facture ${f.numero} ?`)) {
                              try {
                                await fetch(`/api/invoices/${f.id}`, { method: "DELETE" });
                              } catch (err) {}
                              if (typeof window !== "undefined") {
                                window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "invoices" } }));
                              }
                              fetchInvoices();
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
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Aucune facture pour ce statut.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {selectedFactureForWhatsApp && (
        <WhatsAppSendModal
          isOpen={!!selectedFactureForWhatsApp}
          onClose={() => setSelectedFactureForWhatsApp(null)}
          documentType={selectedFactureForWhatsApp.statut === "En retard" ? "relance" : "facture"}
          recipientName={selectedFactureForWhatsApp.client}
          recipientPhone={clientsFull.find((c) => c.nom === selectedFactureForWhatsApp.client || c.id === selectedFactureForWhatsApp.clientId)?.telephone || ""}
          documentNumber={selectedFactureForWhatsApp.numero}
          amount={selectedFactureForWhatsApp.montant}
          dueDate={selectedFactureForWhatsApp.dateEcheance}
        />
      )}
    </div>
  );
}
